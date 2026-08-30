import type {PropsWithChildren} from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {act, renderHook, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestQueryClient} from '../test/render';
import {
    useAppraisal,
    useAppraisals,
    useComparableLeases,
    useComparableSales,
    useCreateAppraisal,
    useDeleteAppraisal,
    useFile,
    useFiles,
    useUpdateAppraisal,
    useUpdateFile,
} from './hooks';
import {appraisalsApi, comparableLeasesApi, comparableSalesApi, filesApi} from './resources';
import {queryKeys} from './queryKeys';

vi.mock('./resources', () => ({
    appraisalsApi: {list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn()},
    comparableSalesApi: {list: vi.fn()},
    comparableLeasesApi: {list: vi.fn()},
    filesApi: {list: vi.fn(), get: vi.fn(), update: vi.fn()},
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

    it('deletes an appraisal and refreshes the collection', async () => {
        vi.mocked(appraisalsApi.remove).mockResolvedValue();
        const {client, wrapper} = harness();
        const invalidate = vi.spyOn(client, 'invalidateQueries');
        const hook = renderHook(() => useDeleteAppraisal(), {wrapper});
        await act(async () => void await hook.result.current.mutateAsync('a'));
        expect(appraisalsApi.remove).toHaveBeenCalledWith('a');
        expect(invalidate).toHaveBeenCalledWith({queryKey: queryKeys.appraisals});
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
});
