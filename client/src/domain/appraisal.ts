import type {AppraisalDTO, TenancyDTO, UnitDTO, UpdatePayload} from '../api/types';

export type Appraisal = Readonly<AppraisalDTO>;
export type AppraisalUnit = Readonly<UnitDTO>;
export type AppraisalTenancy = Readonly<TenancyDTO>;

const ignoredPatchFields = new Set(['createdAt', 'updatedAt', 'demoSeedVersion', 'sizeOfBuilding', 'additionalIncomes', 'expenses']);

function copyTenancy(tenancy: TenancyDTO): TenancyDTO {
    return {
        name: 'New Tenant',
        monthlyRent: 0,
        yearlyRent: 0,
        rentType: 'net',
        freeRentType: 'net',
        freeRentMonths: 0,
        recoveryStructure: 'Standard',
        ...tenancy,
    };
}

function copyUnit(unit: UnitDTO): UnitDTO {
    const tenancies = unit.tenancies?.length ? unit.tenancies.map(copyTenancy) : [copyTenancy({name: 'Vacant'})];
    return {
        unitNumber: 'new',
        floorNumber: 1,
        squareFootage: 1,
        leasingCostStructure: 'Default',
        shouldApplyMarketRentDifferential: false,
        shouldUseMarketRent: false,
        shouldTreatAsVacant: null,
        ...unit,
        tenancies,
    };
}

/** Normalizes only defaults and aliases already supplied by the legacy model boundary. */
export function normalizeAppraisal(dto: AppraisalDTO): AppraisalDTO {
    const imageUrls = dto.imageUrls ? [...dto.imageUrls] : null;
    const captions = dto.captions ? [...dto.captions] : null;
    if (captions && imageUrls) while (captions.length < imageUrls.length) captions.push('');
    return {
        ...dto,
        appraisalType: dto.appraisalType ?? 'detailed',
        imageUrls,
        captions,
        propertyTags: dto.propertyTags ? [...dto.propertyTags] : null,
        units: dto.units ? dto.units.map(copyUnit) : null,
        comparableSalesCapRate: [...(dto.comparableSalesCapRate ?? [])],
        comparableSalesDCA: [...(dto.comparableSalesDCA ?? [])],
        comparableLeases: dto.comparableLeases ? [...dto.comparableLeases] : null,
        marketRents: dto.marketRents ? dto.marketRents.map(value => ({...value})) : null,
        recoveryStructures: dto.recoveryStructures ? dto.recoveryStructures.map(value => ({...value})) : null,
        leasingCosts: dto.leasingCosts ? dto.leasingCosts.map(value => ({...value})) : null,
    };
}

function equivalent(left: unknown, right: unknown): boolean {
    if (Object.is(left, right)) return true;
    return JSON.stringify(left) === JSON.stringify(right);
}

/** Builds the existing top-level PATCH envelope without leaking derived server fields. */
export function buildAppraisalPatch(persisted: AppraisalDTO, draft: AppraisalDTO): UpdatePayload {
    return Object.fromEntries(Object.keys(draft)
        .filter(key => key !== '_id' && !ignoredPatchFields.has(key) && !equivalent(persisted[key], draft[key]))
        .map(key => [key, draft[key]]));
}

export function replaceAt<T>(values: readonly T[], index: number, value: T): T[] {
    return values.map((current, currentIndex) => currentIndex === index ? value : current);
}

export function insertAt<T>(values: readonly T[], index: number, value: T): T[] {
    return [...values.slice(0, index), value, ...values.slice(index)];
}

export function removeAt<T>(values: readonly T[], index: number): T[] {
    return values.filter((_, currentIndex) => currentIndex !== index);
}

export function move<T>(values: readonly T[], from: number, to: number): T[] {
    if (from === to || from < 0 || to < 0 || from >= values.length || to >= values.length) return [...values];
    const result = [...values];
    const [value] = result.splice(from, 1);
    result.splice(to, 0, value);
    return result;
}

export function buildingSize(appraisal: Pick<AppraisalDTO, 'units'>): number {
    return (appraisal.units ?? []).reduce((total, unit) => total + (unit.squareFootage ?? 0), 0);
}

export function occupancyRate(appraisal: Pick<AppraisalDTO, 'units'>): number {
    const units = appraisal.units ?? [];
    const size = buildingSize(appraisal);
    const occupied = units.reduce((total, unit) => total + (isVacant(unit) ? 0 : (unit.squareFootage ?? 0)), 0);
    return occupied / size;
}

export function isVacant(unit: UnitDTO): boolean {
    if (unit.shouldTreatAsVacant !== null && unit.shouldTreatAsVacant !== undefined) return unit.shouldTreatAsVacant;
    const tenancy = currentTenancy(unit);
    return !tenancy?.yearlyRent || tenancy.yearlyRent <= 0;
}

export function currentTenancy(unit: UnitDTO, now = Date.now()): TenancyDTO | undefined {
    const tenancies = unit.tenancies ?? [];
    const active = tenancies.find(tenancy => {
        if (!tenancy.startDate || !tenancy.endDate) return false;
        return new Date(tenancy.startDate).getTime() <= now && new Date(tenancy.endDate).getTime() >= now;
    });
    if (active) return active;
    return [...tenancies].sort((left, right) => {
        const leftDate = left.startDate ? new Date(left.startDate).getTime() : now;
        const rightDate = right.startDate ? new Date(right.startDate).getTime() : now;
        return leftDate - rightDate;
    }).at(-1);
}
