import {describe, expect, it} from 'vitest';
import {
    appendRentRollUnit,
    defaultRentRollSource,
    removeRentRollUnit,
    reorderRentRollUnits,
    rentRollQueryValue,
    replaceRentRollUnit,
} from './rentRoll';

describe('rent-roll list transitions', () => {
    it('returns updated lists without changing the source rent roll', () => {
        const original = [{unitNumber: '101'}, {unitNumber: '102'}];

        expect(appendRentRollUnit(original, {unitNumber: '103'})).toEqual([
            {unitNumber: '101'}, {unitNumber: '102'}, {unitNumber: '103'},
        ]);
        expect(removeRentRollUnit(original, 0)).toEqual([{unitNumber: '102'}]);
        expect(replaceRentRollUnit(original, 1, {unitNumber: '202'})).toEqual([
            {unitNumber: '101'}, {unitNumber: '202'},
        ]);
        expect(reorderRentRollUnits([{unitNumber: '102'}, {unitNumber: '101'}])).toEqual([
            {unitNumber: '102'}, {unitNumber: '101'},
        ]);
        expect(original).toEqual([{unitNumber: '101'}, {unitNumber: '102'}]);
    });

    it('decodes deep links and keeps the first rent-roll file and page as the viewer default', () => {
        expect(rentRollQueryValue('?unit=2&name=Suite%20101', 'unit')).toBe('2');
        expect(rentRollQueryValue('?unit=2&name=Suite%20101', 'name')).toBe('Suite 101');
        expect(rentRollQueryValue('', 'unit')).toBeUndefined();
        expect(defaultRentRollSource({
            RENT_ROLL: [{fileId: 'first', pageNumbers: [3]}, {fileId: 'second', pageNumbers: [5]}],
        })).toEqual({fileId: 'first', page: 3});
        expect(defaultRentRollSource({})).toEqual({fileId: null, page: null});
    });
});
