import {describe, expect, it} from 'vitest';
import {deriveComparableSaleFields} from './comparableSaleEquations';

describe('deriveComparableSaleFields', () => {
    it('derives all connected valuation fields without rounding intermediate values', () => {
        const result = deriveComparableSaleFields({
            salePrice: 1_000_000,
            capitalizationRate: 5,
            pricePerSquareFoot: 250,
            sizeOfLandAcres: 2,
            sizeOfBuildableAreaAcres: 3,
            buildableUnits: 20,
            numberOfUnits: 10,
            numberOfBachelors: 1,
            numberOfOneBedrooms: 2,
            numberOfTwoBedrooms: 3,
            numberOfThreePlusBedrooms: 4,
            siteArea: 2,
        });

        expect(result.values).toMatchObject({
            netOperatingIncome: 50_000,
            sizeSquareFootage: 4_000,
            netOperatingIncomePSF: 12.5,
            pricePerSquareFoot: 250,
            pricePerBuildableUnit: 50_000,
            sizeOfLandSqft: 87_120,
            sizeOfBuildableAreaSqft: 130_680,
            pricePerAcreLand: 500_000,
            pricePerAcreBuildableArea: 1_000_000 / 3,
            totalBedrooms: 10,
            pricePerBedroom: 100_000,
            pricePerUnit: 100_000,
            noiPerUnit: 5_000,
            noiPerBedroom: 5_000,
            siteCoverage: (4_000 / (2 * 43_560)) * 100,
        });
    });

    it('refreshes a calculated value but preserves a user override on the next edit', () => {
        const initial = deriveComparableSaleFields({netOperatingIncome: 100_000, capitalizationRate: 5});
        expect(initial.values.salePrice).toBe(2_000_000);

        const refreshed = deriveComparableSaleFields(
            {...initial.values, capitalizationRate: 10},
            initial.calculatedValues,
        );
        expect(refreshed.values.salePrice).toBe(1_000_000);

        const manualOverride = deriveComparableSaleFields(
            {...refreshed.values, salePrice: 1_100_000, capitalizationRate: 8},
            refreshed.calculatedValues,
        );
        expect(manualOverride.values.salePrice).toBe(1_100_000);
    });
});
