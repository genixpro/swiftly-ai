import type {IncomeStatementDTO, UnitDTO} from '../../api/types';
import type {LeasingCostStructure} from '../../domain/leasingCosts';
import type {MarketRent} from '../../domain/marketRents';
import type {RecoveryStructure} from '../../domain/recoveryStructures';

export interface UnitCalculationAppraisal {
    _id?: string;
    appraisalType?: string;
    effectiveDate?: Date | string | null;
    leasingCosts?: readonly LeasingCostStructure[] | null;
    marketRents?: readonly MarketRent[] | null;
    units?: UnitCalculationValues[] | null;
    expenseStatement?: IncomeStatementDTO;
    recoveryStructures?: readonly RecoveryStructure[] | null;
    stabilizedStatementInputs?: {marketRentDifferentialDiscountRate?: number | null};
    [field: string]: unknown;
}

export interface UnitCalculationValues extends UnitDTO {
    calculatedExpenseRecovery?: number | null;
    calculatedFreeRentLoss?: number | null;
    calculatedFreeRentMonths?: number | null;
    calculatedFreeRentNetAmount?: number | null;
    calculatedManagementRecovery?: number | null;
    calculatedMarketRentDifferential?: number | null;
    calculatedTaxRecovery?: number | null;
    calculatedVacantUnitLeasupCosts?: number | null;
    calculatedVacantUnitRentLoss?: number | null;
    [field: string]: unknown;
}
