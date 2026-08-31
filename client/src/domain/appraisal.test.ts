import {describe, expect, it} from 'vitest';
import {
    buildAppraisalPatch,
    appraisalEffectiveDate,
    appraisalBuildingSize,
    buildingSize,
    createUnit,
    currentTenancy,
    insertAt,
    move,
    normalizeAppraisal,
    occupancyRate,
    removeAt,
    resetUnitCalculations,
    replaceAt,
    isVacantInFirstYear,
    unitCalculatedTotalRecovery,
    unitMarketRentAmount,
    unitStabilizedRent,
    unitStabilizedRentPSF,
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

    it('retains recorded building and occupancy selector outputs', () => {
        expect(buildingSize(fixture)).toBe(1_500);
        expect(appraisalBuildingSize(fixture)).toBe(1_500);
        expect(occupancyRate(fixture)).toBe(2 / 3);
        expect(currentTenancy(fixture.units[0], new Date('2026-01-01').getTime())?.name).toBe('Tenant');
    });

    it('retains the incomplete legacy building-size fallback', () => {
        expect(appraisalBuildingSize({sizeOfBuilding: 123})).toBe(123);
    });

    it('retains legacy zero-size occupancy output', () => {
        expect(Number.isNaN(occupancyRate({units: []}))).toBe(true);
    });

    it('returns the persisted effective date or the supplied current date', () => {
        expect(appraisalEffectiveDate({effectiveDate: '2026-04-15'}).toISOString()).toContain('2026-04-15');
        expect(appraisalEffectiveDate({}, () => new Date('2030-01-01'))).toEqual(new Date('2030-01-01'));
    });

    it('retains the recorded default unit and tenancy shape', () => {
        const created = createUnit();

        expect(created).toMatchObject({
            unitNumber: 'new',
            floorNumber: 1,
            squareFootage: 1,
            leasingCostStructure: 'Default',
            shouldApplyMarketRentDifferential: null,
            shouldUseMarketRent: null,
            shouldTreatAsVacant: null,
            tenancies: [{name: 'Vacant', yearlyRent: 0}],
        });
    });

    it('retains recorded unit rent, vacancy, recovery, and calculation-reset behavior', () => {
        const now = new Date('2026-08-30T00:00:00Z').getTime();
        const raw = {
            unitNumber: '101', squareFootage: 1_000, marketRent: 'Market', shouldUseMarketRent: true,
            calculatedManagementRecovery: 100, calculatedExpenseRecovery: null, calculatedTaxRecovery: 25,
            calculatedMarketRentDifferential: 50,
            tenancies: [
                {name: 'Current', yearlyRent: 18_000, startDate: '2025-01-01', endDate: '2027-12-31'},
                {name: 'Future', yearlyRent: 24_000, startDate: '2027-12-31', endDate: '2030-01-01'},
            ],
        };
        expect(unitMarketRentAmount(raw, [{name: 'Market', amountPSF: 20}])).toBe(20);
        expect(unitStabilizedRentPSF(raw, [{name: 'Market', amountPSF: 20}], now)).toBe(20);
        expect(unitStabilizedRent(raw, [{name: 'Market', amountPSF: 20}], now)).toBe(20_000);
        expect(isVacantInFirstYear(raw, now)).toBe(false);
        expect(unitCalculatedTotalRecovery(raw)).toBe(125);
        expect(resetUnitCalculations(raw)).toMatchObject({
            ...raw,
            calculatedManagementRecovery: null,
            calculatedExpenseRecovery: null,
            calculatedTaxRecovery: null,
            calculatedMarketRentDifferential: null,
        });
    });
});
