import apiClient from './client.js';
import {normalizeApiError} from './errors';
import type {
    AppraisalDTO,
    ComparableLeaseDTO,
    ComparableSaleDTO,
    CreatePayload,
    FileDTO,
    ImportComparableSalesResult,
    PropertyTagDTO,
    UpdatePayload,
    ZoneDTO,
} from './types';

async function request<T>(operation: () => Promise<{data: T}>): Promise<T> {
    try {
        return (await operation()).data;
    } catch (error) {
        throw normalizeApiError(error);
    }
}

export const appraisalsApi = {
    async list(): Promise<AppraisalDTO[]> {
        return (await request<{appraisals: AppraisalDTO[]}>(() => apiClient.get('/appraisals'))).appraisals;
    },
    async get(id: string): Promise<AppraisalDTO> {
        return (await request<{appraisal: AppraisalDTO}>(() => apiClient.get(`/appraisals/${id}`))).appraisal;
    },
    async create(payload: CreatePayload): Promise<string> {
        return (await request<{_id: string}>(() => apiClient.post('/appraisals', payload)))._id;
    },
    async update(id: string, payload: UpdatePayload): Promise<AppraisalDTO> {
        return (await request<{appraisal: AppraisalDTO}>(() => apiClient.patch(`/appraisals/${id}`, payload))).appraisal;
    },
    async remove(id: string): Promise<void> {
        await request(() => apiClient.delete(`/appraisals/${id}`));
    },
    async convertTenants(id: string): Promise<string[]> {
        return (await request<{created: string[]}>(() => apiClient.post(`/appraisals/${id}/comparable-leases/from-tenants`))).created;
    },
};

export const filesApi = {
    async list(appraisalId: string, type?: string): Promise<FileDTO[]> {
        const params = type ? {type} : undefined;
        return (await request<{files: FileDTO[]}>(() => apiClient.get(`/appraisals/${appraisalId}/files`, {params}))).files;
    },
    async get(appraisalId: string, fileId: string): Promise<FileDTO> {
        return (await request<{file: FileDTO}>(() => apiClient.get(`/appraisals/${appraisalId}/files/${fileId}`))).file;
    },
    async upload(appraisalId: string, form: FormData): Promise<FileDTO> {
        return (await request<{file: FileDTO}>(() => apiClient.post(
            `/appraisals/${appraisalId}/files`,
            form,
        ))).file;
    },
    async update(appraisalId: string, fileId: string, payload: UpdatePayload): Promise<FileDTO> {
        return (await request<{file: FileDTO}>(() => apiClient.patch(
            `/appraisals/${appraisalId}/files/${fileId}`,
            payload,
        ))).file;
    },
    async remove(appraisalId: string, fileId: string): Promise<void> {
        await request(() => apiClient.delete(`/appraisals/${appraisalId}/files/${fileId}`));
    },
};

export const comparableSalesApi = {
    async list(params?: Record<string, unknown>): Promise<ComparableSaleDTO[]> {
        return (await request<{comparableSales: ComparableSaleDTO[]}>(() => apiClient.get('/comparable-sales', {params}))).comparableSales;
    },
    async get(id: string): Promise<ComparableSaleDTO> {
        return (await request<{comparableSale: ComparableSaleDTO}>(() => apiClient.get(`/comparable-sales/${id}`))).comparableSale;
    },
    async getMany(ids: string[]): Promise<ComparableSaleDTO[]> {
        return Promise.all(ids.map((id) => this.get(id)));
    },
    async create(payload: CreatePayload): Promise<string> {
        return (await request<{_id: string}>(() => apiClient.post('/comparable-sales', payload)))._id;
    },
    async update(id: string, payload: UpdatePayload): Promise<void> {
        await request(() => apiClient.patch(`/comparable-sales/${id}`, payload));
    },
    async remove(id: string): Promise<void> {
        await request(() => apiClient.delete(`/comparable-sales/${id}`));
    },
    async savePortfolio(portfolio: CreatePayload, subComps: CreatePayload[]): Promise<ComparableSaleDTO> {
        return (await request<{comparableSale: ComparableSaleDTO}>(() => apiClient.post(
            '/comparable-sale-portfolios',
            {portfolio, subComps},
        ))).comparableSale;
    },
    async import(form: FormData): Promise<ImportComparableSalesResult> {
        return request<ImportComparableSalesResult>(() => apiClient.post('/comparable-sales/import', form));
    },
};

export const comparableLeasesApi = {
    async list(params?: Record<string, unknown>): Promise<ComparableLeaseDTO[]> {
        return (await request<{comparableLeases: ComparableLeaseDTO[]}>(() => apiClient.get('/comparable-leases', {params}))).comparableLeases;
    },
    async get(id: string): Promise<ComparableLeaseDTO> {
        return (await request<{comparableLease: ComparableLeaseDTO}>(() => apiClient.get(`/comparable-leases/${id}`))).comparableLease;
    },
    async getMany(ids: string[]): Promise<ComparableLeaseDTO[]> {
        return Promise.all(ids.map((id) => this.get(id)));
    },
    async create(payload: CreatePayload): Promise<string> {
        return (await request<{_id: string}>(() => apiClient.post('/comparable-leases', payload)))._id;
    },
    async update(id: string, payload: UpdatePayload): Promise<void> {
        await request(() => apiClient.patch(`/comparable-leases/${id}`, payload));
    },
    async remove(id: string): Promise<void> {
        await request(() => apiClient.delete(`/comparable-leases/${id}`));
    },
};

export const zonesApi = {
    async list(search?: string): Promise<ZoneDTO[]> {
        const params = search ? {zoneName: search} : undefined;
        return (await request<{zones: ZoneDTO[]}>(() => apiClient.get('/zones', {params}))).zones;
    },
    async get(id: string): Promise<ZoneDTO> {
        return (await request<{zone: ZoneDTO}>(() => apiClient.get(`/zones/${id}`))).zone;
    },
    async create(payload: CreatePayload): Promise<string> {
        return (await request<{_id: string}>(() => apiClient.post('/zones', payload)))._id;
    },
    async update(id: string, payload: UpdatePayload): Promise<void> {
        await request(() => apiClient.patch(`/zones/${id}`, payload));
    },
};

export const tagsApi = {
    async list(params?: Record<string, unknown>): Promise<PropertyTagDTO[]> {
        return (await request<{tags: PropertyTagDTO[]}>(() => apiClient.get('/property-tags', {params}))).tags;
    },
    async create(payload: CreatePayload): Promise<string> {
        return (await request<{_id: string}>(() => apiClient.post('/property-tags', payload)))._id;
    },
    async remove(id: string): Promise<void> {
        await request(() => apiClient.delete(`/property-tags/${id}`));
    },
};

export const tenantNamesApi = {
    async list(search: string): Promise<string[]> {
        return (await request<{names: string[]}>(() => apiClient.get('/tenant-names', {params: {tenantName: search}}))).names;
    },
};

export const imagesApi = {
    async upload(form: FormData): Promise<string> {
        return (await request<{url: string}>(() => apiClient.post('/images', form))).url;
    },
};
