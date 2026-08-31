import {describe, expect, it} from 'vitest';
import {
    createMarketRent,
    createNumberedMarketRent,
    removeMarketRent,
    replaceMarketRent,
    retargetMarketRentUnit,
    toggleMarketRentUnit,
    updateMarketRentField,
} from './marketRents';

describe('createMarketRent', () => {
    it('returns an editable copy without mutating the configured defaults', () => {
        const defaults = {name: 'New Market Rent', amountPSF: 1};
        const marketRent = createMarketRent(defaults);

        marketRent.name = 'New Market Rent 2';
        expect(defaults.name).toBe('New Market Rent');
        expect(marketRent).toEqual({name: 'New Market Rent 2', amountPSF: 1});
    });
});

describe('market-rent editing transitions', () => {
    it('creates the existing numbered default and updates fields without mutating the source record', () => {
        const marketRent = {name: 'New Market Rent', amountPSF: 1};
        expect(createNumberedMarketRent(marketRent, 1)).toEqual({name: 'New Market Rent 2', amountPSF: 1});
        expect(updateMarketRentField(marketRent, 'amountPSF', 22)).toEqual({name: 'New Market Rent', amountPSF: 22});
        expect(replaceMarketRent([marketRent, {name: 'Other'}], 0, {name: 'Updated'})).toEqual([{name: 'Updated'}, {name: 'Other'}]);
        expect(marketRent).toEqual({name: 'New Market Rent', amountPSF: 1});
    });

    it('retargets renamed assignments and resets every cached calculation when toggling an assignment', () => {
        const unit = {
            unitNumber: '101', marketRent: 'Premium', calculatedMarketRentDifferential: 100,
            calculatedVacantUnitRentLoss: 25, calculatedTaxRecovery: 4,
        };
        expect(retargetMarketRentUnit(unit, 'Premium', 'Edited')).toMatchObject({marketRent: 'Edited'});
        expect(toggleMarketRentUnit(unit, 'Premium')).toMatchObject({
            marketRent: null,
            calculatedMarketRentDifferential: null,
            calculatedVacantUnitRentLoss: null,
            calculatedTaxRecovery: null,
        });
        expect(unit).toMatchObject({marketRent: 'Premium', calculatedMarketRentDifferential: 100});
    });

    it('removes the selected record and only clears units assigned to it', () => {
        const result = removeMarketRent(
            [{name: 'Standard'}, {name: 'Premium'}],
            [{unitNumber: '101', marketRent: 'Premium'}, {unitNumber: '102', marketRent: 'Standard'}],
            1,
        );
        expect(result.marketRents).toEqual([{name: 'Standard'}]);
        expect(result.units).toEqual([
            {unitNumber: '101', marketRent: null},
            {unitNumber: '102', marketRent: 'Standard'},
        ]);
    });
});
