interface IncomeStatementItem {
    incomeStatementItemType?: string | null;
    yearlyAmounts?: Record<string, number | null | undefined> | null;
}

interface IncomeStatementForGroups {
    items?: IncomeStatementItem[] | null;
    years: number[];
}

export function cleanNumericalValue(value: unknown) {
    const text = String(value);
    const cleanText = text.replace(/[^0-9.]/g, '');
    const isNegative = text.includes('-') || text.includes('(') || text.includes(')');
    if (cleanText === '') return 0;
    const number = Number(cleanText);
    if (!Number.isFinite(number)) return 0;
    return isNegative ? -number : number;
}

export function calculateGroupTotals(groups: Record<string, unknown>, statement: IncomeStatementForGroups) {
    const totals: Record<string, Record<number, number>> = {};
    Object.keys(groups).forEach((group) => {
        totals[`${group}_total`] = Object.fromEntries(statement.years.map((year) => [year, 0]));
    });
    for (const item of statement.items || []) {
        if (!item.yearlyAmounts || !item.incomeStatementItemType || !Object.hasOwn(groups, item.incomeStatementItemType)) continue;
        for (const [year, amount] of Object.entries(item.yearlyAmounts)) {
            totals[`${item.incomeStatementItemType}_total`][Number(year)] += amount as number;
        }
    }
    return totals;
}
