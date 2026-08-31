import {describe, expect, it} from 'vitest';
import {
    createDirectComparisonModifier,
    directComparisonColumns,
    directComparisonValuesFromNOIMultiple,
    directComparisonValuesFromPricePerSquareFoot,
} from './directComparison';

describe('direct comparison selectors', () => {
    it('retains the recorded proxy-era modifier defaults', () => {
        expect(createDirectComparisonModifier()).toEqual({name: 'New Adjustment', amount: 0});
    });

    it.each([
        ['psf', [['saleDate'], ['address'], ['salePrice'], ['sizeSquareFootage', 'siteCoverage'], ['pricePerSquareFoot']], [['salePrice'], ['sizeSquareFootage'], ['pricePerSquareFoot']]],
        ['noi_multiple', [['saleDate'], ['address'], ['salePrice'], ['sizeSquareFootage', 'occupancyRate'], ['pricePerSquareFoot'], ['displayNetOperatingIncomePSF'], ['displayNOIPSFMultiple']], [['pricePerSquareFoot'], ['displayNetOperatingIncomePSF'], ['displayNOIPSFMultiple']]],
        ['psf_land', [['saleDate'], ['address'], ['salePrice'], ['propertyType', 'propertyTags'], ['sizeOfLandSqft'], ['pricePerSquareFootLand']], [['salePrice'], ['sizeOfLandSqft'], ['pricePerSquareFootLand']]],
        ['per_acre_land', [['saleDate'], ['address'], ['salePrice'], ['propertyType', 'propertyTags'], ['sizeOfLandAcres'], ['pricePerAcreLand']], [['salePrice'], ['sizeOfLandAcres'], ['pricePerAcreLand']]],
        ['psf_buildable_area', [['saleDate'], ['address'], ['salePrice'], ['sizeOfBuildableAreaSqft', 'sizeOfLandSqft'], ['floorSpaceIndex'], ['pricePerSquareFootBuildableArea', 'pricePerSquareFootLand']], [['salePrice'], ['sizeOfBuildableAreaSqft'], ['pricePerSquareFootBuildableArea']]],
        ['per_buildable_unit', [['saleDate'], ['address'], ['salePrice'], ['sizeOfBuildableAreaSqft', 'sizeOfLandSqft', 'buildableUnits'], ['pricePerSquareFootBuildableArea', 'pricePerSquareFootLand', 'pricePerBuildableUnit']], [['salePrice'], ['buildableUnits'], ['pricePerBuildableUnit']]],
        ['per_unit', [['saleDate'], ['address'], ['salePrice'], ['numberOfUnits', 'totalBedrooms'], ['displayNOIPerUnit', 'displayNOIPerBedroom'], ['pricePerUnit', 'pricePerBedroom']], [['salePrice'], ['pricePerUnit']]],
        [undefined, [['saleDate'], ['address'], ['salePrice'], ['sizeSquareFootage'], ['pricePerSquareFoot']], [['salePrice'], ['sizeSquareFootage'], ['pricePerSquareFoot']]],
    ])('uses the legacy %s column and statistic order', (metric, headers, stats) => {
        expect(directComparisonColumns(metric)).toEqual({headers, stats});
    });

    it('converts NOI multiples and price-per-square-foot without rounding', () => {
        expect(directComparisonValuesFromNOIMultiple(100_000, 10_000, 12)).toEqual({noiPSFMultiple: 12, noiPSFPricePerSquareFoot: 120});
        expect(directComparisonValuesFromPricePerSquareFoot(100_000, 10_000, 120)).toEqual({noiPSFMultiple: 12, noiPSFPricePerSquareFoot: 120});
    });
});
