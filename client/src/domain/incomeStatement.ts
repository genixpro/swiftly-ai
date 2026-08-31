import type {IncomeStatementDTO, IncomeStatementItemDTO} from '../api/types';

type YearlyAmounts = Record<string, number | null | undefined>;

export interface EditableIncomeStatementYearItem {
    yearlyAmounts?: YearlyAmounts;
    [field: string]: unknown;
}

export interface EditableIncomeStatementYears<Item extends EditableIncomeStatementYearItem = EditableIncomeStatementYearItem> {
    items: Item[];
    years: number[];
    yearlySourceTypes: Record<string, string>;
}

/**
 * Produces the exact legacy yearly growth/discount values without mutating the
 * supplied statement. A caller can persist the returned draft immediately.
 */
export function addIncomeStatementYear<Item extends EditableIncomeStatementYearItem>(
    statement: EditableIncomeStatementYears<Item>,
    growthPercent: number,
    givenYear?: number,
    now: () => Date = () => new Date(),
): EditableIncomeStatementYears<Item> {
    const newYear = givenYear
        ? givenYear - 1
        : (incomeStatementLatestYear(statement) || now().getFullYear()) + 1;
    const years = givenYear
        ? [newYear, ...statement.years]
        : [...statement.years, newYear];
    const yearlySourceTypes = {...statement.yearlySourceTypes, [newYear]: 'user'};
    const items = statement.items.map((item) => {
        const yearlyAmounts = {...(item.yearlyAmounts ?? {})};
        if (givenYear) {
            yearlyAmounts[newYear] = yearlyAmounts[givenYear]
                ? Number(yearlyAmounts[givenYear]) / (1 + growthPercent / 100.0)
                : 0;
        } else {
            const priorAmount = yearlyAmounts[newYear - 1];
            yearlyAmounts[newYear] = priorAmount
                ? Number(priorAmount) * (1 + growthPercent / 100.0)
                : 0;
        }
        return {...item, yearlyAmounts};
    });
    return {years, yearlySourceTypes, items};
}

/** Removes a year and its values without mutating the supplied statement. */
export function removeIncomeStatementYear<Item extends EditableIncomeStatementYearItem>(
    statement: EditableIncomeStatementYears<Item>,
    year: number,
): EditableIncomeStatementYears<Item> {
    const yearlySourceTypes = {...statement.yearlySourceTypes};
    delete yearlySourceTypes[year];
    return {
        years: statement.years.filter((currentYear) => currentYear !== year),
        yearlySourceTypes,
        items: statement.items.map((item) => {
            const yearlyAmounts = {...(item.yearlyAmounts ?? {})};
            delete yearlyAmounts[year];
            return {...item, yearlyAmounts};
        }),
    };
}

/** Matches IncomeStatementItemModel.machineName. */
export function incomeStatementItemMachineName(item: Pick<IncomeStatementItemDTO, 'name'>): string {
    return item.name ? item.name.replace(/\.\$/g, '') : '';
}

/** Matches IncomeStatementItemModel.latestAmount. */
export function incomeStatementItemLatestAmount(item: Pick<IncomeStatementItemDTO, 'yearlyAmounts'>): number | null | undefined {
    const yearlyAmounts = item.yearlyAmounts ?? {};
    const years = Object.keys(yearlyAmounts);
    if (years.length === 0) return undefined;
    const latestYear = years.reduce((latest, year) => year > latest ? year : latest);
    return yearlyAmounts[latestYear];
}

/** Matches IncomeStatementModel.latestYear. */
export function incomeStatementLatestYear(statement: Pick<IncomeStatementDTO, 'years'>): number | null {
    const years = statement.years ?? [];
    return years.length === 0 ? null : Math.max(...years);
}

/** Matches IncomeStatementItemModel.yearlyAmountsPSF for a supplied building size. */
export function incomeStatementItemYearlyAmountsPSF(
    item: Pick<IncomeStatementItemDTO, 'yearlyAmounts'>,
    sizeOfBuilding: number | null | undefined,
): YearlyAmounts {
    const psf: YearlyAmounts = {};
    for (const [year, amount] of Object.entries(item.yearlyAmounts ?? {})) {
        psf[year] = typeof sizeOfBuilding === 'number'
            ? Number(amount) / sizeOfBuilding
            : null;
    }
    return psf;
}

/**
 * Matches the legacy yearlyAmountsPSF setter, including retaining the stored
 * amount when rounding to two decimals leaves the displayed PSF unchanged.
 */
export function setIncomeStatementItemYearlyAmountsPSF(
    item: Pick<IncomeStatementItemDTO, 'yearlyAmounts'>,
    sizeOfBuilding: number | null | undefined,
    yearlyAmountsPSF: YearlyAmounts,
): Record<string, number | null | undefined> {
    const currentAmounts = item.yearlyAmounts ?? {};
    const yearly: YearlyAmounts = {};
    for (const [year, amountPSF] of Object.entries(yearlyAmountsPSF)) {
        const currentAmount = currentAmounts[year];
        if (typeof sizeOfBuilding === 'number') {
            yearly[year] = (Number(currentAmount) / sizeOfBuilding).toFixed(2) !== Number(amountPSF).toFixed(2)
                ? Number(amountPSF) * sizeOfBuilding
                : currentAmount;
        } else {
            yearly[year] = currentAmount;
        }
    }
    return yearly;
}
