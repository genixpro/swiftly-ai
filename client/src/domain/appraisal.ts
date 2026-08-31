import type {AppraisalDTO, IncomeStatementDTO, IncomeStatementItemDTO, TenancyDTO, UnitDTO, UpdatePayload} from '../api/types';

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

/** Creates the editable unit shape the legacy UnitModel constructor exposes. */
export function createUnit(unit: UnitDTO = {}): UnitDTO {
    const tenancies = unit.tenancies?.length ? unit.tenancies.map(copyTenancy) : [copyTenancy({name: 'Vacant'})];
    return {
        unitNumber: 'new',
        floorNumber: 1,
        squareFootage: 1,
        leasingCostStructure: 'Default',
        // BoolField intentionally hydrates absent values as null, not false.
        shouldApplyMarketRentDifferential: null,
        shouldUseMarketRent: null,
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
        units: dto.units ? dto.units.map(createUnit) : null,
        comparableSalesCapRate: [...(dto.comparableSalesCapRate ?? [])],
        comparableSalesDCA: [...(dto.comparableSalesDCA ?? [])],
        comparableLeases: dto.comparableLeases ? [...dto.comparableLeases] : null,
        marketRents: dto.marketRents ? dto.marketRents.map(value => ({...value})) : null,
        recoveryStructures: dto.recoveryStructures ? dto.recoveryStructures.map(value => ({...value})) : null,
        leasingCosts: dto.leasingCosts ? dto.leasingCosts.map(value => ({...value})) : null,
    };
}

function hydrateEditableDate(value: unknown): unknown {
    if (typeof value !== 'string') return value;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
}

function hydrateEditableStatementItem(item: IncomeStatementItemDTO): void {
    item.yearlyAmounts ??= {};
    item.yearlySourceTypes ??= {};
    item.extractionReferences ??= {};
}

function hydrateEditableStatement(statement: IncomeStatementDTO | undefined): void {
    if (!statement) return;
    statement.years ??= [];
    statement.yearlySourceTypes ??= {};
    statement.customYearTitles ??= {};
    statement.items ??= [];
    statement.incomes ??= [];
    statement.expenses ??= [];
    for (const item of [...statement.items, ...statement.expenses, ...statement.incomes]) hydrateEditableStatementItem(item);
}

/** Materializes only persisted defaults required by mutable legacy screens. */
export function prepareEditableAppraisal(data: AppraisalDTO): AppraisalDTO {
    const appraisal = {...data, appraisalType: data.appraisalType ?? 'detailed'} as AppraisalDTO & Record<string, unknown>;
    appraisal.dataTypeReferences ??= {};
    for (const field of [
        'incomeStatement', 'expenseStatement', 'discountedCashFlowInputs', 'discountedCashFlow', 'validationResult',
        'stabilizedStatementInputs', 'stabilizedStatement', 'directComparisonInputs', 'directComparisonValuation',
        'amortizationSchedule', 'adjustmentChart',
    ]) {
        if (appraisal[field] === undefined || appraisal[field] === null) appraisal[field] = {};
    }
    appraisal.effectiveDate = hydrateEditableDate(data.effectiveDate) as AppraisalDTO['effectiveDate'];
    const units = data.units?.map(unit => ({...unit, tenancies: unit.tenancies?.map(tenancy => ({
        ...tenancy,
        startDate: hydrateEditableDate(tenancy.startDate) as typeof tenancy.startDate,
        endDate: hydrateEditableDate(tenancy.endDate) as typeof tenancy.endDate,
    }))}));
    appraisal.units = units ? units.map(unit => createUnit(unit)) : data.units;
    hydrateEditableStatement(appraisal.incomeStatement);
    hydrateEditableStatement(appraisal.expenseStatement);
    return appraisal;
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

/** Uses unit-derived size for normalized data while retaining incomplete legacy payload compatibility. */
export function appraisalBuildingSize(appraisal: Pick<AppraisalDTO, 'units'> & {sizeOfBuilding?: number | null}): number {
    return appraisal.units ? buildingSize(appraisal) : (appraisal.sizeOfBuilding ?? 0);
}

export function occupancyRate(appraisal: Pick<AppraisalDTO, 'units'>): number {
    const units = appraisal.units ?? [];
    const size = buildingSize(appraisal);
    const occupied = units.reduce((total, unit) => {
        const vacant = isVacant(unit);
        return total + (vacant ? 0 : (unit.squareFootage ?? 0));
    }, 0);
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

/** Returns the persisted effective date using the established appraisal fallback. */
export function appraisalEffectiveDate(
    appraisal: Pick<AppraisalDTO, 'effectiveDate'>,
    now: () => Date = () => new Date(),
): Date {
    return appraisal.effectiveDate ? new Date(appraisal.effectiveDate) : now();
}

/** Matches UnitModel.marketRentAmount without requiring a proxy-backed parent. */
export function unitMarketRentAmount(
    unit: Pick<UnitDTO, 'marketRent'>,
    marketRents: ReadonlyArray<{name?: string | null; amountPSF?: number | null}> | null | undefined,
): number | null {
    return marketRents?.find(marketRent => marketRent.name === unit.marketRent)?.amountPSF ?? null;
}

/** Matches UnitModel.stabilizedRentPSF for an already-normalized unit. */
export function unitStabilizedRentPSF(
    unit: UnitDTO,
    marketRents: ReadonlyArray<{name?: string | null; amountPSF?: number | null}> | null | undefined,
    now = Date.now(),
): number | null {
    if (unit.shouldUseMarketRent && unit.marketRent) return unitMarketRentAmount(unit, marketRents);
    const tenancy = currentTenancy(unit, now);
    return tenancy ? Number(tenancy.yearlyRent ?? 0) / Number(unit.squareFootage ?? 1) : null;
}

/** Matches UnitModel.stabilizedRent without relying on a computed model getter. */
export function unitStabilizedRent(
    unit: UnitDTO,
    marketRents: ReadonlyArray<{name?: string | null; amountPSF?: number | null}> | null | undefined,
    now = Date.now(),
): number {
    const rentPSF = unitStabilizedRentPSF(unit, marketRents, now);
    // The legacy getter multiplies null by square footage, which intentionally
    // yields zero when a selected market-rent record no longer exists.
    return rentPSF === null ? 0 : rentPSF * Number(unit.squareFootage ?? 1);
}

/** Mirrors UnitModel.isVacantInFirstYear, including its one-year fallback selection. */
export function isVacantInFirstYear(unit: UnitDTO, now = Date.now()): boolean {
    const tenancies = unit.tenancies ?? [];
    if (tenancies.length === 0) return true;
    const oneYearDate = now + (1000 * 60 * 60 * 24 * 365);
    const active = tenancies.find(tenancy => {
        if (!tenancy.startDate || !tenancy.endDate) return false;
        return new Date(tenancy.startDate).getTime() <= oneYearDate
            && new Date(tenancy.endDate).getTime() >= oneYearDate;
    });
    if (active?.yearlyRent && active.yearlyRent > 0) return false;
    if (active) return true;
    const fallback = currentTenancy({tenancies}, oneYearDate);
    return !(fallback?.yearlyRent && fallback.yearlyRent > 0);
}

/** Sums the cached recovery values exactly as UnitModel.calculatedTotalRecovery. */
export function unitCalculatedTotalRecovery(unit: UnitDTO): number {
    return [
        unit.calculatedManagementRecovery,
        unit.calculatedExpenseRecovery,
        unit.calculatedTaxRecovery,
    ].reduce<number>((total, value) => typeof value === 'number' ? total + value : total, 0);
}

const unitCalculationFields = [
    'calculatedManagementRecovery',
    'calculatedExpenseRecovery',
    'calculatedTaxRecovery',
    'calculatedMarketRentDifferential',
    'calculatedFreeRentLoss',
    'calculatedVacantUnitRentLoss',
    'calculatedVacantUnitLeasupCosts',
    'calculatedFreeRentMonths',
    'calculatedFreeRentNetAmount',
] as const;

/** Immutable equivalent of UnitModel.resetCalculations for the typed workspace migration. */
export function resetUnitCalculations(unit: UnitDTO): UnitDTO {
    return {...unit, ...Object.fromEntries(unitCalculationFields.map(field => [field, null]))};
}
