import {describe, expect, it} from 'vitest';
import {createAmortizationItem} from './amortization';

describe('createAmortizationItem', () => {
    it('fills every legacy default around the supplied inline field', () => {
        const start = new Date(2025, 0, 15);
        expect(createAmortizationItem('amount', 50_000, () => start)).toEqual({
            name: 'New Amortization Item',
            amount: 50_000,
            interest: 3,
            discountRate: 8,
            startDate: start,
            periodMonths: 1,
        });
    });

    it('does not create a row for legacy falsy editor values', () => {
        expect(createAmortizationItem('amount', 0)).toBeUndefined();
        expect(createAmortizationItem('name', '')).toBeUndefined();
    });
});
