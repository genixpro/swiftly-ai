import {describe, expect, it} from 'vitest';
import {
    calculatedRecoveryTotal,
    createNumberedRecoveryStructure,
    createRecoveryStructure,
    findRecoveryStructure,
    isDefaultRecoveryStructure,
    removeRecoveryStructure,
    replaceRecoveryStructure,
    retargetRecoveryStructureUnit,
    toggleRecoveryStructureUnit,
    updateRecoveryStructureField,
} from './recoveryStructures';

describe('createRecoveryStructure', () => {
    it('creates an editable copy without changing supplied defaults', () => {
        const defaults = {name: 'New Recovery Structure', managementRecoveryMode: 'none'};
        const structure = createRecoveryStructure(defaults);

        structure.name = 'New Recovery Structure 1';
        expect(defaults.name).toBe('New Recovery Structure');
        expect(structure).toEqual({name: 'New Recovery Structure 1', managementRecoveryMode: 'none'});
    });

    it('keeps default detection and total calculation independent of proxy getters', () => {
        expect(isDefaultRecoveryStructure({name: 'Standard'})).toBe(true);
        expect(isDefaultRecoveryStructure({name: 'Default'})).toBe(true);
        expect(isDefaultRecoveryStructure({name: 'Custom'})).toBe(false);
        expect(calculatedRecoveryTotal({
            calculatedManagementRecoveryTotal: 10,
            calculatedExpenseRecoveries: {utilities: 20},
            calculatedTaxRecoveries: {propertyTax: 30},
        })).toBe(60);
    });

    it('finds an assigned plain structure and falls back to the default', () => {
        const appraisal = {recoveryStructures: [{name: 'Standard'}, {name: 'Custom'}]};
        expect(findRecoveryStructure(appraisal, {tenancies: [{recoveryStructure: 'Custom'}]})?.name).toBe('Custom');
        expect(findRecoveryStructure(appraisal, {tenancies: [{recoveryStructure: 'Missing'}]})?.name).toBe('Standard');
    });
});

describe('recovery-structure editing transitions', () => {
    it('uses the legacy count-based name and immutable field update', () => {
        const defaults = {name: 'New Recovery Structure', managementRecoveryMode: 'operatingExpenses'};
        expect(createNumberedRecoveryStructure(defaults, 1)).toEqual({name: 'New Recovery Structure 1', managementRecoveryMode: 'operatingExpenses'});
        expect(updateRecoveryStructureField(defaults, 'managementRecoveryMode', 'none')).toEqual({name: 'New Recovery Structure', managementRecoveryMode: 'none'});
        expect(replaceRecoveryStructure([{name: 'Standard'}, {name: 'Premium'}], 1, {name: 'Edited'})).toEqual([{name: 'Standard'}, {name: 'Edited'}]);
        expect(defaults.managementRecoveryMode).toBe('operatingExpenses');
    });

    it('retargets tenancy assignments and resets all cached values on a toggle', () => {
        const unit = {tenancies: [{recoveryStructure: 'Premium'}], calculatedExpenseRecovery: 10, calculatedTaxRecovery: 3};
        expect(retargetRecoveryStructureUnit(unit, 'Premium', 'Edited')).toMatchObject({tenancies: [{recoveryStructure: 'Edited'}]});
        expect(toggleRecoveryStructureUnit(unit, 'Premium')).toMatchObject({
            tenancies: [{recoveryStructure: 'Standard'}],
            calculatedExpenseRecovery: null,
            calculatedTaxRecovery: null,
        });
        expect(unit).toMatchObject({tenancies: [{recoveryStructure: 'Premium'}], calculatedExpenseRecovery: 10});
    });

    it('removes a structure and moves attached tenancies to Standard', () => {
        const result = removeRecoveryStructure(
            [{name: 'Standard'}, {name: 'Premium'}],
            [{tenancies: [{recoveryStructure: 'Premium'}]}, {tenancies: [{recoveryStructure: 'Standard'}]}],
            1,
        );
        expect(result).toEqual({
            structures: [{name: 'Standard'}],
            units: [
                {tenancies: [{recoveryStructure: 'Standard'}]},
                {tenancies: [{recoveryStructure: 'Standard'}]},
            ],
        });
    });
});
