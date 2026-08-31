import { Row, Col, Card, CardBody, Button } from 'reactstrap';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import '@components/Common/datetime-compat.css'
import CurrencyFormat from "./components/CurrencyFormat";
import ManagementExpenseRecoveryCalculationPopoverWrapper from "./components/ManagementExpenseRecoveryCalculationPopoverWrapper";
import RecoveryExpensePercentageEditor from './components/RecoveryExpensePercentageEditor';
import {incomeStatementItemMachineName} from '../domain/incomeStatement';
import RecoveryTenantApplicableEditor from './components/RecoveryTenantApplicableEditor';
import {
    calculatedRecoveryTotal,
    createNumberedRecoveryStructure,
    isDefaultRecoveryStructure,
    removeRecoveryStructure,
    replaceRecoveryStructure,
    retargetRecoveryStructureUnit,
    toggleRecoveryStructureUnit,
    updateRecoveryStructureField,
} from '../domain/recoveryStructures';

import type {IncomeStatementItemDTO} from '../api/types';
import type {RecoveryAppraisal, RecoveryStructure, RecoveryUnit} from './recoveryStructureTypes';
import {confirmBrowserAction} from '../components/platform/browserActions';

interface RecoveryStructureEditorProps {
    appraisal: RecoveryAppraisal;
    expenses: IncomeStatementItemDTO[];
    onChange(recovery: RecoveryStructure | undefined): void;
    onDeleteRecovery(recovery: RecoveryStructure): void;
    recovery: RecoveryStructure;
    units: RecoveryUnit[];
}

interface ViewRecoveryStructuresProps {
    appraisal: RecoveryAppraisal;
    saveAppraisal(appraisal: RecoveryAppraisal): void;
}

const ExpensePercentageEditor = RecoveryExpensePercentageEditor;
const TenantApplicableEditor = RecoveryTenantApplicableEditor;



function RecoveryStructureEditor(props: RecoveryStructureEditorProps)
{
    const editor = {
        props,
        changeRecoveryStructureField: (field: string, newValue: unknown) => {
            const recoveryStructure = editor.props.recovery;

        if (newValue !== recoveryStructure[field])
        {
            if (field === "name")
            {
                editor.props.appraisal.units.forEach((unit) =>
                {
                    const nextUnit = retargetRecoveryStructureUnit(unit, recoveryStructure.name, newValue);
                    if (nextUnit !== unit) unit.tenancies = nextUnit.tenancies as RecoveryUnit['tenancies'];
                });
            }

            Object.assign(recoveryStructure, updateRecoveryStructureField(recoveryStructure, field, newValue));
            editor.props.onChange(recoveryStructure);
        }
        },
        changeOperatingExpenseRecovery: (expenseName: string, newValue: unknown) => {
        if (newValue !== editor.props.recovery.expenseRecoveries[expenseName])
        {
            editor.props.recovery.expenseRecoveries[expenseName] = newValue as number;
            editor.props.onChange(editor.props.recovery);
        }
        },
        changeManagementRecovery: (expenseName: string, newValue: unknown) => {
        if (newValue !== editor.props.recovery.managementRecoveries[expenseName])
        {
            editor.props.recovery.managementRecoveries[expenseName] = newValue as number;
            editor.props.onChange(editor.props.recovery);
        }
        },
        changeTaxRecovery: (expenseName: string, newValue: unknown) => {
        if (newValue !== editor.props.recovery.taxRecoveries[expenseName])
        {
            editor.props.recovery.taxRecoveries[expenseName] = newValue as number;
            // The legacy class typo passed its undefined `propsrecovery`
            // property to the parent. Preserve that exact callback value; the
            // earlier arrow conversion accidentally turned it into a runtime
            // TypeError because lexical `this` is undefined in modules.
            editor.props.onChange(undefined);
        }
        },
        changeUnitRecoveryStructure: (unit: RecoveryUnit) => {
        const nextUnit = toggleRecoveryStructureUnit(unit, editor.props.recovery.name);
        Object.assign(unit, nextUnit);
        editor.props.onChange(editor.props.recovery);
        },
        operatingExpensesAndTaxes: () => {
        return editor.props.expenses.filter((expense) => (expense.incomeStatementItemType === "operating_expense" || expense.incomeStatementItemType === "taxes"))
        },
        operatingExpenses: () => {
        return editor.props.expenses.filter((expense) => expense.incomeStatementItemType === "operating_expense")
        },
        taxes: () => {
        return editor.props.expenses.filter((expense) =>  expense.incomeStatementItemType === "taxes")
        },
    };
    const recovery = editor.props.recovery;

        return <Card className={"recovery-structure-editor"}>
            <CardBody>
                <table className="recovery-structure-table">
                    <tbody>
                    <tr className={"header-row"}>
                        <td colSpan={3} className={"label-column"}>
                            {
                                !isDefaultRecoveryStructure(recovery) ?
                                    <FieldDisplayEdit
                                        type="text"
                                        placeholder="Recovery Structure Name"
                                        value={recovery.name}
                                        onChange={(newValue) => editor.changeRecoveryStructureField('name', newValue)}
                                        hideInput={false}
                                        hideIcon={true}
                                    />
                                    : <strong className={"title"}>Standard Recovery Structure</strong>
                            }
                        </td>
                        <td className={"rule-calculated-amount-column"}>
                            <strong>Calculated<br/>Amounts</strong>
                        </td>
                    </tr>
                    <tr className={"recovery-rule label-row"}>
                        <td className={"label-column"}>
                            <strong>Management Recoveries</strong>
                        </td>
                        {
                            recovery.managementRecoveryMode !== "custom" && recovery.managementRecoveryMode !== "none" ?
                                    <td className={"rule-percentage-column"}>
                                        <FieldDisplayEdit
                                            key={1}
                                            type="percent"
                                            placeholder={"Management Recovery %"}
                                            value={recovery.managementRecoveryOperatingPercentage}
                                            hideInput={false}
                                            hideIcon={true}
                                            onChange={(newValue) => editor.changeRecoveryStructureField('managementRecoveryOperatingPercentage', newValue)}
                                        />
                                    </td> : <td className={"rule-percentage-column"} />
                        }
                        <td className={"rule-field-column"}>
                            <FieldDisplayEdit
                                type="managementRecoveryMode"
                                expenses={editor.props.expenses}
                                placeholder={"Management Recovery Mode"}
                                value={recovery.managementRecoveryMode}
                                hideInput={false}
                                hideIcon={true}
                                onChange={(newValue) => editor.changeRecoveryStructureField('managementRecoveryMode', newValue)}
                            />
                        </td>
                        <td className={"rule-calculated-amount-column"}>
                            {
                                recovery.managementRecoveryMode !== "custom" && recovery.managementRecoveryMode !== "none" ?
                                <ManagementExpenseRecoveryCalculationPopoverWrapper appraisal={editor.props.appraisal} recovery={recovery}>
                                    <CurrencyFormat value={recovery.calculatedManagementRecoveryTotal}/>
                                </ManagementExpenseRecoveryCalculationPopoverWrapper>: null
                            }
                        </td>
                    </tr>
                    {
                        recovery.managementRecoveryMode === "custom" ? <tr className={"recovery-rule label-row"}>
                            <td className={"label-column"}>
                            </td>
                            {
                                editor.operatingExpensesAndTaxes().length === 0 ?
                                    [
                                        <td className={"rule-percentage-column"} key={1} colSpan={2}>
                                            No expenses found. Please go to "Expenses" or upload an Income Statement.
                                        </td>,
                                    ] : null
                            }
                            {
                                editor.operatingExpensesAndTaxes().length > 0 ?
                                    <ExpensePercentageEditor
                                        expense={editor.operatingExpensesAndTaxes()[0]}
                                        recovery={recovery}
                                        appraisal={editor.props.appraisal}
                                        onChange={(newValue) => editor.changeManagementRecovery(incomeStatementItemMachineName(editor.operatingExpensesAndTaxes()[0]), newValue)}
                                        calculated={recovery.calculatedManagementRecoveries[incomeStatementItemMachineName(editor.operatingExpensesAndTaxes()[0])]}
                                        value={recovery.managementRecoveries[incomeStatementItemMachineName(editor.operatingExpensesAndTaxes()[0])]}
                                    />
                                    : null
                            }
                        </tr> : null
                    }
                    {
                        recovery.managementRecoveryMode === "custom" ?
                            editor.operatingExpensesAndTaxes().map((expense, expenseIndex) =>
                        {
                            if (expenseIndex === 0)
                            {
                                return null;
                            }

                            return <tr className={"recovery-rule"} key={expenseIndex}>
                                <td className={"label-column"}>
                                </td>
                                <ExpensePercentageEditor
                                    expense={expense}
                                    recovery={recovery}
                                    appraisal={editor.props.appraisal}
                                    onChange={(newValue) => editor.changeManagementRecovery(incomeStatementItemMachineName(expense), newValue)}
                                    calculated={recovery.calculatedManagementRecoveries[incomeStatementItemMachineName(expense)]}
                                    value={recovery.managementRecoveries[incomeStatementItemMachineName(expense)]}
                                />
                            </tr>
                        }) : null
                    }
                    <tr className={"recovery-rule label-row"}>
                        <td className={"label-column"}>
                            <strong>Operating Expense Recoveries</strong>
                        </td>
                        {
                            editor.operatingExpenses().length === 0 ?
                                [
                                    <td className={"rule-percentage-column"} key={1} colSpan={2}>
                                        No expenses found. Please go to "Expenses" or upload an Income Statement.
                                    </td>,
                                ] : null
                        }
                        {
                            editor.operatingExpenses().length > 0 ?
                                <ExpensePercentageEditor
                                    expense={editor.operatingExpenses()[0]}
                                    recovery={recovery}
                                    appraisal={editor.props.appraisal}
                                    onChange={(newValue) => editor.changeOperatingExpenseRecovery(incomeStatementItemMachineName(editor.operatingExpenses()[0]), newValue)}
                                    calculated={recovery.calculatedExpenseRecoveries[incomeStatementItemMachineName(editor.operatingExpenses()[0])]}
                                    value={recovery.expenseRecoveries[incomeStatementItemMachineName(editor.operatingExpenses()[0])]}
                                />
                                : null
                        }
                    </tr>
                    {
                        editor.operatingExpenses().map((expense, expenseIndex) =>
                        {
                            if (expenseIndex === 0)
                            {
                                return null;
                            }

                            return <tr className={"recovery-rule"} key={expenseIndex}>
                                <td className={"label-column"}>
                                </td>
                                <ExpensePercentageEditor
                                    expense={expense}
                                    recovery={recovery}
                                    appraisal={editor.props.appraisal}
                                    onChange={(newValue) => editor.changeOperatingExpenseRecovery(incomeStatementItemMachineName(expense), newValue)}
                                    calculated={recovery.calculatedExpenseRecoveries[incomeStatementItemMachineName(expense)]}
                                    value={recovery.expenseRecoveries[incomeStatementItemMachineName(expense)]}
                                />
                            </tr>
                        })
                    }
                    <tr className={"recovery-rule label-row"}>
                        <td className={"label-column"}>
                            <strong>Tax Recoveries</strong>
                        </td>
                        {
                            editor.taxes().length === 0 ?
                                [
                                    <td className={"rule-percentage-column"} key={1} colSpan={2}>
                                        No taxes found. Please go to "Expenses" or upload an Income or Tax statement.
                                    </td>,
                                ] : null
                        }
                        {
                            editor.taxes().length > 0 ?
                                <ExpensePercentageEditor
                                    expense={editor.taxes()[0]}
                                    recovery={recovery}
                                    appraisal={editor.props.appraisal}
                                    onChange={(newValue) => editor.changeTaxRecovery(incomeStatementItemMachineName(editor.taxes()[0]), newValue)}
                                    calculated={recovery.calculatedTaxRecoveries[incomeStatementItemMachineName(editor.taxes()[0])]}
                                    value={recovery.taxRecoveries[incomeStatementItemMachineName(editor.taxes()[0])]}
                                />
                                : null
                        }
                    </tr>
                    {
                        editor.taxes().map((expense, expenseIndex) =>
                        {
                            if (expenseIndex === 0)
                            {
                                return null;
                            }

                            return <tr className={"recovery-rule"} key={expenseIndex}>
                                <td className={"label-column"}>
                                </td>
                                <ExpensePercentageEditor
                                    expense={expense}
                                    recovery={recovery}
                                    appraisal={editor.props.appraisal}
                                    onChange={(newValue) => editor.changeTaxRecovery(incomeStatementItemMachineName(expense), newValue)}
                                    calculated={recovery.calculatedTaxRecoveries[incomeStatementItemMachineName(expense)]}
                                    value={recovery.taxRecoveries[incomeStatementItemMachineName(expense)]}
                                />
                            </tr>
                        })
                    }
                    <tr className={"total-spacer-row"}>
                        <td className={"label-column"} />
                        <td className={"rule-percentage-column"} />
                        <td className={"rule-field-column"} />
                        <td className={"rule-calculated-amount-column"} />
                    </tr>
                    <tr className={"total-row"}>
                        <td className={"label-column"}>
                        </td>
                        <td className={"rule-percentage-column"}>
                        </td>
                        <td className={"rule-field-column"}>
                            <strong>Total</strong>
                        </td>
                        <td className={"rule-calculated-amount-column"}>
                            <CurrencyFormat value={calculatedRecoveryTotal(recovery)}/>
                        </td>
                    </tr>
                    <tr className={"recovery-rule label-row"}>
                        <td className={"label-column"}>
                            <strong>Tenants Applied To</strong>
                        </td>
                        {
                            editor.props.units.length > 0 ?
                                <TenantApplicableEditor unit={editor.props.units[0]} recovery={recovery} onChange={() => editor.changeUnitRecoveryStructure(editor.props.units[0])}/>
                                : null
                        }
                    </tr>
                    {
                        editor.props.units.map((unit, unitIndex) =>
                        {
                            if (unitIndex === 0)
                            {
                                return null;
                            }

                            return <tr className={"recovery-rule"} key={unitIndex}>
                                <td className={"label-column"} />
                                <TenantApplicableEditor unit={unit} recovery={recovery} onChange={() => editor.changeUnitRecoveryStructure(unit)}/>
                            </tr>
                        })
                    }
                    <tr className={"total-spacer-row"}>
                        <td className={"label-column"} />
                        <td className={"rule-percentage-column"} />
                        <td className={"rule-field-column"} />
                        <td className={"rule-calculated-amount-column"} />
                    </tr>
                    <tr className={"total-row"}>
                        <td className={"label-column"}>
                        </td>
                        <td className={"rule-percentage-column"}>
                        </td>
                        <td className={"rule-field-column"}>
                            <strong>Total</strong>
                        </td>
                        <td className={"rule-calculated-amount-column"}>
                            <CurrencyFormat value={calculatedRecoveryTotal(recovery)}/>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <table className="units-applicable-table">
                    <tbody>
                    </tbody>
                </table>
                {
                    !isDefaultRecoveryStructure(recovery) ?
                        <Button color={"danger"} className={"delete-button"} onClick={() => editor.props.onDeleteRecovery(editor.props.recovery)}>Delete</Button>
                        : null
                }

            </CardBody>
        </Card>
}

const defaultRecoveryStructureData = {
    name: "New Recovery Structure",
    managementRecoveryMode: "operatingExpenses",
    managementRecoveryOperatingPercentage: 15,
    expenseRecoveries: {},
    taxRecoveries: {}
};

function ViewRecoveryStructures(props: ViewRecoveryStructuresProps)
{
    const onRecoveryChanged = (recovery: RecoveryStructure | undefined, recoveryIndex: number) => {
        props.appraisal.recoveryStructures = replaceRecoveryStructure(props.appraisal.recoveryStructures, recoveryIndex, recovery) as RecoveryStructure[];
        props.saveAppraisal(props.appraisal);
    };
    const onNewRecovery = () => {
        const recovery = createNumberedRecoveryStructure(defaultRecoveryStructureData, props.appraisal.recoveryStructures.length);
        props.appraisal.recoveryStructures = [...props.appraisal.recoveryStructures, recovery as RecoveryStructure];
        props.saveAppraisal(props.appraisal);
    };
    const onDeleteRecovery = (recoveryIndex: number) => {
        if (!confirmBrowserAction('Are you sure you want to delete the recovery structure?')) return;
        const changes = removeRecoveryStructure(props.appraisal.recoveryStructures, props.appraisal.units, recoveryIndex);
        props.appraisal.recoveryStructures = changes.structures as RecoveryStructure[];
        props.appraisal.units.forEach((unit, unitIndex) => {
            const nextUnit = changes.units[unitIndex];
            if (nextUnit !== unit) unit.tenancies = nextUnit.tenancies as RecoveryUnit['tenancies'];
        });
        props.saveAppraisal(props.appraisal);
    };
        return (
            (props.appraisal) ?
                <div id={"view-recovery-structures"} className={"view-recovery-structures"}>
                    <h2>Recovery Structures</h2>

                    <Row>
                        <Col>
                            <div className={"recovery-structures-list"}>
                            {
                                props.appraisal.recoveryStructures.map((recovery, recoveryIndex) =>
                                {
                                    return <RecoveryStructureEditor
                                        expenses={props.appraisal.expenseStatement.items}
                                        units={props.appraisal.units}
                                        recovery={recovery}
                                        appraisal={props.appraisal}
                                        onChange={(newValue: RecoveryStructure | undefined) => onRecoveryChanged(newValue, recoveryIndex)}
                                        onDeleteRecovery={() => onDeleteRecovery(recoveryIndex)}
                                    />
                                })
                            }
                                {
                                    props.appraisal.recoveryStructures.length > 1 ?
                                        <Card className={"recovery-structure-editor"}>
                                            <CardBody>
                                                <table className="recovery-structure-table">
                                                    <tbody>
                                                    <tr className={""}>
                                                        <td className={"label-column"}>
                                                        </td>
                                                        <td className={"rule-percentage-column"}>
                                                        </td>
                                                        <td className={"rule-field-column"}>
                                                            <strong>Total Recoveries</strong>
                                                        </td>
                                                        <td className={"rule-calculated-amount-column"}>
                                                            <CurrencyFormat value={props.appraisal.stabilizedStatement.operatingExpenseRecovery! + props.appraisal.stabilizedStatement.managementRecovery! + props.appraisal.stabilizedStatement.taxRecovery!}/>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </CardBody>
                                        </Card> : null
                                }
                            {
                                <div className={"new-recovery-structure"}>
                                        <Button onClick={onNewRecovery}>
                                        <span>Create a new recovery structure</span>
                                        </Button>
                                </div>
                            }
                            </div>
                        </Col>
                    </Row>
                </div>
                : null
        );
}

export {ExpensePercentageEditor, TenantApplicableEditor, RecoveryStructureEditor};
export default ViewRecoveryStructures;
