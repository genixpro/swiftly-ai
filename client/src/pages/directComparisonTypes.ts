import type {DirectComparisonModifier} from '../domain/directComparison';
import type {AppraisalDTO} from '../api/types';
import type {ComparableAdjustment} from '../domain/comparableAdjustmentChart';

export interface AdjustmentChartInputs {
    adjustments?: ComparableAdjustment[];
    showAdjustmentChart?: boolean;
}

export interface DirectComparisonInputs {
    applyAmortization?: boolean | null;
    applyFreeRentLoss?: boolean | null;
    applyMarketRentDifferential?: boolean | null;
    applyVacantUnitLeasingCosts?: boolean | null;
    applyVacantUnitRentLoss?: boolean | null;
    directComparisonMetric?: string | null;
    modifiers?: DirectComparisonModifier[];
    noiPSFPricePerSquareFoot?: number | null;
    pricePerAcreLand?: number | null;
    pricePerBuildableUnit?: number | null;
    pricePerSquareFoot?: number | null;
    pricePerSquareFootBuildableArea?: number | null;
    pricePerSquareFootLand?: number | null;
    [field: string]: unknown;
}

export interface DirectComparisonValuation {
    amortizedCapitalInvestment?: number | null;
    comparativeValue?: number | null;
    freeRentRentLoss?: number | null;
    marketRentDifferential?: number | null;
    vacantUnitLeasupCosts?: number | null;
    vacantUnitRentLoss?: number | null;
    valuation?: number | null;
    valuationRounded?: number | null;
}

export interface DirectComparisonAppraisal extends AppraisalDTO {
    adjustmentChart: AdjustmentChartInputs;
    address?: string;
    buildableArea?: number | null;
    buildableUnits?: number | null;
    comparableSales?: unknown;
    comparableSalesDCA?: string[] | null;
    directComparisonInputs: DirectComparisonInputs;
    directComparisonValuation: DirectComparisonValuation;
    sizeOfBuilding?: number | null;
    sizeOfLand?: number | null;
    stabilizedStatement: {
        freeRentRentLoss?: number | null;
        marketRentDifferential?: number | null;
        netOperatingIncome?: number | null;
        vacantUnitLeasupCosts?: number | null;
        vacantUnitRentLoss?: number | null;
    };
    stabilizedStatementInputs: {
        marketRentDifferentialDiscountRate?: number | null;
        [field: string]: unknown;
    };
}

export interface ViewDirectComparisonValuationProps {
    appraisal: DirectComparisonAppraisal;
    appraisalId?: string;
    navigate?: unknown;
    saveAppraisal(appraisal: DirectComparisonAppraisal): void;
    search?: unknown;
}

export interface DirectComparisonState {
    capitalizationRate: number;
    comparableSales: readonly object[];
    downloadDropdownOpen?: boolean;
    sort: string;
}
