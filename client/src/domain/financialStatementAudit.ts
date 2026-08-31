import {cleanFinancialStatementAmount} from './financialStatementUtilities';

export interface FinancialStatementAuditLine {
    include?: boolean;
    income_amount?: string | null;
    expense_amount?: string | null;
    [field: string]: unknown;
}

export interface FinancialStatementAuditData {
    income?: FinancialStatementAuditLine[];
    expense?: FinancialStatementAuditLine[];
    [field: string]: unknown;
}

export interface FinancialStatementAudit {
    extractedData: FinancialStatementAuditData;
    [field: string]: unknown;
}

export type LegacyAuditTotal = number | string;

function addLegacyAmount(total: LegacyAuditTotal, amount: number | ""): LegacyAuditTotal {
    // JavaScript's original `+=` deliberately turns a blank extracted amount
    // into a string total. Keep that edge case so audit rendering and saved
    // classifications remain behaviorally identical during the migration.
    return typeof total === 'string' || amount === '' ? `${total}${amount}` : total + amount;
}

/** Materializes the legacy default include flag directly on the editable extraction draft. */
export function initializeIncludedLines(financialStatement: FinancialStatementAudit): void {
    financialStatement.extractedData.income?.forEach((income) => {
        if (income.include === undefined) income.include = true;
    });
    financialStatement.extractedData.expense?.forEach((expense) => {
        if (expense.include === undefined) expense.include = true;
    });
}

/** Computes the audit totals with the original truthy include and amount coercion rules. */
export function computeGroupTotals(financialStatement: FinancialStatementAudit): {incomeTotal: LegacyAuditTotal; expenseTotal: LegacyAuditTotal} {
    let incomeTotal: LegacyAuditTotal = 0;
    let expenseTotal: LegacyAuditTotal = 0;

    financialStatement.extractedData.income?.forEach((income) => {
        if (income.include) incomeTotal = addLegacyAmount(incomeTotal, cleanFinancialStatementAmount(income.income_amount));
    });
    financialStatement.extractedData.expense?.forEach((expense) => {
        if (expense.include) expenseTotal = addLegacyAmount(expenseTotal, cleanFinancialStatementAmount(expense.expense_amount));
    });

    return {incomeTotal, expenseTotal};
}
