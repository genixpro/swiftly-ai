import type {PropsWithChildren} from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {act, renderHook, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestQueryClient} from '../test/render';
import {
    useAppraisal,
    useAppraisals,
    useComparableLeases,
    useComparableLeasesByIds,
    useComparableSales,
    useComparableSalesByIds,
    useImportComparableSales,
    useCreateComparableLease,
    useCreateComparableSale,
    useDeleteComparableLease,
    useDeleteComparableSale,
    useSaveComparableSalePortfolio,
    useCreateAppraisal,
    useConvertTenants,
    useDeleteAppraisal,
    useDeleteFile,
    useFile,
    useFiles,
    useUpdateAppraisal,
    useUpdateComparableLease,
    useUpdateComparableSale,
    useUpdateFile,
    useUploadFile,
    useUploadImage,
    useFileLoader,
    useUpdateZone,
    useZone,
    useCreateZone,
    useZoneSearch,
    useCreatePropertyTag,
    useDeletePropertyTag,
    usePropertyTags,
    usePropertyTagSearch,
    useTenantNameSearch,
} from './hooks';
import {appraisalsApi, comparableLeasesApi, comparableSalesApi, filesApi, imagesApi, tagsApi, tenantNamesApi, zonesApi} from './resources';
import {queryKeys} from './queryKeys';

vi.mock('./resources', () => ({
    appraisalsApi: {list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), convertTenants: vi.fn()},
    comparableSalesApi: {list: vi.fn(), getMany: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), import: vi.fn(), savePortfolio: vi.fn()},
    comparableLeasesApi: {list: vi.fn(), getMany: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn()},
    filesApi: {list: vi.fn(), get: vi.fn(), upload: vi.fn(), update: vi.fn(), remove: vi.fn()},
    imagesApi: {upload: vi.fn()},
    zonesApi: {get: vi.fn(), list: vi.fn(), create: vi.fn(), update: vi.fn()},
    tagsApi: {list: vi.fn(), create: vi.fn(), remove: vi.fn()},
    tenantNamesApi: {list: vi.fn()},
}));

function harness() {
    const client = createTestQueryClient();
    const wrapper = ({children}: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    return {client, wrapper};
}

beforeEach(() => vi.clearAllMocks());

describe('query hooks', () => {
    it('loads appraisal collections and individual appraisals with stable keys', async () => {
        vi.mocked(appraisalsApi.list).mockResolvedValue([{_id: 'a'}]);
        vi.mocked(appraisalsApi.get).mockResolvedValue({_id: 'a', name: 'Appraisal'});
        const {client, wrapper} = harness();

        const list = renderHook(() => useAppraisals(), {wrapper});
        const detail = renderHook(() => useAppraisal('a'), {wrapper});
        await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
        await waitFor(() => expect(detail.result.current.isSuccess).toBe(true));

        expect(list.result.current.data).toEqual([{_id: 'a'}]);
        expect(detail.result.current.data?.name).toBe('Appraisal');
        expect(client.getQueryData(queryKeys.appraisal('a'))).toEqual({_id: 'a', name: 'Appraisal'});
    });

    it('does not request an appraisal until an id exists', () => {
        const {wrapper} = harness();
        const hook = renderHook(() => useAppraisal(''), {wrapper});
        expect(hook.result.current.fetchStatus).toBe('idle');
        expect(appraisalsApi.get).not.toHaveBeenCalled();
    });

    it('loads files and comparable resources with the unchanged filters', async () => {
        vi.mocked(filesApi.list).mockResolvedValue([{_id: 'f', fileName: 'lease.pdf'}]);
        vi.mocked(comparableSalesApi.list).mockResolvedValue([{_id: 's'}]);
        vi.mocked(comparableLeasesApi.list).mockResolvedValue([{_id: 'l'}]);
        const {wrapper} = harness();

        const files = renderHook(() => useFiles('a', 'lease'), {wrapper});
        const sales = renderHook(() => useComparableSales({propertyType: 'office'}), {wrapper});
        const leases = renderHook(() => useComparableLeases({tenantName: 'Acme'}), {wrapper});
        await waitFor(() => expect(files.result.current.isSuccess).toBe(true));
        await waitFor(() => expect(sales.result.current.isSuccess).toBe(true));
        await waitFor(() => expect(leases.result.current.isSuccess).toBe(true));

        expect(filesApi.list).toHaveBeenCalledWith('a', 'lease');
        expect(comparableSalesApi.list).toHaveBeenCalledWith({propertyType: 'office'});
        expect(comparableLeasesApi.list).toHaveBeenCalledWith({tenantName: 'Acme'});
    });

    it('loads selected comparables with their ordered identifiers', async () => {
        vi.mocked(comparableSalesApi.getMany).mockResolvedValue([{_id: 's-2'}, {_id: 's-1'}]);
        vi.mocked(comparableLeasesApi.getMany).mockResolvedValue([{_id: 'l-2'}, {_id: 'l-1'}]);
        const {wrapper} = harness();

        const sales = renderHook(() => useComparableSalesByIds(['s-2', 's-1']), {wrapper});
        const leases = renderHook(() => useComparableLeasesByIds(['l-2', 'l-1']), {wrapper});
        await waitFor(() => expect(sales.result.current.isSuccess).toBe(true));
        await waitFor(() => expect(leases.result.current.isSuccess).toBe(true));

        expect(comparableSalesApi.getMany).toHaveBeenCalledWith(['s-2', 's-1']);
        expect(comparableLeasesApi.getMany).toHaveBeenCalledWith(['l-2', 'l-1']);
    });

    it('keeps database list queries dormant until a search supplies filters', () => {
        const {wrapper} = harness();
        const sales = renderHook(() => useComparableSales({}, {enabled: false}), {wrapper});
        const leases = renderHook(() => useComparableLeases({}, {enabled: false}), {wrapper});

        expect(sales.result.current.fetchStatus).toBe('idle');
        expect(leases.result.current.fetchStatus).toBe('idle');
        expect(comparableSalesApi.list).not.toHaveBeenCalled();
        expect(comparableLeasesApi.list).not.toHaveBeenCalled();
    });

    it('sends exact comparable mutations and invalidates their resource families only after success', async () => {
        vi.mocked(comparableSalesApi.create).mockResolvedValue('sale-1');
        vi.mocked(comparableSalesApi.update).mockResolvedValue();
        vi.mocked(comparableSalesApi.remove).mockResolvedValue();
        vi.mocked(comparableSalesApi.savePortfolio).mockResolvedValue({_id: 'portfolio-1'});
        vi.mocked(comparableLeasesApi.create).mockResolvedValue('lease-1');
        vi.mocked(comparableLeasesApi.update).mockResolvedValue();
        vi.mocked(comparableLeasesApi.remove).mockResolvedValue();
        const {client, wrapper} = harness();
        const invalidate = vi.spyOn(client, 'invalidateQueries');
        const saleCreate = renderHook(() => useCreateComparableSale(), {wrapper});
        const saleUpdate = renderHook(() => useUpdateComparableSale(), {wrapper});
        const saleDelete = renderHook(() => useDeleteComparableSale(), {wrapper});
        const salePortfolio = renderHook(() => useSaveComparableSalePortfolio(), {wrapper});
        const leaseCreate = renderHook(() => useCreateComparableLease(), {wrapper});
        const leaseUpdate = renderHook(() => useUpdateComparableLease(), {wrapper});
        const leaseDelete = renderHook(() => useDeleteComparableLease(), {wrapper});

        await act(async () => {
            await saleCreate.result.current.mutateAsync({address: 'Sale'});
            await saleUpdate.result.current.mutateAsync({id: 'sale-1', payload: {salePrice: 100}});
            await saleDelete.result.current.mutateAsync('sale-1');
            await salePortfolio.result.current.mutateAsync({portfolio: {address: 'Portfolio'}, subComps: [{address: 'Child'}]});
            await leaseCreate.result.current.mutateAsync({address: 'Lease'});
            await leaseUpdate.result.current.mutateAsync({id: 'lease-1', payload: {tenantName: 'Acme'}});
            await leaseDelete.result.current.mutateAsync('lease-1');
        });

        expect(comparableSalesApi.create).toHaveBeenCalledWith({address: 'Sale'});
        expect(comparableSalesApi.update).toHaveBeenCalledWith('sale-1', {salePrice: 100});
        expect(comparableSalesApi.remove).toHaveBeenCalledWith('sale-1');
        expect(comparableSalesApi.savePortfolio).toHaveBeenCalledWith({address: 'Portfolio'}, [{address: 'Child'}]);
        expect(comparableLeasesApi.create).toHaveBeenCalledWith({address: 'Lease'});
        expect(comparableLeasesApi.update).toHaveBeenCalledWith('lease-1', {tenantName: 'Acme'});
        expect(comparableLeasesApi.remove).toHaveBeenCalledWith('lease-1');
        expect(invalidate).toHaveBeenCalledWith({queryKey: ['comparable-sales']});
        expect(invalidate).toHaveBeenCalledWith({queryKey: ['comparable-leases']});
    });

    it('imports comparable sales through the existing endpoint without changing cached search results', async () => {
        const result = {comparableSales: [{_id: 'sale-1'}], file: {_id: 'file-1', fileName: 'sales.xlsx'}};
        vi.mocked(comparableSalesApi.import).mockResolvedValue(result);
        const {client, wrapper} = harness();
        const invalidate = vi.spyOn(client, 'invalidateQueries');
        const hook = renderHook(() => useImportComparableSales(), {wrapper});
        const form = new FormData();
        form.set('fileName', 'sales.xlsx');

        await act(async () => {
            expect(await hook.result.current.mutateAsync(form)).toEqual(result);
        });

        expect(comparableSalesApi.import).toHaveBeenCalledWith(form);
        expect(invalidate).not.toHaveBeenCalled();
    });

    it('creates an appraisal and invalidates the collection', async () => {
        vi.mocked(appraisalsApi.create).mockResolvedValue('new-id');
        const {client, wrapper} = harness();
        const invalidate = vi.spyOn(client, 'invalidateQueries');
        const hook = renderHook(() => useCreateAppraisal(), {wrapper});

        await act(async () => {
            expect(await hook.result.current.mutateAsync({name: 'New'})).toBe('new-id');
        });
        expect(appraisalsApi.create).toHaveBeenCalledWith({name: 'New'});
        expect(invalidate).toHaveBeenCalledWith({queryKey: queryKeys.appraisals});
    });

    it('updates the detail cache without introducing optimistic state', async () => {
        vi.mocked(appraisalsApi.update).mockResolvedValue({_id: 'a', name: 'Updated'});
        const {client, wrapper} = harness();
        const hook = renderHook(() => useUpdateAppraisal('a'), {wrapper});
        expect(client.getQueryData(queryKeys.appraisal('a'))).toBeUndefined();

        await act(async () => {
            await hook.result.current.mutateAsync({name: 'Updated'});
        });
        expect(client.getQueryData(queryKeys.appraisal('a'))).toEqual({_id: 'a', name: 'Updated'});
    });

    it('lets a compatibility workspace retain authority over its committed draft', async () => {
        vi.mocked(appraisalsApi.update).mockResolvedValue({_id: 'a', name: 'Updated'});
        const {client, wrapper} = harness();
        const hook = renderHook(() => useUpdateAppraisal('a', {updateCache: false}), {wrapper});

        await act(async () => {
            await hook.result.current.mutateAsync({name: 'Updated'});
        });

        expect(client.getQueryData(queryKeys.appraisal('a'))).toBeUndefined();
    });

    it('deletes an appraisal and refreshes the collection', async () => {
        vi.mocked(appraisalsApi.remove).mockResolvedValue();
        const {client, wrapper} = harness();
        const invalidate = vi.spyOn(client, 'invalidateQueries');
        const hook = renderHook(() => useDeleteAppraisal(), {wrapper});
        await act(async () => void await hook.result.current.mutateAsync('a'));
        expect(appraisalsApi.remove).toHaveBeenCalledWith('a');
        expect(invalidate).toHaveBeenCalledWith({queryKey: queryKeys.appraisals});
    });

    it('converts rent-roll tenants through the existing appraisal endpoint without retrying', async () => {
        vi.mocked(appraisalsApi.convertTenants).mockResolvedValue(['lease-1']);
        const {wrapper} = harness();
        const hook = renderHook(() => useConvertTenants(), {wrapper});

        await act(async () => {
            expect(await hook.result.current.mutateAsync('a')).toEqual(['lease-1']);
        });

        expect(appraisalsApi.convertTenants).toHaveBeenCalledWith('a');
    });

    it('loads and updates one file while preserving its exact payload', async () => {
        vi.mocked(filesApi.get).mockResolvedValue({_id: 'f', fileName: 'lease.pdf'});
        vi.mocked(filesApi.update).mockResolvedValue({_id: 'f', fileName: 'lease.pdf', extractedData: {term: 10}});
        const {client, wrapper} = harness();
        const file = renderHook(() => useFile('a', 'f'), {wrapper});
        await waitFor(() => expect(file.result.current.isSuccess).toBe(true));
        expect(filesApi.get).toHaveBeenCalledWith('a', 'f');

        const update = renderHook(() => useUpdateFile('a', 'f'), {wrapper});
        await act(async () => void await update.result.current.mutateAsync({extractedData: {term: 10}}));
        expect(filesApi.update).toHaveBeenCalledWith('a', 'f', {extractedData: {term: 10}});
        expect(client.getQueryData(queryKeys.file('a', 'f'))).toMatchObject({extractedData: {term: 10}});
    });

    it('loads a preview file only when a legacy panel explicitly requests it', async () => {
        vi.mocked(filesApi.get).mockResolvedValue({_id: 'f', fileName: 'statement.pdf'});
        const {client, wrapper} = harness();
        const loader = renderHook(() => useFileLoader(), {wrapper});

        await act(async () => {
            expect(await loader.result.current('a', 'f')).toEqual({_id: 'f', fileName: 'statement.pdf'});
        });

        expect(filesApi.get).toHaveBeenCalledWith('a', 'f');
        expect(client.getQueryData(queryKeys.file('a', 'f'))).toEqual({_id: 'f', fileName: 'statement.pdf'});
    });

    it('loads and updates a zone through the existing endpoint without changing its local editor draft', async () => {
        vi.mocked(zonesApi.get).mockResolvedValue({_id: 'zone-1', zoneName: 'Commercial', description: 'Original'});
        vi.mocked(zonesApi.update).mockResolvedValue();
        const {client, wrapper} = harness();
        const zone = renderHook(() => useZone('zone-1'), {wrapper});
        await waitFor(() => expect(zone.result.current.isSuccess).toBe(true));
        expect(zonesApi.get).toHaveBeenCalledWith('zone-1');

        const update = renderHook(() => useUpdateZone('zone-1'), {wrapper});
        const payload = {_id: 'zone-1', zoneName: 'Commercial', description: 'Updated'};
        await act(async () => void await update.result.current.mutateAsync(payload));

        expect(zonesApi.update).toHaveBeenCalledWith('zone-1', payload);
        expect(client.getQueryData(queryKeys.zone('zone-1'))).toEqual({_id: 'zone-1', zoneName: 'Commercial', description: 'Original'});
    });

    it('keeps zone search and creation on their existing request contracts', async () => {
        vi.mocked(zonesApi.list).mockResolvedValue([{_id: 'zone-2', zoneName: 'Industrial'}]);
        vi.mocked(zonesApi.create).mockResolvedValue('zone-3');
        const {client, wrapper} = harness();
        const search = renderHook(() => useZoneSearch(), {wrapper});
        const create = renderHook(() => useCreateZone(), {wrapper});

        await act(async () => {
            expect(await search.result.current('Industrial')).toEqual([{_id: 'zone-2', zoneName: 'Industrial'}]);
            expect(await create.result.current.mutateAsync({zoneName: 'Industrial', description: ''})).toBe('zone-3');
        });

        expect(zonesApi.list).toHaveBeenCalledWith('Industrial');
        expect(zonesApi.create).toHaveBeenCalledWith({zoneName: 'Industrial', description: ''});
        expect(client.getQueryData(queryKeys.zones('Industrial'))).toEqual([{_id: 'zone-2', zoneName: 'Industrial'}]);
    });

    it('keeps property-tag defaults, search, create, and delete on their existing resource contracts', async () => {
        vi.mocked(tagsApi.list).mockResolvedValue([{_id: 'tag-1', name: 'Office'}]);
        vi.mocked(tagsApi.create).mockResolvedValue('tag-2');
        vi.mocked(tagsApi.remove).mockResolvedValue();
        const {client, wrapper} = harness();
        const defaults = renderHook(() => usePropertyTags({propertyType: 'industrial'}), {wrapper});
        const search = renderHook(() => usePropertyTagSearch(), {wrapper});
        const create = renderHook(() => useCreatePropertyTag(), {wrapper});
        const remove = renderHook(() => useDeletePropertyTag(), {wrapper});
        await waitFor(() => expect(defaults.result.current.isSuccess).toBe(true));

        await act(async () => {
            expect(await search.result.current({name: 'Office', propertyType: 'industrial'})).toEqual([{_id: 'tag-1', name: 'Office'}]);
            expect(await create.result.current.mutateAsync({name: 'Retail', propertyType: 'industrial'})).toBe('tag-2');
            await remove.result.current.mutateAsync('tag-1');
        });

        expect(tagsApi.list).toHaveBeenCalledWith({propertyType: 'industrial'});
        expect(tagsApi.list).toHaveBeenCalledWith({name: 'Office', propertyType: 'industrial'});
        expect(tagsApi.create).toHaveBeenCalledWith({name: 'Retail', propertyType: 'industrial'});
        expect(tagsApi.remove).toHaveBeenCalledWith('tag-1');
        expect(client.getQueryData(queryKeys.propertyTags({propertyType: 'industrial'}))).toEqual([{_id: 'tag-1', name: 'Office'}]);
    });

    it('keeps tenant-name lookup on its existing input query contract', async () => {
        vi.mocked(tenantNamesApi.list).mockResolvedValue(['Morgan Stanley']);
        const {client, wrapper} = harness();
        const search = renderHook(() => useTenantNameSearch(), {wrapper});

        await act(async () => {
            expect(await search.result.current('Morgan')).toEqual(['Morgan Stanley']);
        });

        expect(tenantNamesApi.list).toHaveBeenCalledWith('Morgan');
        expect(client.getQueryData(queryKeys.tenantNames('Morgan'))).toEqual(['Morgan Stanley']);
    });

    it('uploads a file through the existing endpoint and refreshes appraisal file lists only after success', async () => {
        vi.mocked(filesApi.upload).mockResolvedValue({_id: 'f', fileName: 'lease.pdf'});
        const {client, wrapper} = harness();
        const invalidate = vi.spyOn(client, 'invalidateQueries');
        const hook = renderHook(() => useUploadFile('a'), {wrapper});
        const form = new FormData();
        form.set('fileName', 'lease.pdf');

        await act(async () => {
            await hook.result.current.mutateAsync(form);
        });

        expect(filesApi.upload).toHaveBeenCalledWith('a', form);
        expect(invalidate).toHaveBeenCalledWith({queryKey: ['appraisals', 'a', 'file-list']});
    });

    it('uploads property images through the existing endpoint without creating unrelated cache updates', async () => {
        vi.mocked(imagesApi.upload).mockResolvedValue('/images/building.png');
        const {client, wrapper} = harness();
        const invalidate = vi.spyOn(client, 'invalidateQueries');
        const hook = renderHook(() => useUploadImage(), {wrapper});
        const form = new FormData();
        form.set('fileName', 'building.png');

        await act(async () => {
            expect(await hook.result.current.mutateAsync(form)).toBe('/images/building.png');
        });

        expect(imagesApi.upload).toHaveBeenCalledWith(form);
        expect(invalidate).not.toHaveBeenCalled();
    });

    it('deletes a file through its existing endpoint and invalidates all appraisal file lists', async () => {
        vi.mocked(filesApi.remove).mockResolvedValue();
        const {client, wrapper} = harness();
        const invalidate = vi.spyOn(client, 'invalidateQueries');
        const hook = renderHook(() => useDeleteFile('a'), {wrapper});

        await act(async () => void await hook.result.current.mutateAsync('f'));

        expect(filesApi.remove).toHaveBeenCalledWith('a', 'f');
        expect(invalidate).toHaveBeenCalledWith({queryKey: ['appraisals', 'a', 'file-list']});
    });
});
