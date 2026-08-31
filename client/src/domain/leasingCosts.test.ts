import {describe, expect, it} from 'vitest';
import {
    createLeasingCostStructure,
    createNumberedLeasingCostStructure,
    isDefaultLeasingCostStructure,
    removeLeasingCostStructure,
    replaceLeasingCostStructure,
    retargetLeasingCostUnit,
    toggleLeasingCostUnit,
    toggleTreatAsVacant,
    updateLeasingCostField,
} from './leasingCosts';

describe('createLeasingCostStructure', () => {
    it('copies default values for an immediately editable structure', () => {
        const defaults = {name: 'New Leasing Structure', leasingCommissionPSF: 0};
        const structure = createLeasingCostStructure(defaults);

        structure.name = 'New Leasing Structure 1';
        expect(defaults.name).toBe('New Leasing Structure');
        expect(structure).toEqual({name: 'New Leasing Structure 1', leasingCommissionPSF: 0});
    });

    it('keeps both established default leasing-cost names', () => {
        expect(isDefaultLeasingCostStructure({name: 'Standard'})).toBe(true);
        expect(isDefaultLeasingCostStructure({name: 'Default'})).toBe(true);
        expect(isDefaultLeasingCostStructure({name: 'Custom'})).toBe(false);
    });
});

describe('leasing-cost editing transitions', () => {
    it('uses the legacy count-based name and does not mutate source defaults', () => {
        const defaults = {name: 'New Leasing Structure', tenantInducementsPSF: 0};
        expect(createNumberedLeasingCostStructure(defaults, 1)).toEqual({name: 'New Leasing Structure 1', tenantInducementsPSF: 0});
        expect(updateLeasingCostField(defaults, 'tenantInducementsPSF', 2)).toEqual({name: 'New Leasing Structure', tenantInducementsPSF: 2});
        expect(defaults).toEqual({name: 'New Leasing Structure', tenantInducementsPSF: 0});
    });

    it('replaces only the changed structure in an editable list', () => {
        const standard = {name: 'Standard'};
        const premium = {name: 'Premium'};
        const replacement = {name: 'Renamed Premium'};

        expect(replaceLeasingCostStructure([standard, premium], 1, replacement)).toEqual([standard, replacement]);
        expect(replaceLeasingCostStructure([standard, premium], 1, replacement)[0]).toBe(standard);
    });

    it('retargets structures and resets cached values when changing a unit assignment or vacancy treatment', () => {
        const unit = {leasingCostStructure: 'Premium', shouldTreatAsVacant: false, calculatedVacantUnitRentLoss: 10};
        expect(retargetLeasingCostUnit(unit, 'Premium', 'Edited')).toMatchObject({leasingCostStructure: 'Edited'});
        expect(toggleLeasingCostUnit(unit, 'Premium')).toMatchObject({leasingCostStructure: 'Standard', calculatedVacantUnitRentLoss: null});
        expect(toggleTreatAsVacant(unit)).toMatchObject({shouldTreatAsVacant: true, calculatedVacantUnitRentLoss: null});
        expect(unit).toMatchObject({leasingCostStructure: 'Premium', calculatedVacantUnitRentLoss: 10});
    });

    it('removes a structure and returns attached units to Standard', () => {
        const result = removeLeasingCostStructure(
            [{name: 'Standard'}, {name: 'Premium'}],
            [{leasingCostStructure: 'Premium'}, {leasingCostStructure: 'Standard'}],
            1,
        );
        expect(result).toEqual({
            structures: [{name: 'Standard'}],
            units: [{leasingCostStructure: 'Standard'}, {leasingCostStructure: 'Standard'}],
        });
    });
});
