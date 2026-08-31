export interface CashFlow {
    name: string;
    cashFlowType: string;
    [field: string]: unknown;
}

export interface CashFlowGroups {
    rows: CashFlow[][];
    incomes: CashFlow[][];
    expenses: CashFlow[][];
}

/** Preserves the mount-time grouping retained by the legacy DCF page. */
export function groupCashFlows(cashFlows: ReadonlyArray<CashFlow> | null | undefined): CashFlowGroups {
    const grouped: Record<string, CashFlow[]> = {};
    (cashFlows || []).forEach((cashFlow) => {
        (grouped[cashFlow.name] ||= []).push(cashFlow);
    });

    const rows = Object.values(grouped);
    const incomes: CashFlow[][] = [];
    const expenses: CashFlow[][] = [];
    rows.forEach((flows) => {
        if (flows[0].cashFlowType === 'income') incomes.push(flows);
        else if (flows[0].cashFlowType === 'expense') expenses.push(flows);
    });
    return {rows, incomes, expenses};
}
