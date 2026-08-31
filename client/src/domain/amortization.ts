export interface AmortizationItem {
    name: string;
    amount: number;
    interest: number;
    discountRate: number;
    startDate: Date;
    periodMonths: number;
    [field: string]: unknown;
}

/** Builds a row exactly as the amortization editor has historically done. */
export function createAmortizationItem(
    field: string | undefined,
    value: unknown,
    now: () => Date = () => new Date(),
): AmortizationItem | undefined {
    // This guard is intentionally broad: the inline editor's 0/empty entry
    // has never created a row, and changing that is a product behavior change.
    if (!value) return undefined;

    const item: Partial<AmortizationItem> = field ? {[field]: value} : {};
    if (item.name === undefined) item.name = 'New Amortization Item';
    if (item.amount === undefined) item.amount = 0;
    if (item.interest === undefined) item.interest = 3;
    if (item.discountRate === undefined) item.discountRate = 8;
    if (item.startDate === undefined) item.startDate = now();
    if (item.periodMonths === undefined) item.periodMonths = 1;
    return item as AmortizationItem;
}
