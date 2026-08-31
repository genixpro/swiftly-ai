export interface CapitalizationComparableColumns {
    headers: string[][];
    stats: string[];
}

export interface CapitalizationModifier {
    name?: string | null;
    amount?: number | null;
    [field: string]: unknown;
}

/** Persisted inputs used by the capitalization valuation and its editable input panel. */
export interface CapitalizationInputs {
    capitalizationRate?: number | string | null;
    applyMarketRentDifferential?: boolean | string | null;
    applyVacantUnitLeasingCosts?: boolean | string | null;
    applyVacantUnitRentLoss?: boolean | string | null;
    applyFreeRentLoss?: boolean | string | null;
    applyAmortization?: boolean | string | null;
    marketRentDifferentialDiscountRate?: number | null;
    modifiers?: CapitalizationModifier[];
    [field: string]: unknown;
}

/** Calculated stabilized-statement values used by the capitalization workflow. */
export interface CapitalizationStatement {
    amortizedCapitalInvestment?: number | null;
    capitalization?: number | null;
    freeRentRentLoss?: number | null;
    marketRentDifferential?: number | null;
    netOperatingIncome?: number | null;
    vacantUnitLeasupCosts?: number | null;
    vacantUnitRentLoss?: number | null;
    valuation?: number | null;
    valuationRounded?: number | null;
}

/** Creates the editable capitalization adjustment used by the legacy model. */
export function createCapitalizationModifier(values: CapitalizationModifier = {}): CapitalizationModifier {
    return {name: 'Modification', amount: 0, ...values};
}

export function capitalizationComparableColumns(propertyType: string | null | undefined): CapitalizationComparableColumns {
    const headers = propertyType === 'residential'
        ? [
            ['saleDate'],
            ['address'],
            ['salePrice'],
            ['propertyType', 'propertyTags'],
            ['averageMonthlyRentPerUnit', 'numberOfUnits'],
            ['displayNOIPerUnit', 'displayNOIPerBedroom'],
            ['displayCapitalizationRate'],
        ]
        : [
            ['saleDate'],
            ['address'],
            ['salePrice'],
            ['propertyType', 'propertyTags'],
            ['sizeSquareFootage'],
            ['displayNetOperatingIncomePSF'],
            ['displayCapitalizationRate'],
        ];

    return {
        headers,
        stats: ['displayNetOperatingIncomePSF', 'pricePerSquareFoot', 'displayCapitalizationRate'],
    };
}
