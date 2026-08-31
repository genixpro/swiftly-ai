import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {appraisalsApi, comparableLeasesApi, comparableSalesApi, filesApi, imagesApi, tagsApi, tenantNamesApi, zonesApi} from './resources';
import {queryKeys} from './queryKeys';
import type {CreatePayload, UpdatePayload} from './types';

interface UseUpdateAppraisalOptions {
    /**
     * Compatibility workspaces manage their own committed draft until every
     * legacy screen has migrated. They opt out so an older mutation response
     * cannot overwrite a newer in-memory edit through the query cache.
     */
    updateCache?: boolean;
}

export function useAppraisals() {
    return useQuery({queryKey: queryKeys.appraisals, queryFn: () => appraisalsApi.list()});
}

export function useAppraisal(id: string) {
    return useQuery({queryKey: queryKeys.appraisal(id), queryFn: () => appraisalsApi.get(id), enabled: Boolean(id)});
}

export function useCreateAppraisal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreatePayload) => appraisalsApi.create(payload),
        onSuccess: () => queryClient.invalidateQueries({queryKey: queryKeys.appraisals}),
    });
}

export function useUpdateAppraisal(id: string, {updateCache = true}: UseUpdateAppraisalOptions = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdatePayload) => appraisalsApi.update(id, payload),
        onSuccess: (appraisal) => {
            if (updateCache) queryClient.setQueryData(queryKeys.appraisal(id), appraisal);
            void queryClient.invalidateQueries({queryKey: queryKeys.appraisals});
        },
    });
}

export function useDeleteAppraisal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => appraisalsApi.remove(id),
        onSuccess: () => queryClient.invalidateQueries({queryKey: queryKeys.appraisals}),
    });
}

/** Keeps the rent-roll tenant export on the existing POST contract without leaking the resource client into a view. */
export function useConvertTenants() {
    return useMutation({
        mutationFn: (appraisalId: string) => appraisalsApi.convertTenants(appraisalId),
        retry: false,
    });
}

export function useFiles(appraisalId: string, type?: string) {
    return useQuery({
        queryKey: queryKeys.files(appraisalId, type),
        queryFn: () => filesApi.list(appraisalId, type),
        enabled: Boolean(appraisalId),
    });
}

/** Uploads one file without optimistic list updates; upload screens explicitly refresh once their batch settles. */
export function useUploadFile(appraisalId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (form: FormData) => filesApi.upload(appraisalId, form),
        retry: false,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['appraisals', appraisalId, 'file-list']}),
    });
}

/** Property images are consumed by their local editable draft, so uploads deliberately do not update unrelated caches. */
export function useUploadImage() {
    return useMutation({
        mutationFn: (form: FormData) => imagesApi.upload(form),
        retry: false,
    });
}

export function useFile(appraisalId: string, fileId: string) {
    return useQuery({
        queryKey: queryKeys.file(appraisalId, fileId),
        queryFn: () => filesApi.get(appraisalId, fileId),
        enabled: Boolean(appraisalId && fileId),
    });
}

/** Imperative file read for legacy preview panels that must not acquire a new mount-time loading transition. */
export function useFileLoader() {
    const queryClient = useQueryClient();
    return (appraisalId: string, fileId: string) => queryClient.fetchQuery({
        queryKey: queryKeys.file(appraisalId, fileId),
        queryFn: () => filesApi.get(appraisalId, fileId),
        staleTime: 0,
    });
}

export function useZone(id: string) {
    return useQuery({
        queryKey: queryKeys.zone(id),
        queryFn: () => zonesApi.get(id),
        enabled: Boolean(id),
    });
}

/** Zone editors retain their own immediate draft, so updates deliberately do not overwrite query data. */
export function useUpdateZone(id: string) {
    return useMutation({
        mutationFn: (payload: UpdatePayload) => zonesApi.update(id, payload),
        retry: false,
    });
}

/** Fetches an async-select result set on demand, preserving the selector's per-input request timing. */
export function useZoneSearch() {
    const queryClient = useQueryClient();
    return (search: string) => queryClient.fetchQuery({
        queryKey: queryKeys.zones(search),
        queryFn: () => zonesApi.list(search),
    });
}

/** Creates a zone without changing a selector's immediate selected option or local list state. */
export function useCreateZone() {
    return useMutation({
        mutationFn: (payload: CreatePayload) => zonesApi.create(payload),
        retry: false,
    });
}

export function usePropertyTags(filters: Record<string, unknown> = {}) {
    return useQuery({
        queryKey: queryKeys.propertyTags(filters),
        queryFn: () => tagsApi.list(filters),
    });
}

/** Fetches async tag matches on demand so react-select retains its existing input-to-callback timing. */
export function usePropertyTagSearch() {
    const queryClient = useQueryClient();
    return (filters: Record<string, unknown>) => queryClient.fetchQuery({
        queryKey: queryKeys.propertyTagSearch(filters),
        queryFn: () => tagsApi.list(filters),
    });
}

/** Tag selection remains local to each editor; these mutations intentionally avoid cache-side selection changes. */
export function useCreatePropertyTag() {
    return useMutation({
        mutationFn: (payload: CreatePayload) => tagsApi.create(payload),
        retry: false,
    });
}

export function useDeletePropertyTag() {
    return useMutation({
        mutationFn: (id: string) => tagsApi.remove(id),
        retry: false,
    });
}

/** Fetches tenant-name matches only when react-select supplies input text. */
export function useTenantNameSearch() {
    const queryClient = useQueryClient();
    return (search: string) => queryClient.fetchQuery({
        queryKey: queryKeys.tenantNames(search),
        queryFn: () => tenantNamesApi.list(search),
    });
}

export function useUpdateFile(appraisalId: string, fileId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdatePayload) => filesApi.update(appraisalId, fileId, payload),
        onSuccess: file => {
            queryClient.setQueryData(queryKeys.file(appraisalId, fileId), file);
            void queryClient.invalidateQueries({queryKey: ['appraisals', appraisalId, 'file-list']});
        },
    });
}

/** Deletes one file and refreshes every file-list variant for the appraisal. */
export function useDeleteFile(appraisalId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (fileId: string) => filesApi.remove(appraisalId, fileId),
        retry: false,
        onSuccess: (_result, fileId) => {
            queryClient.removeQueries({queryKey: queryKeys.file(appraisalId, fileId)});
            void queryClient.invalidateQueries({queryKey: ['appraisals', appraisalId, 'file-list']});
        },
    });
}

interface ComparableQueryOptions {
    enabled?: boolean;
}

export function useComparableSales(filters: Record<string, unknown> = {}, {enabled = true}: ComparableQueryOptions = {}) {
    return useQuery({queryKey: queryKeys.comparableSales(filters), queryFn: () => comparableSalesApi.list(filters), enabled});
}

export function useComparableLeases(filters: Record<string, unknown> = {}, {enabled = true}: ComparableQueryOptions = {}) {
    return useQuery({queryKey: queryKeys.comparableLeases(filters), queryFn: () => comparableLeasesApi.list(filters), enabled});
}

/** Route-level selected-comparable resource; individual GET request order is preserved by getMany. */
export function useComparableSalesByIds(ids: readonly string[], {enabled = true}: ComparableQueryOptions = {}) {
    return useQuery({
        queryKey: queryKeys.comparableSalesByIds(ids),
        queryFn: () => comparableSalesApi.getMany([...ids]),
        enabled,
    });
}

/** Route-level selected-comparable resource; individual GET request order is preserved by getMany. */
export function useComparableLeasesByIds(ids: readonly string[], {enabled = true}: ComparableQueryOptions = {}) {
    return useQuery({
        queryKey: queryKeys.comparableLeasesByIds(ids),
        queryFn: () => comparableLeasesApi.getMany([...ids]),
        enabled,
    });
}

function invalidateComparableSales(queryClient: ReturnType<typeof useQueryClient>) {
    return queryClient.invalidateQueries({queryKey: ['comparable-sales']});
}

function invalidateComparableLeases(queryClient: ReturnType<typeof useQueryClient>) {
    return queryClient.invalidateQueries({queryKey: ['comparable-leases']});
}

/** Mutations intentionally invalidate only after success; editable screens retain their local draft. */
export function useCreateComparableSale() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreatePayload) => comparableSalesApi.create(payload),
        onSuccess: () => invalidateComparableSales(queryClient),
    });
}

export function useUpdateComparableSale() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, payload}: {id: string; payload: UpdatePayload}) => comparableSalesApi.update(id, payload),
        onSuccess: () => invalidateComparableSales(queryClient),
    });
}

export function useDeleteComparableSale() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => comparableSalesApi.remove(id),
        onSuccess: () => invalidateComparableSales(queryClient),
    });
}

/** Keeps comparable imports local to the confirmation flow, matching the legacy no-cache-update behavior. */
export function useImportComparableSales() {
    return useMutation({
        mutationFn: (form: FormData) => comparableSalesApi.import(form),
        retry: false,
    });
}

export function useSaveComparableSalePortfolio() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({portfolio, subComps}: {portfolio: CreatePayload; subComps: CreatePayload[]}) => (
            comparableSalesApi.savePortfolio(portfolio, subComps)
        ),
        onSuccess: () => invalidateComparableSales(queryClient),
    });
}

export function useCreateComparableLease() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreatePayload) => comparableLeasesApi.create(payload),
        onSuccess: () => invalidateComparableLeases(queryClient),
    });
}

export function useUpdateComparableLease() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, payload}: {id: string; payload: UpdatePayload}) => comparableLeasesApi.update(id, payload),
        onSuccess: () => invalidateComparableLeases(queryClient),
    });
}

export function useDeleteComparableLease() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => comparableLeasesApi.remove(id),
        onSuccess: () => invalidateComparableLeases(queryClient),
    });
}
