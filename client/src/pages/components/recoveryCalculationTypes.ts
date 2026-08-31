import type {IncomeStatementDTO} from '../../api/types';
import type {RecoveryStructure} from '../../domain/recoveryStructures';
import type {UnitCalculationValues} from './unitCalculationTypes';

/** Data consumed by the recovery explanation popovers. */
export interface RecoveryCalculationAppraisal {
    units?: UnitCalculationValues[] | null;
    expenseStatement?: IncomeStatementDTO;
    recoveryStructures?: readonly RecoveryStructure[] | null;
}
