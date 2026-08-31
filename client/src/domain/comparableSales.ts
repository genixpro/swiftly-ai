/**
 * Read-only comparable-sale calculations used by table headers and valuation
 * statistics. They intentionally retain the established null and truthiness
 * behavior used by the comparable editing workflow.
 */
export interface ComparableSaleCalculationInput {
    pricePerSquareFoot?: number | null;
    netOperatingIncomePSF?: number | null;
    useStabilizedNoi?: boolean | null;
    netOperatingIncome?: number | null;
    capitalizationRate?: number | null;
    noiPerUnit?: number | null;
    noiPerBedroom?: number | null;
    stabilizedNoiVacancyRate?: number | null;
    stabilizedNoiStructuralAllowance?: number | null;
    stabilizedNoiCustomDeduction?: number | null;
}

export interface ComparableSaleMetrics {
    noiPSFMultiple: number | null | undefined;
    stabilizedNOIVacancyDeduction: number | null | undefined;
    stabilizedNOIStructuralAllowance: number | null | undefined;
    stabilizedNOICustomDeduction: number | null | undefined;
    stabilizedNOI: number | null | undefined;
    overallStabilizationRate: number | null | undefined;
    stabilizedCapitalizationRate: number | null | undefined;
    stabilizedNOIPSFMultiple: number | null | undefined;
    stabilizedNetOperatingIncomePSF: number | null | undefined;
    stabilizedNOIPerUnit: number | null | undefined;
    stabilizedNOIPerBedroom: number | null | undefined;
    displayNetOperatingIncome: number | null | undefined;
    displayCapitalizationRate: number | null | undefined;
    displayNOIPSFMultiple: number | null | undefined;
    displayNetOperatingIncomePSF: number | null | undefined;
    displayNOIPerUnit: number | null | undefined;
    displayNOIPerBedroom: number | null | undefined;
}

export function comparableSaleMetrics(sale: ComparableSaleCalculationInput): ComparableSaleMetrics {
    const noiPSFMultiple = sale.pricePerSquareFoot && sale.netOperatingIncomePSF
        ? sale.pricePerSquareFoot / sale.netOperatingIncomePSF
        : null;

    const stabilizedNOIVacancyDeduction = sale.netOperatingIncome === null
        ? null
        : sale.stabilizedNoiVacancyRate
            ? sale.netOperatingIncome! * sale.stabilizedNoiVacancyRate / 100
            : null;
    const stabilizedNOIStructuralAllowance = sale.netOperatingIncome === null
        ? null
        : sale.stabilizedNoiStructuralAllowance
            ? sale.netOperatingIncome! * sale.stabilizedNoiStructuralAllowance / 100
            : null;
    const stabilizedNOICustomDeduction = sale.netOperatingIncome === null
        ? null
        : sale.stabilizedNoiCustomDeduction
            ? sale.netOperatingIncome! * sale.stabilizedNoiCustomDeduction / 100
            : null;

    let stabilizedNOI = sale.netOperatingIncome;
    if (stabilizedNOI !== null) {
        if (stabilizedNOIVacancyDeduction) stabilizedNOI! -= stabilizedNOIVacancyDeduction;
        if (stabilizedNOIStructuralAllowance) stabilizedNOI! -= stabilizedNOIStructuralAllowance;
        if (stabilizedNOICustomDeduction) stabilizedNOI! -= stabilizedNOICustomDeduction;
    }

    const overallStabilizationRate = sale.netOperatingIncome === null || stabilizedNOI === null
        ? null
        : stabilizedNOI! / sale.netOperatingIncome!;
    const stabilizedCapitalizationRate = sale.capitalizationRate === null
        ? null
        : sale.capitalizationRate! / overallStabilizationRate!;
    const stabilizedNOIPSFMultiple = noiPSFMultiple === null
        ? null
        : noiPSFMultiple! * overallStabilizationRate!;
    const stabilizedNetOperatingIncomePSF = sale.netOperatingIncomePSF === null
        ? null
        : sale.netOperatingIncomePSF! * overallStabilizationRate!;
    const stabilizedNOIPerUnit = sale.noiPerUnit === null
        ? null
        : sale.noiPerUnit! * overallStabilizationRate!;
    const stabilizedNOIPerBedroom = sale.noiPerBedroom === null
        ? null
        : sale.noiPerBedroom! * overallStabilizationRate!;

    return {
        noiPSFMultiple,
        stabilizedNOIVacancyDeduction,
        stabilizedNOIStructuralAllowance,
        stabilizedNOICustomDeduction,
        stabilizedNOI,
        overallStabilizationRate,
        stabilizedCapitalizationRate,
        stabilizedNOIPSFMultiple,
        stabilizedNetOperatingIncomePSF,
        stabilizedNOIPerUnit,
        stabilizedNOIPerBedroom,
        displayNetOperatingIncome: sale.useStabilizedNoi ? stabilizedNOI : sale.netOperatingIncome,
        displayCapitalizationRate: sale.useStabilizedNoi ? stabilizedCapitalizationRate : sale.capitalizationRate,
        displayNOIPSFMultiple: sale.useStabilizedNoi ? stabilizedNOIPSFMultiple : noiPSFMultiple,
        displayNetOperatingIncomePSF: sale.useStabilizedNoi ? stabilizedNetOperatingIncomePSF : sale.netOperatingIncomePSF,
        displayNOIPerUnit: sale.useStabilizedNoi ? stabilizedNOIPerUnit : sale.noiPerUnit,
        displayNOIPerBedroom: sale.useStabilizedNoi ? stabilizedNOIPerBedroom : sale.noiPerBedroom,
    };
}

export interface ComparableSaleDescriptionInput {
    description?: string | null;
    saleDate?: unknown;
    propertyType?: string | null;
    address?: string | null;
    sizeSquareFootage?: number | null;
    vendor?: string | null;
    purchaser?: string | null;
    salePrice?: number | null;
    tenants?: string | null;
    constructionDate?: string | null;
    clearCeilingHeight?: number | null;
    siteCoverage?: number | null;
    finishedOfficePercent?: number | null;
    parking?: string | null;
    additionalInfo?: string | null;
    capitalizationRate?: number | null;
}

function numberWithCommas(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Preserves the legacy generated-description copy and its truthy-field behavior. */
export function computedComparableSaleDescription(sale: ComparableSaleDescriptionInput): string {
    if (sale.description) return sale.description;

    let text = '';
    if (sale.saleDate && sale.propertyType && sale.address) {
        text += `Sale of an ${sale.propertyType} building located at ${sale.address}. `;
    }
    if (sale.sizeSquareFootage) {
        text += `The building has a gross rentable area of ${numberWithCommas(sale.sizeSquareFootage)} square feet. `;
    }
    if (sale.vendor && sale.purchaser) text += `The vendor was ${sale.vendor} and the purchaser was ${sale.purchaser}. `;
    if (sale.salePrice) text += `The property was sold for $${numberWithCommas(sale.salePrice)}. `;
    if (sale.tenants) text += `The tenants include: ${sale.tenants}. `;

    let propertyFeatures = '';
    if (sale.constructionDate) propertyFeatures += `construction date of ${sale.constructionDate}, `;
    if (sale.clearCeilingHeight) propertyFeatures += `clear ceiling height of ${sale.clearCeilingHeight} feet, `;
    if (sale.siteCoverage) propertyFeatures += `site coverage of ${sale.siteCoverage.toFixed(0)}%, `;
    if (sale.finishedOfficePercent) propertyFeatures += `finished office percentage of ${sale.finishedOfficePercent.toFixed(2)}%, `;
    if (sale.parking) propertyFeatures += `${sale.parking} parking spaces, `;
    if (sale.additionalInfo) propertyFeatures += sale.additionalInfo;
    if (propertyFeatures) text += `Property features include: ${propertyFeatures}. `;

    text = text.replace(', .', '.');
    text = text.replace('an retail', 'a retail');
    text = text.replace('an land', 'a land');
    if (sale.capitalizationRate) text += `The net income yielded a ${sale.capitalizationRate.toFixed(2)}% rate of return. `;
    return text;
}

export type ComparableSaleView<T extends Record<string, unknown>> = T & ComparableSaleMetrics & {
    computedDescriptionText: string;
};

/** Materializes the legacy read-only getters for plain draft rendering. */
export function comparableSaleView<T extends Record<string, unknown>>(sale: T): ComparableSaleView<T> {
    return {
        ...sale,
        ...comparableSaleMetrics(sale as T & ComparableSaleCalculationInput),
        computedDescriptionText: computedComparableSaleDescription(sale as T & ComparableSaleDescriptionInput),
    };
}
