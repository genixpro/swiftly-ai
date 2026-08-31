import {describe, expect, it} from 'vitest';
import {
    addComparableId,
    comparableSearchRequest,
    defaultComparableSearch,
    hasComparableSale,
    hasComparableSaleInCapRate,
    hasComparableSaleInDCA,
    removeComparableId,
    sortComparables,
} from './comparables';

describe('comparable domain operations', () => {
    it('uses the legacy two-year default and carries the subject property type', () => {
        const now = Date.UTC(2026, 7, 30);
        expect(defaultComparableSearch('saleDateFrom', 'office', now)).toEqual({
            saleDateFrom: new Date(now - (1000 * 3600 * 24 * 365 * 2)),
            propertyType: 'office',
        });
        expect(defaultComparableSearch('leaseDateFrom', '', now)).toEqual({
            leaseDateFrom: new Date(now - (1000 * 3600 * 24 * 365 * 2)),
        });
    });

    it('builds requests with the same form, map, and sort precedence', () => {
        expect(comparableSearchRequest(
            {propertyType: 'office', locationTop: 1},
            {locationTop: 2, locationBottom: 0},
            '-saleDate',
        )).toEqual({propertyType: 'office', locationTop: 2, locationBottom: 0, sort: '-saleDate'});
    });

    it('adds ids and removes only their first occurrence', () => {
        expect(addComparableId(['sale-1'], 'sale-1')).toEqual(['sale-1', 'sale-1']);
        expect(removeComparableId(['sale-1', 'sale-2', 'sale-1'], 'sale-1')).toEqual(['sale-2', 'sale-1']);
        expect(removeComparableId(['sale-1'], 'missing')).toEqual(['sale-1']);
    });

    it('retains comparable inclusion checks for ids, missing lists, and missing ids', () => {
        const data = {comparableSalesCapRate: ['sale-1'], comparableSalesDCA: ['sale-2']};
        expect(hasComparableSaleInCapRate(data, {_id: 'sale-1'})).toBe(true);
        expect(hasComparableSaleInDCA(data, {_id: 'sale-1'})).toBe(false);
        expect(hasComparableSale(data, {_id: 'sale-1'})).toBe(true);
        expect(hasComparableSaleInCapRate(data, {_id: 'sale-2'})).toBe(false);
        expect(hasComparableSaleInDCA(data, {_id: 'sale-2'})).toBe(true);
        expect(hasComparableSale(data, {_id: 'sale-2'})).toBe(true);
        expect(hasComparableSale(data, {_id: 'missing'})).toBe(false);
        expect(hasComparableSale(data, {})).toBe(false);

        expect(hasComparableSale({comparableSalesCapRate: null, comparableSalesDCA: undefined}, {_id: 'sale-1'})).toBe(false);
    });

    it('preserves the legacy stable comparable ordering', () => {
        const comparables = [
            {address: 'Third', saleDate: undefined},
            {address: 'Second', saleDate: '2025-01-01'},
            {address: 'First', saleDate: '2025-01-01'},
            {address: 'Fourth', saleDate: null},
        ];

        expect(sortComparables(comparables, '+saleDate').map((comparable) => comparable.address))
            .toEqual(['Second', 'First', 'Fourth', 'Third']);
        expect(sortComparables(comparables, '-saleDate').map((comparable) => comparable.address))
            .toEqual(['Third', 'Fourth', 'First', 'Second']);
        expect(sortComparables(comparables)).toBe(comparables);
    });
});
