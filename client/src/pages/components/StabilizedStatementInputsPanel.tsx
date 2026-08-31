import {Card, CardBody, Table} from 'reactstrap';
import FieldDisplayEdit from './FieldDisplayEdit';
import type {EditableStabilizedStatementAppraisal} from '../../domain/stabilizedStatement';

interface StabilizedStatementInputsPanelProps {
    appraisal: EditableStabilizedStatementAppraisal;
    expenses?: unknown[];
    onManagementExpenseCalculationRuleChange(field: string, value: unknown): void;
    onRecoveryStructureChange(field: string, value: unknown): void;
    onStabilizedInputChange(field: string, value: unknown): void;
}

/**
 * Presentation-only extraction of the stabilized-statement input card. The
 * field props and callback timing intentionally match the original screen.
 */
function StabilizedStatementInputsPanel({
    appraisal,
    expenses,
    onManagementExpenseCalculationRuleChange,
    onRecoveryStructureChange,
    onStabilizedInputChange,
}: StabilizedStatementInputsPanelProps) {
    return <Card className={"stabilized-statement-inputs"} outline>
        <CardBody>
            <h3>Inputs</h3>

            <Table>
                <tbody>
                <tr>
                    <td>Vacancy Rate</td>
                    <td>
                        <FieldDisplayEdit
                            type={"percent"}
                            placeholder={"Vacancy Rate"}
                            value={appraisal.stabilizedStatementInputs ? appraisal.stabilizedStatementInputs.vacancyRate : 5.0}
                            onChange={(newValue) => onStabilizedInputChange("vacancyRate", newValue)}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Management Expense Mode</td>
                    <td>
                        <FieldDisplayEdit
                            type={"managementExpenseMode"}
                            placeholder={"Management Expense Mode"}
                            value={appraisal.stabilizedStatementInputs ? appraisal.stabilizedStatementInputs.managementExpenseMode : null}
                            exclude={appraisal.appraisalType === 'simple' ? ["income_statement"] : []}
                            onChange={(newValue) => onStabilizedInputChange("managementExpenseMode", newValue)}
                        />
                    </td>
                </tr>
                {
                    appraisal.stabilizedStatementInputs.managementExpenseMode === 'rule' || appraisal.stabilizedStatementInputs.managementExpenseMode === 'combined_structural_rule' ?
                        <tr>
                            <td>
                                <span>Management Expense Calculation</span>
                            </td>
                            <td className={"management-expense-rule"}>
                                {
                                    appraisal.stabilizedStatement.calculationErrorFields.indexOf("managementExpenses") !== -1 ?
                                        <i className={"fa fa-exclamation-circle"} title={appraisal.stabilizedStatement.calculationErrors['managementExpenses']} />
                                        : null
                                }
                                <FieldDisplayEdit
                                    type={"percent"}
                                    placeholder={"Percent Of"}
                                    hideIcon={true}
                                    value={appraisal.stabilizedStatementInputs ? appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.percentage : null}
                                    onChange={(newValue) => onManagementExpenseCalculationRuleChange("percentage", newValue)}
                                />
                                <span className={"spacer"}>of</span>
                                <FieldDisplayEdit
                                    type="calculationField"
                                    className={"management-expense-mode"}
                                    expenses={appraisal.expenseStatement.items}
                                    placeholder={"Expense Calculation Field"}
                                    value={appraisal.stabilizedStatementInputs ? appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.field : null}
                                    hideIcon={true}
                                    onChange={(newValue) => onManagementExpenseCalculationRuleChange('field', newValue)}
                                />
                            </td>
                        </tr>
                        : null
                }
                {
                    appraisal.appraisalType === 'simple' ?
                        <tr>
                            <td>
                                <span>Management Recovery Mode</span>
                            </td>
                            <td className={"management-expense-rule"}>
                                {
                                    appraisal.stabilizedStatement.calculationErrorFields.indexOf("managementRecovery") !== -1 ?
                                        <i className={"fa fa-exclamation-circle"} title={appraisal.stabilizedStatement.calculationErrors['managementRecovery']} />
                                        : null
                                }
                                {
                                    appraisal.recoveryStructures[0].managementRecoveryMode !== "custom" && appraisal.recoveryStructures[0].managementRecoveryMode !== "none" ?
                                        <FieldDisplayEdit
                                            key={1}
                                            type="percent"
                                            placeholder={"Management Recovery %"}
                                            value={appraisal.recoveryStructures[0].managementRecoveryOperatingPercentage}
                                            hideInput={true}
                                            hideIcon={true}
                                            onChange={(newValue) => onRecoveryStructureChange('managementRecoveryOperatingPercentage', newValue)}
                                        />
                                        : <span />
                                }
                                {
                                    appraisal.recoveryStructures[0].managementRecoveryMode !== "custom" && appraisal.recoveryStructures[0].managementRecoveryMode !== "none" ?
                                        <span className={"spacer"}>
                                            of
                                        </span>
                                        : null
                                }
                                <FieldDisplayEdit
                                    type="managementRecoveryMode"
                                    className={"management-recovery-mode"}
                                    expenses={expenses}
                                    placeholder={"Management Recovery Mode"}
                                    value={appraisal.recoveryStructures[0].managementRecoveryMode}
                                    hideInput={true}
                                    hideIcon={true}
                                    onChange={(newValue) => onRecoveryStructureChange('managementRecoveryMode', newValue)}
                                />
                            </td>
                        </tr>
                        : null
                }
                {
                    appraisal.stabilizedStatementInputs.managementExpenseMode === 'rule' || appraisal.stabilizedStatementInputs.managementExpenseMode === 'income_statement' ?
                        <tr>
                            <td>Structural Allowance</td>
                            <td>
                                <FieldDisplayEdit
                                    type={"percent"}
                                    placeholder={"Structural Allowance Rate"}
                                    value={appraisal.stabilizedStatementInputs ? appraisal.stabilizedStatementInputs.structuralAllowancePercent : 2.0}
                                    onChange={(newValue) => onStabilizedInputChange("structuralAllowancePercent", newValue)}
                                />
                            </td>
                        </tr> : null
                }
                {
                    appraisal.stabilizedStatementInputs.expensesMode === 'tmi'  ?
                        <tr className={"data-row vacancy-row"}>
                            <td>
                                <span>TMI (psf)</span>&nbsp;

                            </td>
                            <td>
                                <FieldDisplayEdit
                                    type={"currency"}
                                    placeholder={"TMI Rate (psf)"}
                                    value={appraisal.stabilizedStatementInputs ? appraisal.stabilizedStatementInputs.tmiRatePSF : 0}
                                    onChange={(newValue) => onStabilizedInputChange("tmiRatePSF", newValue)}
                                />
                            </td>
                        </tr> : null
                }
                </tbody>
            </Table>

        </CardBody>
    </Card>;
}

export default StabilizedStatementInputsPanel;
