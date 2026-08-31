export type ComparableSaleEquationValues = Record<string, unknown>;

interface ComparableSaleEquation {
    inputs: readonly string[];
    calculate: (...values: number[]) => number;
}

type ComparableSaleEquationMap = Record<string, readonly ComparableSaleEquation[]>;

/**
 * The calculation graph formerly owned by ComparableSaleModel. Formula order
 * and the ten-pass limit match EquationModel exactly: existing calculated
 * values may refresh, while a user-replaced value remains authoritative.
 */
export const comparableSaleEquations: ComparableSaleEquationMap = {
    netOperatingIncome: [{inputs: ['salePrice', 'capitalizationRate'], calculate: (salePrice, capitalizationRate) => salePrice * (capitalizationRate / 100)}],
    salePrice: [
        {inputs: ['netOperatingIncome', 'capitalizationRate'], calculate: (netOperatingIncome, capitalizationRate) => netOperatingIncome / (capitalizationRate / 100)},
        {inputs: ['sizeSquareFootage', 'pricePerSquareFoot'], calculate: (sizeSquareFootage, pricePerSquareFoot) => sizeSquareFootage * pricePerSquareFoot},
    ],
    capitalizationRate: [{inputs: ['salePrice', 'netOperatingIncome'], calculate: (salePrice, netOperatingIncome) => (netOperatingIncome / salePrice) * 100}],
    sizeSquareFootage: [{inputs: ['salePrice', 'pricePerSquareFoot'], calculate: (salePrice, pricePerSquareFoot) => salePrice / pricePerSquareFoot}],
    pricePerSquareFoot: [{inputs: ['salePrice', 'sizeSquareFootage'], calculate: (salePrice, sizeSquareFootage) => salePrice / sizeSquareFootage}],
    sizeOfLandSqft: [{inputs: ['sizeOfLandAcres'], calculate: (sizeOfLandAcres) => sizeOfLandAcres * 43560}],
    sizeOfLandAcres: [{inputs: ['sizeOfLandSqft'], calculate: (sizeOfLandSqft) => sizeOfLandSqft / 43560}],
    sizeOfBuildableAreaSqft: [{inputs: ['sizeOfBuildableAreaAcres'], calculate: (sizeOfBuildableAreaAcres) => sizeOfBuildableAreaAcres * 43560}],
    sizeOfBuildableAreaAcres: [{inputs: ['sizeOfBuildableAreaSqft'], calculate: (sizeOfBuildableAreaSqft) => sizeOfBuildableAreaSqft / 43560}],
    pricePerSquareFootLand: [
        {inputs: ['pricePerAcreLand'], calculate: (pricePerAcreLand) => pricePerAcreLand / 43560},
        {inputs: ['salePrice', 'sizeOfLandSqft'], calculate: (salePrice, sizeOfLandSqft) => salePrice / sizeOfLandSqft},
    ],
    pricePerAcreLand: [
        {inputs: ['pricePerSquareFootLand'], calculate: (pricePerSquareFootLand) => pricePerSquareFootLand * 43560},
        {inputs: ['salePrice', 'sizeOfLandAcres'], calculate: (salePrice, sizeOfLandAcres) => salePrice / sizeOfLandAcres},
    ],
    pricePerSquareFootBuildableArea: [
        {inputs: ['pricePerAcreBuildableArea'], calculate: (pricePerAcreBuildableArea) => pricePerAcreBuildableArea / 43560},
        {inputs: ['salePrice', 'sizeOfBuildableAreaSqft'], calculate: (salePrice, sizeOfBuildableAreaSqft) => salePrice / sizeOfBuildableAreaSqft},
    ],
    pricePerAcreBuildableArea: [
        {inputs: ['pricePerSquareFootBuildableArea'], calculate: (pricePerSquareFootBuildableArea) => pricePerSquareFootBuildableArea * 43560},
        {inputs: ['salePrice', 'sizeOfBuildableAreaAcres'], calculate: (salePrice, sizeOfBuildableAreaAcres) => salePrice / sizeOfBuildableAreaAcres},
    ],
    floorSpaceIndex: [{inputs: ['sizeOfBuildableAreaSqft', 'sizeOfLandSqft'], calculate: (sizeOfBuildableAreaSqft, sizeOfLandSqft) => sizeOfBuildableAreaSqft / sizeOfLandSqft}],
    pricePerBuildableUnit: [{inputs: ['salePrice', 'buildableUnits'], calculate: (salePrice, buildableUnits) => salePrice / buildableUnits}],
    netOperatingIncomePSF: [{inputs: ['netOperatingIncome', 'sizeSquareFootage'], calculate: (netOperatingIncome, sizeSquareFootage) => netOperatingIncome / sizeSquareFootage}],
    noiPSFMultiple: [{inputs: ['netOperatingIncomePSF', 'pricePerSquareFoot'], calculate: (netOperatingIncomePSF, pricePerSquareFoot) => pricePerSquareFoot / netOperatingIncomePSF}],
    noiPerUnit: [{inputs: ['netOperatingIncome', 'numberOfUnits'], calculate: (netOperatingIncome, numberOfUnits) => netOperatingIncome / numberOfUnits}],
    totalBedrooms: [{inputs: ['numberOfBachelors', 'numberOfOneBedrooms', 'numberOfTwoBedrooms', 'numberOfThreePlusBedrooms'], calculate: (bachelors, oneBedrooms, twoBedrooms, threePlusBedrooms) => bachelors + oneBedrooms + twoBedrooms + threePlusBedrooms}],
    pricePerBedroom: [{inputs: ['totalBedrooms', 'salePrice'], calculate: (totalBedrooms, salePrice) => totalBedrooms ? salePrice / totalBedrooms : 0}],
    pricePerUnit: [{inputs: ['numberOfUnits', 'salePrice'], calculate: (numberOfUnits, salePrice) => numberOfUnits ? salePrice / numberOfUnits : 0}],
    noiPerBedroom: [{inputs: ['netOperatingIncome', 'totalBedrooms'], calculate: (netOperatingIncome, totalBedrooms) => totalBedrooms ? netOperatingIncome / totalBedrooms : 0}],
    siteCoverage: [{inputs: ['sizeSquareFootage', 'siteArea'], calculate: (sizeSquareFootage, siteArea) => (sizeSquareFootage / (siteArea * 43560)) * 100}],
};

export interface ComparableSaleCalculationResult {
    values: ComparableSaleEquationValues;
    calculatedValues: ComparableSaleEquationValues;
}

function valueFor(values: ComparableSaleEquationValues, snapshot: ComparableSaleEquationValues, field: string): unknown {
    // ComparableSaleModel exposes this one calculated value through a getter
    // rather than an own field. Recompute against the in-progress snapshot so
    // deferred immutable calculation has the same visibility as legacy writes.
    if (field === 'noiPSFMultiple' && !(field in snapshot)) {
        const pricePerSquareFoot = valueFor(values, snapshot, 'pricePerSquareFoot');
        const netOperatingIncomePSF = valueFor(values, snapshot, 'netOperatingIncomePSF');
        return pricePerSquareFoot && netOperatingIncomePSF
            ? (pricePerSquareFoot as number) / (netOperatingIncomePSF as number)
            : null;
    }
    return field in snapshot ? snapshot[field] : values[field];
}

/**
 * Produces a new editable sale and the calculation marker needed for a later
 * edit. It mirrors EquationModel's equation ordering and refresh rules.
 */
export function deriveComparableSaleFields(
    values: ComparableSaleEquationValues,
    priorCalculatedValues: ComparableSaleEquationValues = {},
): ComparableSaleCalculationResult {
    const next = {...values};
    const calculatedValues = {...priorCalculatedValues};
    let didCalculate = true;
    let rounds = 0;

    while (didCalculate && rounds < 10) {
        didCalculate = false;
        Object.entries(comparableSaleEquations).forEach(([fieldName, equations]) => {
            const currentValue = valueFor(values, next, fieldName);
            if (currentValue === null || currentValue === undefined || calculatedValues[fieldName] === currentValue) {
                equations.forEach((equation) => {
                    const inputs = equation.inputs.map((field) => valueFor(values, next, field));
                    if (inputs.every((input) => typeof input === 'number')) {
                        const newValue = equation.calculate(...inputs as number[]);
                        const latestValue = valueFor(values, next, fieldName);
                        if (newValue !== latestValue) {
                            next[fieldName] = newValue;
                            calculatedValues[fieldName] = newValue;
                            didCalculate = true;
                        }
                    }
                });
            }
        });
        rounds += 1;
    }

    return {values: next, calculatedValues};
}
