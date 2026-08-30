import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {appraisalsApi, comparableLeasesApi, comparableSalesApi, filesApi} from './resources';
import {queryKeys} from './queryKeys';
import type {CreatePayload, UpdatePayload} from './types';

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

export function useUpdateAppraisal(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdatePayload) => appraisalsApi.update(id, payload),
        onSuccess: (appraisal) => {
            queryClient.setQueryData(queryKeys.appraisal(id), appraisal);
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

export function useFiles(appraisalId: string, type?: string) {
    return useQuery({
        queryKey: queryKeys.files(appraisalId, type),
        queryFn: () => filesApi.list(appraisalId, type),
        enabled: Boolean(appraisalId),
    });
}

export function useFile(appraisalId: string, fileId: string) {
    return useQuery({
        queryKey: queryKeys.file(appraisalId, fileId),
        queryFn: () => filesApi.get(appraisalId, fileId),
        enabled: Boolean(appraisalId && fileId),
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

export function useComparableSales(filters: Record<string, unknown> = {}) {
    return useQuery({queryKey: queryKeys.comparableSales(filters), queryFn: () => comparableSalesApi.list(filters)});
}

export function useComparableLeases(filters: Record<string, unknown> = {}) {
    return useQuery({queryKey: queryKeys.comparableLeases(filters), queryFn: () => comparableLeasesApi.list(filters)});
}
