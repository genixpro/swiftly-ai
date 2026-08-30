export const queryKeys = {
    appraisals: ['appraisals'] as const,
    appraisal: (id: string) => ['appraisals', id] as const,
    files: (appraisalId: string, type?: string) => ['appraisals', appraisalId, 'file-list', type ?? 'all'] as const,
    file: (appraisalId: string, fileId: string) => ['appraisals', appraisalId, 'file', fileId] as const,
    comparableSales: (filters: Record<string, unknown> = {}) => ['comparable-sales', filters] as const,
    comparableLeases: (filters: Record<string, unknown> = {}) => ['comparable-leases', filters] as const,
};
