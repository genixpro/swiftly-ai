import {describe, expect, it} from 'vitest';
import {floorSpaceIndex, hasZoneDescription, lotSizeSquareFeet} from './generalInformation';

describe('General Information selectors', () => {
    it('preserves acreage and floor-space-index display calculations', () => {
        expect(lotSizeSquareFeet(1.25)).toBe(54_450);
        expect(floorSpaceIndex(27_225, 1.25)).toBe('0.5');
    });

    it('retains the zone-editor visibility rule for empty, null, and missing values', () => {
        expect(hasZoneDescription('CR 3.0')).toBe(true);
        expect(hasZoneDescription('')).toBe(false);
        expect(hasZoneDescription(null)).toBe(false);
        expect(hasZoneDescription(undefined)).toBe(true);
    });
});
