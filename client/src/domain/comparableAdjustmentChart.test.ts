import {describe, expect, it} from 'vitest';
import {adjustedComparableSaleAmount, createComparableAdjustment} from './comparableAdjustmentChart';

describe('comparable adjustment factory', () => {
    it('retains the recorded proxy-era defaults and supplied values', () => {
        expect(createComparableAdjustment({adjustmentType: 'amount'})).toEqual({
            name: null,
            adjustmentType: 'amount',
            adjustmentPercentages: {},
            adjustmentAmounts: {},
            adjustmentTexts: {},
        });
    });

    it('retains amount, percentage, and zero-value adjustment semantics', () => {
        const comparable = {_id: 'sale-1', salePrice: 100};
        expect(adjustedComparableSaleAmount(comparable, [
            {adjustmentType: 'amount', adjustmentAmounts: {'sale-1': 10}},
            {adjustmentType: 'percentage', adjustmentPercentages: {'sale-1': 5}},
        ])).toBe(115);
        expect(adjustedComparableSaleAmount(comparable, [
            {adjustmentType: 'amount', adjustmentAmounts: {'sale-1': 0}},
            {adjustmentType: 'percentage', adjustmentPercentages: {'sale-1': 0}},
        ])).toBe(100);
    });
});
