export type Id = string;

export interface ResourceDTO {
    _id: Id;
    [field: string]: unknown;
}

export interface AppraisalDTO extends ResourceDTO {
    name?: string;
    address?: string;
    appraisalType?: 'simple' | 'detailed' | string;
    owner?: string;
    client?: string;
    location?: GeoPointDTO | null;
    imageUrls?: string[] | null;
    captions?: string[] | null;
    /** API DTOs use ISO strings; the editable workspace hydrates this to Date. */
    effectiveDate?: Date | string | null;
    propertyType?: string | null;
    industrialSubType?: string;
    landSubType?: string;
    sizeOfLand?: number | null;
    buildableArea?: number | null;
    buildableUnits?: number | null;
    legalDescription?: string;
    zoning?: string;
    propertyTags?: string[] | null;
    tenancyType?: string;
    units?: UnitDTO[] | null;
    incomeStatement?: IncomeStatementDTO;
    expenseStatement?: IncomeStatementDTO;
    comparableSalesCapRate?: string[] | null;
    comparableSalesDCA?: string[] | null;
    comparableLeases?: string[] | null;
    marketRents?: NamedAmountDTO[] | null;
    recoveryStructures?: RecoveryStructureDTO[] | null;
    leasingCosts?: LeasingCostStructureDTO[] | null;
    dataTypeReferences?: Record<string, ExtractionReferenceDTO[]>;
}

export interface GeoPointDTO {
    type: 'Point';
    coordinates: [number, number];
}

export interface TenancyDTO {
    name?: string | null;
    monthlyRent?: number | null;
    yearlyRent?: number | null;
    rentType?: string | null;
    freeRentType?: string | null;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    freeRentMonths?: number | null;
    recoveryStructure?: string | null;
    [field: string]: unknown;
}

export interface UnitDTO {
    unitNumber?: string | number;
    floorNumber?: number | null;
    squareFootage?: number | null;
    tenancies?: TenancyDTO[];
    marketRent?: string | null;
    leasingCostStructure?: string | null;
    remarks?: string;
    shouldApplyMarketRentDifferential?: boolean | null;
    shouldUseMarketRent?: boolean | null;
    shouldTreatAsVacant?: boolean | null;
    [field: string]: unknown;
}

export interface IncomeStatementItemDTO {
    name?: string | null;
    yearlyAmounts?: Record<string, number | null>;
    yearlySourceTypes?: Record<string, string>;
    extractionReferences?: Record<string, Record<string, unknown>>;
    cashFlowType?: string | null;
    incomeStatementItemType?: string | null;
    [field: string]: unknown;
}

export interface IncomeStatementDTO {
    years?: number[];
    yearlySourceTypes?: Record<string, string>;
    customYearTitles?: Record<string, string>;
    items?: IncomeStatementItemDTO[];
    incomes?: IncomeStatementItemDTO[];
    expenses?: IncomeStatementItemDTO[];
    [field: string]: unknown;
}

export interface NamedAmountDTO {
    name?: string | null;
    amountPSF?: number | null;
    [field: string]: unknown;
}

export interface RecoveryStructureDTO {
    name?: string | null;
    isDefault?: boolean;
    [field: string]: unknown;
}

export interface LeasingCostStructureDTO {
    name?: string | null;
    isDefault?: boolean;
    leasingCommissionMode?: 'psf' | 'percent_of_rent' | string;
    leasingCommissionPSF?: number | null;
    leasingCommissionPercentYearOne?: number | null;
    leasingCommissionPercentRemainingYears?: number | null;
    tenantInducementsPSF?: number | null;
    renewalPeriod?: number | null;
    leasingPeriod?: number | null;
    [field: string]: unknown;
}

export interface ExtractionReferenceDTO {
    fileId?: string;
    page?: number;
    boundingBox?: number[];
    [field: string]: unknown;
}

export interface FileDTO extends ResourceDTO {
    fileName: string;
    fileType?: string;
    reviewStatus?: string;
    extractionJobId?: string;
    extractionError?: string | null;
    pages?: number;
    extractionJob?: ExtractionJobDTO;
    extractedData?: {
        rent_per_square_foot?: string | number;
        size_square_feet?: string | number;
        term?: string | number;
        [field: string]: unknown;
    };
}

export interface ComparableSaleDTO extends ResourceDTO {
    address?: string;
    saleDate?: string | null;
    salePrice?: number | null;
    propertyType?: string;
    location?: GeoPointDTO | null;
}
export interface ComparableLeaseDTO extends ResourceDTO {
    address?: string;
    tenantName?: string;
    startDate?: string | null;
    yearlyRent?: number | null;
    propertyType?: string;
    location?: GeoPointDTO | null;
}
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
