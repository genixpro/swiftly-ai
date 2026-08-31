export interface DirectComparisonColumns {
    headers: string[][];
    stats: string[][];
}

export interface DirectComparisonModifier {
    name?: string | null;
    amount?: number | null;
    [field: string]: unknown;
}

/** Creates the editable direct-comparison adjustment used by the legacy model. */
export function createDirectComparisonModifier(values: DirectComparisonModifier = {}): DirectComparisonModifier {
    return {name: 'New Adjustment', amount: 0, ...values};
}

/** Exact comparable table configuration used by the direct-comparison screen. */
export function directComparisonColumns(metric: string | null | undefined): DirectComparisonColumns {
    const headers = [['saleDate'], ['address']];
    const stats: string[][] = [];

    headers.push(['salePrice']);
    stats.push([metric === 'noi_multiple' ? 'pricePerSquareFoot' : 'salePrice']);

    switch (metric) {
        case 'psf':
            headers.push(['sizeSquareFootage', 'siteCoverage']);
            stats.push(['sizeSquareFootage']);
            break;
        case 'noi_multiple':
            headers.push(['sizeSquareFootage', 'occupancyRate'], ['pricePerSquareFoot']);
            break;
        case 'psf_land':
            headers.push(['propertyType', 'propertyTags'], ['sizeOfLandSqft']);
            stats.push(['sizeOfLandSqft']);
            break;
        case 'per_acre_land':
            headers.push(['propertyType', 'propertyTags'], ['sizeOfLandAcres']);
            stats.push(['sizeOfLandAcres']);
            break;
        case 'psf_buildable_area':
            headers.push(['sizeOfBuildableAreaSqft', 'sizeOfLandSqft'], ['floorSpaceIndex']);
            stats.push(['sizeOfBuildableAreaSqft']);
            break;
        case 'per_buildable_unit':
            headers.push(['sizeOfBuildableAreaSqft', 'sizeOfLandSqft', 'buildableUnits']);
            stats.push(['buildableUnits']);
            break;
        case 'per_unit':
            headers.push(['numberOfUnits', 'totalBedrooms']);
            break;
        default:
            headers.push(['sizeSquareFootage']);
            stats.push(['sizeSquareFootage']);
    }

    switch (metric) {
        case 'psf':
            headers.push(['pricePerSquareFoot']);
            stats.push(['pricePerSquareFoot']);
            break;
        case 'noi_multiple':
            headers.push(['displayNetOperatingIncomePSF'], ['displayNOIPSFMultiple']);
            stats.push(['displayNetOperatingIncomePSF'], ['displayNOIPSFMultiple']);
            break;
        case 'psf_land':
            headers.push(['pricePerSquareFootLand']);
            stats.push(['pricePerSquareFootLand']);
            break;
        case 'per_acre_land':
            headers.push(['pricePerAcreLand']);
            stats.push(['pricePerAcreLand']);
            break;
        case 'psf_buildable_area':
            headers.push(['pricePerSquareFootBuildableArea', 'pricePerSquareFootLand']);
            stats.push(['pricePerSquareFootBuildableArea']);
            break;
        case 'per_buildable_unit':
            headers.push(['pricePerSquareFootBuildableArea', 'pricePerSquareFootLand', 'pricePerBuildableUnit']);
            stats.push(['pricePerBuildableUnit']);
            break;
        case 'per_unit':
            headers.push(['displayNOIPerUnit', 'displayNOIPerBedroom'], ['pricePerUnit', 'pricePerBedroom']);
            stats.push(['pricePerUnit']);
            break;
        default:
            headers.push(['pricePerSquareFoot']);
            stats.push(['pricePerSquareFoot']);
    }

    return {headers, stats};
}

export function directComparisonValuesFromNOIMultiple(netOperatingIncome: number, sizeOfBuilding: number, multiple: number) {
    return {
        noiPSFMultiple: multiple,
        noiPSFPricePerSquareFoot: (netOperatingIncome / sizeOfBuilding) * multiple,
    };
}

export function directComparisonValuesFromPricePerSquareFoot(netOperatingIncome: number, sizeOfBuilding: number, pricePerSquareFoot: number) {
    return {
        noiPSFMultiple: pricePerSquareFoot / (netOperatingIncome / sizeOfBuilding),
        noiPSFPricePerSquareFoot: pricePerSquareFoot,
    };
}
