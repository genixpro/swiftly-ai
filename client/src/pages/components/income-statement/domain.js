export function cleanNumericalValue(value) {
    const text = value.toString();
    const cleanText = text.replace(/[^0-9.]/g, '');
    const isNegative = text.includes('-') || text.includes('(') || text.includes(')');
    if (cleanText === '') return 0;
    const number = Number(cleanText);
    if (!Number.isFinite(number)) return 0;
    return isNegative ? -number : number;
}

export function calculateGroupTotals(groups, statement) {
    const totals = {};
    Object.keys(groups).forEach((group) => {
        totals[`${group}_total`] = Object.fromEntries(statement.years.map((year) => [year, 0]));
    });
    for (const item of statement.items || []) {
        if (!item.yearlyAmounts || !Object.hasOwn(groups, item.incomeStatementItemType)) continue;
        for (const [year, amount] of Object.entries(item.yearlyAmounts)) {
            totals[`${item.incomeStatementItemType}_total`][year] += amount;
        }
    }
    return totals;
}
