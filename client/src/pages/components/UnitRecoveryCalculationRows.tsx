import {Link} from 'react-router';

import CurrencyFormat from './CurrencyFormat';
import ExpenseRecoveryForUnitCalculationPopoverWrapper from './ExpenseRecoveryForUnitCalculationPopoverWrapper';
import ManagementRecoveriesForUnitCalculationPopoverWrapper from './ManagementRecoveriesForUnitCalculationPopoverWrapper';
import type {UnitCalculationAppraisal, UnitCalculationValues} from './unitCalculationTypes';

interface UnitCalculationRowsProps {
    appraisal: UnitCalculationAppraisal;
    unit: UnitCalculationValues;
}

/** Display-only recovery rows retaining the existing detailed-link/simple-popover branches. */
export default function UnitRecoveryCalculationRows({appraisal, unit}: UnitCalculationRowsProps) {
    const recoveryUrl = `/appraisal/${appraisal._id}/tenants/recovery_structures`;
    const detailed = appraisal.appraisalType === 'detailed';

    return <>
        {unit.calculatedManagementRecovery ? <tr className="stats-row">
            <td>
                {detailed ? <Link to={recoveryUrl}><strong>Calculated Management Recovery</strong></Link>
                    : <ManagementRecoveriesForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit}>
                        <strong>Calculated Management Recovery</strong>
                    </ManagementRecoveriesForUnitCalculationPopoverWrapper>}
            </td>
            <td>
                <span style={{marginLeft: '10px'}}>
                    {detailed ? <Link to={recoveryUrl}><CurrencyFormat value={unit.calculatedManagementRecovery}/></Link>
                        : <ManagementRecoveriesForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit}>
                            <CurrencyFormat value={unit.calculatedManagementRecovery}/>
                        </ManagementRecoveriesForUnitCalculationPopoverWrapper>}
                </span>
            </td>
        </tr> : null}
        {unit.calculatedExpenseRecovery ? <tr className="stats-row">
            <td>
                {detailed ? <Link to={recoveryUrl}><strong>Calculated Operating Expense Recovery</strong></Link>
                    : <ExpenseRecoveryForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit} incomeStatementItemType="operating_expense">
                        <strong>Calculated Operating Expense Recovery</strong>
                    </ExpenseRecoveryForUnitCalculationPopoverWrapper>}
            </td>
            <td>
                <span style={{marginLeft: '10px'}}>
                    {detailed ? <Link to={recoveryUrl}><CurrencyFormat value={unit.calculatedExpenseRecovery}/></Link>
                        : <ExpenseRecoveryForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit} incomeStatementItemType="operating_expense">
                            <CurrencyFormat value={unit.calculatedExpenseRecovery}/>
                        </ExpenseRecoveryForUnitCalculationPopoverWrapper>}
                </span>
            </td>
        </tr> : null}
        {unit.calculatedTaxRecovery ? <tr className="stats-row">
            <td>
                {detailed ? <Link to={recoveryUrl}><strong>Calculated Tax Recovery</strong></Link>
                    : <ExpenseRecoveryForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit} incomeStatementItemType="taxes">
                        <strong>Calculated Tax Recovery</strong>
                    </ExpenseRecoveryForUnitCalculationPopoverWrapper>}
            </td>
            <td>
                {detailed ? <Link to={recoveryUrl}>
                    <span style={{marginLeft: '10px'}}><CurrencyFormat value={unit.calculatedTaxRecovery}/></span>
                </Link> : <ExpenseRecoveryForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit} incomeStatementItemType="taxes">
                    <span style={{marginLeft: '10px'}}><CurrencyFormat value={unit.calculatedTaxRecovery}/></span>
                </ExpenseRecoveryForUnitCalculationPopoverWrapper>}
            </td>
        </tr> : null}
    </>;
}
