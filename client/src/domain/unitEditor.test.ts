import {describe, expect, it} from 'vitest';
import {appendTenancy, removeTenancyAt, updateAllTenancyFields, updateTenancyField, updateUnitField} from './unitEditor';

describe('unit-editor transitions', () => {
    it('adds and removes tenancy rows without mutating the source list', () => {
        const tenancies = [{name: 'Existing Tenant'}];
        expect(appendTenancy(tenancies, 'name', 'Created from row')).toMatchObject([
            {name: 'Existing Tenant'}, {name: 'Created from row', yearlyRent: 0, monthlyRent: 0},
        ]);
        expect(removeTenancyAt([{name: 'First'}, {name: 'Second'}], 1)).toEqual([{name: 'First'}]);
        expect(tenancies).toEqual([{name: 'Existing Tenant'}]);
    });

    it('keeps the legacy direct new-row assignment and normal edit-rent conversion distinct', () => {
        expect(appendTenancy([], 'yearlyRentPSF', 25)[0]).toMatchObject({yearlyRentPSF: 25, yearlyRent: 0, monthlyRent: 0});
        expect(updateTenancyField({yearlyRent: 0, monthlyRent: 0}, 'yearlyRentPSF', 25, 1_000))
            .toMatchObject({yearlyRent: 25_000, monthlyRent: 25_000 / 12});
    });

    it('returns a changed unit field without modifying the original unit', () => {
        const unit = {unitNumber: '101', shouldTreatAsVacant: null};
        expect(updateUnitField(unit, 'shouldTreatAsVacant', true)).toEqual({unitNumber: '101', shouldTreatAsVacant: true});
        expect(unit.shouldTreatAsVacant).toBeNull();
    });

    it('updates every tenancy field without replacing the source records', () => {
        const tenancies = [{name: 'First', rentType: 'net'}, {name: 'Second', rentType: 'net'}];
        expect(updateAllTenancyFields(tenancies, 'rentType', 'gross')).toEqual([
            {name: 'First', rentType: 'gross'}, {name: 'Second', rentType: 'gross'},
        ]);
        expect(tenancies).toEqual([{name: 'First', rentType: 'net'}, {name: 'Second', rentType: 'net'}]);
    });
});
