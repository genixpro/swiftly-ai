import {describe, expect, it} from 'vitest';
import {
    ComparableLeaseCalculationInput,
    comparableLeaseView,
    startingComparableLeaseYearlyRent,
} from './comparableLeases';

describe('startingComparableLeaseYearlyRent', () => {
    it.each([
        [{rentEscalations: [{yearlyRent: 120_000}, {yearlyRent: 130_000}]}, 120_000],
        [{rentEscalations: [{yearlyRent: 0}]}, null],
        [{rentEscalations: []}, null],
        [{}, null],
    ] as const)('preserves the established first-escalation display value for %o', (fixture, expected) => {
        expect(startingComparableLeaseYearlyRent(fixture)).toBe(expected);
    });
});

describe('comparableLeaseView', () => {
    it('materializes the legacy computed rent without mutating the source record', () => {
        const lease = {address: '10 Main Street', rentEscalations: [{yearlyRent: 42_000}]};

        expect(comparableLeaseView(lease)).toEqual({...lease, startingYearlyRent: 42_000});
        expect(lease).not.toHaveProperty('startingYearlyRent');
    });
});
