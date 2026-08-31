import {describe, expect, it} from 'vitest';
import {
    addIncomeStatementYear,
    incomeStatementItemLatestAmount,
    incomeStatementItemMachineName,
    incomeStatementItemYearlyAmountsPSF,
    incomeStatementLatestYear,
    setIncomeStatementItemYearlyAmountsPSF,
    removeIncomeStatementYear,
} from './incomeStatement';

describe('income-statement selectors', () => {
    it('retains the recorded proxy-era latest values and display keys', () => {
        const data = {
            years: [2024, 2026, 2025],
            items: [{name: 'Utilities.$', yearlyAmounts: {2024: 10, 2025: 12, 2026: 15}}],
        };
        expect(incomeStatementLatestYear(data)).toBe(2026);
        expect(incomeStatementItemMachineName(data.items[0])).toBe('Utilities');
        expect(incomeStatementItemLatestAmount(data.items[0])).toBe(15);
        expect(incomeStatementItemLatestAmount({yearlyAmounts: {}})).toBeUndefined();
    });

    it('retains recorded PSF values and two-decimal writeback behavior', () => {
        const item = {yearlyAmounts: {2025: 10_000, 2026: 10_004}};

        expect(incomeStatementItemYearlyAmountsPSF(item, 1_000)).toEqual({2025: 10, 2026: 10.004});
        expect(setIncomeStatementItemYearlyAmountsPSF(item, 1_000, {2025: 10, 2026: 12}))
            .toEqual({2025: 10_000, 2026: 12_000});
        expect(setIncomeStatementItemYearlyAmountsPSF(item, null, {2025: 10})).toEqual({2025: 10_000});
    });

    it('creates forward and discounted prior years, then removes them immutably', () => {
        const statement = {
            years: [2025],
            yearlySourceTypes: {},
            items: [{name: 'Rent', yearlyAmounts: {2025: 102} as Record<string, number>}],
        };

        const forward = addIncomeStatementYear(statement, 2);
        expect(forward).toEqual({
            years: [2025, 2026],
            yearlySourceTypes: {2026: 'user'},
            items: [{name: 'Rent', yearlyAmounts: {2025: 102, 2026: 104.04}}],
        });
        const discounted = addIncomeStatementYear(statement, 2, 2025);
        expect(discounted.items[0].yearlyAmounts[2024]).toBeCloseTo(100);
        expect(discounted.years).toEqual([2024, 2025]);
        expect(removeIncomeStatementYear(forward, 2025)).toEqual({
            years: [2026],
            yearlySourceTypes: {2026: 'user'},
            items: [{name: 'Rent', yearlyAmounts: {2026: 104.04}}],
        });
        expect(statement).toEqual({
            years: [2025],
            yearlySourceTypes: {},
            items: [{name: 'Rent', yearlyAmounts: {2025: 102}}],
        });
    });
});
