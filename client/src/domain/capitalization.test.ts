import {describe, expect, it} from 'vitest';
import {capitalizationComparableColumns, createCapitalizationModifier} from './capitalization';

describe('capitalizationComparableColumns', () => {
    it('retains the recorded proxy-era modifier defaults', () => {
        expect(createCapitalizationModifier()).toEqual({name: 'Modification', amount: 0});
    });

    it('uses the residential rent/NOI-per-unit columns', () => {
        expect(capitalizationComparableColumns('residential')).toEqual({
            headers: [
                ['saleDate'], ['address'], ['salePrice'], ['propertyType', 'propertyTags'],
                ['averageMonthlyRentPerUnit', 'numberOfUnits'], ['displayNOIPerUnit', 'displayNOIPerBedroom'],
                ['displayCapitalizationRate'],
            ],
            stats: ['displayNetOperatingIncomePSF', 'pricePerSquareFoot', 'displayCapitalizationRate'],
        });
    });

    it('uses the non-residential size/NOI-per-square-foot columns', () => {
        expect(capitalizationComparableColumns('industrial')).toEqual({
            headers: [
                ['saleDate'], ['address'], ['salePrice'], ['propertyType', 'propertyTags'],
                ['sizeSquareFootage'], ['displayNetOperatingIncomePSF'], ['displayCapitalizationRate'],
            ],
            stats: ['displayNetOperatingIncomePSF', 'pricePerSquareFoot', 'displayCapitalizationRate'],
        });
    });
});
