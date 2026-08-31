import {describe, expect, it} from 'vitest';
import {computeComparableStatistics} from './comparableStatistics';

describe('computeComparableStatistics', () => {
    it('uses only numeric comparable values and returns exact bounds and mean', () => {
        expect(computeComparableStatistics([
            {salePrice: 100},
            {salePrice: 200},
            {salePrice: '300'},
            {salePrice: null},
        ], 'salePrice')).toEqual({min: 100, max: 200, average: 150});
    });

    it('keeps zero as a real input and retains the legacy empty result', () => {
        expect(computeComparableStatistics([{rate: 0}, {rate: 2}], 'rate')).toEqual({min: 0, max: 2, average: 1});
        expect(computeComparableStatistics([], 'rate')).toEqual({min: null, max: null, average: 0});
    });
});
