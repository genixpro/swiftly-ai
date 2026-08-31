import {describe, expect, it} from 'vitest';
import {
    averageCurrentRentPSF,
    averageStabilizedRentPSF,
    totalCurrentAnnualRent,
    totalStabilizedRent,
    totalUnitSize,
} from './units';

const units = [
    {squareFootage: 1_000, stabilizedRentPSF: 15, stabilizedRent: 15_000, tenancies: [{yearlyRent: 12_000}]},
    {squareFootage: 500, stabilizedRentPSF: 0, stabilizedRent: 0, tenancies: [{yearlyRent: 0}]},
    {squareFootage: 1_500, stabilizedRentPSF: 18, stabilizedRent: 27_000, tenancies: [{yearlyRent: 30_000}]},
];

describe('rent-roll total selectors', () => {
    it('retains total and average calculations while excluding zero rents from averages', () => {
        expect(totalUnitSize(units)).toBe(3_000);
        expect(averageCurrentRentPSF(units)).toBe(16);
        expect(averageStabilizedRentPSF(units)).toBe(16.5);
        expect(totalCurrentAnnualRent(units)).toBe(42_000);
        expect(totalStabilizedRent(units)).toBe(42_000);
    });

    it('retains the legacy empty-average result', () => {
        expect(averageCurrentRentPSF([{...units[1], tenancies: [{yearlyRent: 0}]}])).toBeNaN();
        expect(averageStabilizedRentPSF([{...units[1], stabilizedRentPSF: 0}])).toBeNaN();
    });
});
