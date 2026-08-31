/** Preserves the extraction amount coercion used by financial-statement audits. */
export function cleanFinancialStatementAmount(text: string | null | undefined): number | '' {
    if (!text) return '';

    const negative = text.indexOf('(') !== -1 || text.indexOf(')') !== -1;
    const number = Number(text.replace(/[^0-9.]/g, ''));
    return negative ? -number : number;
}
