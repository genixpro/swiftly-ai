export interface Tenancy {
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

export function createTenancy(values: Tenancy = {}): Tenancy {
    return {
        name: 'New Tenant', monthlyRent: 0, yearlyRent: 0, rentType: 'net',
        freeRentType: 'net', startDate: null, endDate: null, freeRentMonths: 0,
        recoveryStructure: 'Standard', ...values,
    };
}

export function tenancyYearlyRentPSF(tenancy: Tenancy, squareFootage: number): number {
    return Number(tenancy.yearlyRent ?? 0) / squareFootage;
}

/** Mirrors the legacy `yearlyRentPSF` setter without a proxy accessor. */
export function tenancyFieldValues(field: string, value: unknown, squareFootage: number): Record<string, unknown> {
    if (field !== 'yearlyRentPSF') return {[field]: value};
    const yearlyRent = Number(value) * squareFootage;
    return {yearlyRent, monthlyRent: yearlyRent / 12};
}
