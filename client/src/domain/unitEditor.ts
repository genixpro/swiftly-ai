import {createTenancy, tenancyFieldValues, type Tenancy} from './tenancies';

/** Immutable tenancy transitions used while the unit editor remains facade-backed. */
export function removeTenancyAt<T>(tenancies: readonly T[], index: number): T[] {
    return tenancies.filter((_, currentIndex) => currentIndex !== index);
}

/**
 * Deliberately assigns the initial field directly. The legacy new-row path
 * stores a supplied yearlyRentPSF field rather than invoking its edit setter.
 */
export function appendTenancy(
    tenancies: readonly Tenancy[],
    field?: string,
    value?: unknown,
): Tenancy[] {
    const tenancy = createTenancy();
    if (field) tenancy[field] = value;
    return [...tenancies, tenancy];
}

export function updateTenancyField(tenancy: Tenancy, field: string, value: unknown, squareFootage: number): Tenancy {
    return {...tenancy, ...tenancyFieldValues(field, value, squareFootage)};
}

/** Produces the shared tenant-field update without replacing legacy tenancy identities. */
export function updateAllTenancyFields<T extends Tenancy>(tenancies: readonly T[], field: string, value: unknown): T[] {
    return tenancies.map((tenancy) => ({...tenancy, [field]: value}));
}

export function updateUnitField<T extends Record<string, unknown>>(unit: T, field: string, value: unknown): T {
    return {...unit, [field]: value};
}
