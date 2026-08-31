import type {IncomeStatementItemDTO, TenancyDTO} from '../api/types';
import type {RecoveryStructure as DomainRecoveryStructure} from '../domain/recoveryStructures';
import type {RecoveryCalculationAppraisal} from './components/recoveryCalculationTypes';
import type {UnitCalculationValues} from './components/unitCalculationTypes';

export interface RecoveryStructure extends DomainRecoveryStructure {
    calculatedExpenseRecoveries: Record<string, number | null | undefined>;
    calculatedManagementRecoveries: Record<string, number | null | undefined>;
    calculatedManagementRecoveryTotal?: number | null;
    calculatedTaxRecoveries: Record<string, number | null | undefined>;
    expenseRecoveries: Record<string, number>;
    managementRecoveries: Record<string, number>;
    managementRecoveryMode: string;
    name: string;
    taxRecoveries: Record<string, number>;
}

export interface RecoveryTenancy extends TenancyDTO {
    name: string;
    recoveryStructure: string | null;
    rentType: string;
}

export interface RecoveryUnit extends UnitCalculationValues {
    calculatedExpenseRecovery?: number | null;
    calculatedManagementRecovery?: number | null;
    calculatedTaxRecovery?: number | null;
    tenancies: RecoveryTenancy[];
    squareFootage: number;
    unitNumber: string | number;
}

export interface RecoveryAppraisal extends RecoveryCalculationAppraisal {
    expenseStatement: {items: IncomeStatementItemDTO[]};
    recoveryStructures: RecoveryStructure[];
    stabilizedStatement: {
        operatingExpenseRecovery?: number | null;
        managementRecovery?: number | null;
        taxRecovery?: number | null;
    };
    units: RecoveryUnit[];
}
