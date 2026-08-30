import {describe, expect, it} from 'vitest';
import AppraisalModel from '../models/AppraisalModel';
import {
    buildAppraisalPatch,
    buildingSize,
    currentTenancy,
    insertAt,
    move,
    normalizeAppraisal,
    occupancyRate,
    removeAt,
    replaceAt,
} from './appraisal';

const fixture = {
    _id: 'a1',
    name: 'Harbour',
    imageUrls: ['one.jpg', 'two.jpg'],
    captions: ['Front'],
    units: [
        {unitNumber: '100', squareFootage: 1000, tenancies: [{name: 'Tenant', yearlyRent: 24_000, startDate: '2020-01-01', endDate: '2030-01-01'}]},
        {unitNumber: '200', squareFootage: 500, shouldTreatAsVacant: true, tenancies: [{name: 'Vacant', yearlyRent: 0}]},
    ],
};

describe('appraisal domain boundary', () => {
    it('normalizes legacy defaults without mutating API data', () => {
        const normalized = normalizeAppraisal(fixture);
        expect(normalized).not.toBe(fixture);
        expect(normalized.appraisalType).toBe('detailed');
        expect(normalized.captions).toEqual(['Front', '']);
        expect(normalized.units?.[0]).toMatchObject({floorNumber: 1, leasingCostStructure: 'Default'});
        expect(fixture.captions).toEqual(['Front']);
    });

    it('generates exact top-level patches and excludes identifiers and server-derived fields', () => {
        expect(buildAppraisalPatch(
            {_id: 'a1', name: 'Before', units: [], updatedAt: 'old'},
            {_id: 'a1', name: 'After', units: [], updatedAt: 'new', sizeOfBuilding: 0},
        )).toEqual({name: 'After'});
    });

    it('provides immutable nested-list operations', () => {
        const original = ['a', 'b', 'c'];
        expect(replaceAt(original, 1, 'x')).toEqual(['a', 'x', 'c']);
        expect(insertAt(original, 1, 'x')).toEqual(['a', 'x', 'b', 'c']);
        expect(removeAt(original, 1)).toEqual(['a', 'c']);
        expect(move(original, 0, 2)).toEqual(['b', 'c', 'a']);
        expect(original).toEqual(['a', 'b', 'c']);
    });

    it('differentially matches legacy building and occupancy selectors', () => {
        const legacy = AppraisalModel.create(fixture) as unknown as {sizeOfBuilding: number; occupancyRate: number};
        expect(buildingSize(fixture)).toBe(legacy.sizeOfBuilding);
        expect(occupancyRate(fixture)).toBe(legacy.occupancyRate);
        expect(currentTenancy(fixture.units[0], new Date('2026-01-01').getTime())?.name).toBe('Tenant');
    });

    it('retains legacy zero-size occupancy output', () => {
        expect(Number.isNaN(occupancyRate({units: []}))).toBe(true);
    });
});
