import {describe, expect, it} from 'vitest';

import {updateComparableSearch} from './comparable-sale/searchModel';
import {calculateGroupTotals, cleanNumericalValue} from './income-statement/domain';
import {
    findLeasingCostStructure,
    findMarketRent,
    nextLeasingStructureName,
} from './unit-details/domain';

describe('extracted editor domain helpers', () => {
    it('updates comparable filters without mutating prior state', () => {
        const original = {propertyType: 'office', salePriceFrom: 10};
        const changed = updateComparableSearch(original, 'salePriceFrom', null);
        expect(changed).toEqual({propertyType: 'office'});
        expect(original).toHaveProperty('salePriceFrom', 10);
        expect(updateComparableSearch(original, 'salePriceTo', 20)).toMatchObject({salePriceTo: 20});
    });

    it('normalizes statement amounts and calculates grouped totals', () => {
        expect(cleanNumericalValue('($1,250.50)')).toBe(-1250.5);
        expect(cleanNumericalValue('')).toBe(0);
        expect(calculateGroupTotals({expense: 'Expenses'}, {
            years: [2025, 2026],
            items: [
                {incomeStatementItemType: 'expense', yearlyAmounts: {2025: 10, 2026: 12}},
                {incomeStatementItemType: 'ignored', yearlyAmounts: {2025: 99}},
            ],
        })).toEqual({expense_total: {2025: 10, 2026: 12}});
    });

    it('resolves unit-specific and default structures', () => {
        const appraisal = {
            leasingCosts: [{name: 'Default'}, {name: 'Suite 1'}],
            marketRents: [{name: 'Office'}],
        };
        expect(findLeasingCostStructure(appraisal, {leasingCostStructure: 'Suite 1'}, 'Default').name).toBe('Suite 1');
        expect(findLeasingCostStructure(appraisal, {leasingCostStructure: 'Missing'}, 'Default').name).toBe('Default');
        expect(findMarketRent(appraisal, {marketRent: 'Office'}).name).toBe('Office');
        expect(findMarketRent(appraisal, {marketRent: 'Missing'})).toBeNull();
        expect(nextLeasingStructureName(appraisal)).toBe('New Leasing Structure 3');
    });
});
