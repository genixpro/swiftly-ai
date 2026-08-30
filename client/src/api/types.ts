export type Id = string;

export interface ResourceDTO {
    _id: Id;
    [field: string]: unknown;
}

export interface AppraisalDTO extends ResourceDTO {
    name?: string;
    address?: string;
    units?: unknown[];
}

export interface FileDTO extends ResourceDTO {
    fileName: string;
    fileType?: string;
    reviewStatus?: string;
    extractionJobId?: string;
    extractionError?: string | null;
    pages?: number;
}

export interface ComparableSaleDTO extends ResourceDTO {}
export interface ComparableLeaseDTO extends ResourceDTO {}
export interface ZoneDTO extends ResourceDTO {
    zoneName?: string;
    description?: string;
}
export interface PropertyTagDTO extends ResourceDTO {
    name?: string;
}

export type CreatePayload = Record<string, unknown>;
export type UpdatePayload = Record<string, unknown>;

export interface ImportComparableSalesResult {
    file: FileDTO;
    comparableSales: ComparableSaleDTO[];
}

export interface ExtractionJobDTO extends ResourceDTO {
    status: string;
    error?: string;
}
