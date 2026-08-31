import type {AppraisalDTO, IncomeStatementDTO, IncomeStatementItemDTO, UnitDTO} from '../api/types';
import type {RecoveryStructure} from './recoveryStructures';

export type StabilizedStatementItemCollection = 'incomes' | 'expenses';

/** The hydrated, mutable shape used by the stabilized-statement screen. */
export interface EditableStabilizedStatementAppraisal extends AppraisalDTO {
    expenseStatement: EditableStabilizedStatementCollection;
    expenses: EditableStabilizedStatementCollection;
    incomeStatement: EditableStabilizedStatementCollection;
    incomes: EditableStabilizedStatementCollection;
    recoveryStructures: [RecoveryStructure, ...RecoveryStructure[]];
    stabilizedStatement: StabilizedStatementValues;
    stabilizedStatementInputs: StabilizedStatementInputs;
    units: UnitDTO[];
}

export interface EditableStabilizedStatementCollection extends IncomeStatementDTO {
    items: IncomeStatementItemDTO[];
}

export interface StabilizedStatementInputs {
    expensesMode?: string | null;
    managementExpenseCalculationRule: ManagementExpenseCalculationRule;
    managementExpenseMode?: string | null;
    structuralAllowancePercent?: number | null;
    tmiRatePSF?: number | null;
    vacancyRate?: number | null;
    [field: string]: unknown;
}

export interface ManagementExpenseCalculationRule {
    field?: string | null;
    percentage?: number | null;
    [field: string]: unknown;
}

export interface StabilizedStatementValues {
    additionalIncome?: number | null;
    calculationErrorFields: string[];
    calculationErrors: Record<string, string>;
    effectiveGrossIncome?: number | null;
    managementExpenses?: number | null;
    netOperatingIncome?: number | null;
    operatingExpenses?: number | null;
    potentialGrossIncome?: number | null;
    recoverableIncome?: number | null;
    rentalIncome?: number | null;
    structuralAllowance?: number | null;
    taxes?: number | null;
    tmiTotal?: number | null;
    totalExpenses?: number | null;
    vacancyDeduction?: number | null;
    [field: string]: unknown;
}

/** Creates the editable shape previously materialized by IncomeStatementItemModel. */
export function createIncomeStatementItem(values: IncomeStatementItemDTO = {}): IncomeStatementItemDTO {
    return {
        name: null,
        yearlyAmounts: {},
        yearlySourceTypes: {},
        extractionReferences: {},
        cashFlowType: null,
        incomeStatementItemType: null,
        ...values,
    };
}

export function stabilizedStatementAppraisalYear(effectiveDate: Date | string | null | undefined, now: () => Date = () => new Date()): number {
    if (!effectiveDate) return now().getFullYear();
    return effectiveDate instanceof Date ? effectiveDate.getFullYear() : new Date(effectiveDate).getFullYear();
}

export function stabilizedStatementItemTaxonomy(collection: StabilizedStatementItemCollection) {
    return collection === 'expenses'
        ? {cashFlowType: 'expense', incomeStatementItemType: 'operating_expense'}
        : {cashFlowType: 'income', incomeStatementItemType: 'additional_income'};
}

export function stabilizedStatementItemFieldValue(field: string, value: unknown, appraisalYear: number): unknown {
    return field === 'yearlyAmounts' ? {[appraisalYear]: value} : value;
}

/** Zero is intentionally allowed; only null and an empty string remove/create no row. */
export function isStabilizedStatementItemValue(value: unknown): boolean {
    return value !== null && value !== '';
}
