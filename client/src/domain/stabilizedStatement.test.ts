import {describe, expect, it} from 'vitest';
import {
    createIncomeStatementItem,
    isStabilizedStatementItemValue,
    stabilizedStatementAppraisalYear,
    stabilizedStatementItemFieldValue,
    stabilizedStatementItemTaxonomy,
} from './stabilizedStatement';

describe('stabilized statement editor selectors', () => {
    it('retains the recorded proxy-era editable item defaults', () => {
        expect(createIncomeStatementItem({cashFlowType: 'expense', incomeStatementItemType: 'taxes'})).toEqual({
            name: null,
            yearlyAmounts: {},
            yearlySourceTypes: {},
            extractionReferences: {},
            cashFlowType: 'expense',
            incomeStatementItemType: 'taxes',
        });
    });

    it('uses the effective-date year, otherwise the supplied current year', () => {
        expect(stabilizedStatementAppraisalYear(new Date(2027, 4, 10), () => new Date(2030, 0, 1))).toBe(2027);
        expect(stabilizedStatementAppraisalYear('2028-05-10T00:00:00.000Z', () => new Date(2030, 0, 1))).toBe(2028);
        expect(stabilizedStatementAppraisalYear(undefined, () => new Date(2030, 0, 1))).toBe(2030);
    });

    it('retains income and expense item taxonomy', () => {
        expect(stabilizedStatementItemTaxonomy('incomes')).toEqual({cashFlowType: 'income', incomeStatementItemType: 'additional_income'});
        expect(stabilizedStatementItemTaxonomy('expenses')).toEqual({cashFlowType: 'expense', incomeStatementItemType: 'operating_expense'});
    });

    it('wraps yearly amounts and permits zero values while rejecting blank values', () => {
        expect(stabilizedStatementItemFieldValue('yearlyAmounts', 0, 2025)).toEqual({2025: 0});
        expect(stabilizedStatementItemFieldValue('name', 'Parking', 2025)).toBe('Parking');
        expect(isStabilizedStatementItemValue(0)).toBe(true);
        expect(isStabilizedStatementItemValue('')).toBe(false);
        expect(isStabilizedStatementItemValue(null)).toBe(false);
    });
});
