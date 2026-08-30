import type {AppraisalDTO, ComparableLeaseDTO, ComparableSaleDTO, FileDTO} from '@api/types';

export function appraisalFixture(overrides: Partial<AppraisalDTO> = {}): AppraisalDTO {
    return {
        _id: 'appraisal-1',
        name: 'Test Appraisal',
        address: '100 Test Street',
        appraisalType: 'detailed',
        propertyType: 'office',
        units: [],
        ...overrides,
    };
}

export function comparableSaleFixture(overrides: Partial<ComparableSaleDTO> = {}): ComparableSaleDTO {
    return {_id: 'sale-1', propertyType: 'office', address: '200 Sale Street', ...overrides};
}

export function comparableLeaseFixture(overrides: Partial<ComparableLeaseDTO> = {}): ComparableLeaseDTO {
    return {_id: 'lease-1', propertyType: 'office', tenantName: 'Test Tenant', ...overrides};
}

export function fileFixture(overrides: Partial<FileDTO> = {}): FileDTO {
    return {_id: 'file-1', fileName: 'test.pdf', fileType: 'other', reviewStatus: 'fresh', ...overrides};
}
