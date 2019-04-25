import React from 'react';
import { Row, Col, Card, CardHeader, CardBody, Button } from 'reactstrap';
import axios from "axios/index";
import FieldDisplayEdit from './components/FieldDisplayEdit';
import 'react-datetime/css/react-datetime.css'
import NumberFormat from "react-number-format";
import RecoveryStructureModel from "../models/RecoveryStructureModel";
import _ from "underscore";
import CurrencyFormat from "./components/CurrencyFormat";

class ExpensePercentageEditor extends React.Component
{
    render()
    {
        return [<td className={"rule-percentage-column"} key={1}>
            <FieldDisplayEdit
                key={1}
                type="percent"
                placeholder={"Expense %"}
                value={_.isNumber(this.props.value) ? this.props.value : 100}
                hideInput={false}
                hideIcon={true}
                onChange={(newValue) => this.props.onChange(newValue)}
            />
        </td>,
            <td className={"rule-field-column"} key={2}>
                <span key={2} className={"seperator"}>of</span>
                <div className={"expense-name"}>{this.props.expense.name}</div>
            </td>,
            <td className={"rule-calculated-amount-column"} key={3}>
                <CurrencyFormat value={this.props.calculated}/>
            </td>
        ]
    }
}

class TenantApplicableEditor extends React.Component
{
    render()
    {
        return [<td className={"rule-percentage-column"} key={1}>
            {this.props.unit.currentTenancy.name || `Unit ${this.props.unit.unitNumber}`}
        </td>,
            <td className={"rule-field-column"} key={2}>
                <FieldDisplayEdit
                    type={"boolean"}
                    hideIcon={true}
                    edit={!this.props.recovery.isDefault}
                    value={this.props.unit.currentTenancy.recoveryStructure === this.props.recovery.name}
                    onChange={() => this.props.onChange()}
                    placeholder={"Does recovery structure apply to this tenancy"}
                />
            </td>,
            <td className={"rule-calculated-amount-column"} key={3}>
                {
                    this.props.unit.currentTenancy.recoveryStructure === this.props.recovery.name ?
                        <CurrencyFormat value={this.props.unit.calculatedTotalRecovery}/>
                        : null
                }
            </td>
    ]
    }
}



class RecoveryStructureEditor extends React.Component
{
    changeRecoveryStructureField(field, newValue)
    {
        const recoveryStructure = this.props.recovery;

        if (newValue !== recoveryStructure[field])
        {
            if (field === "name")
            {
                // Go through the appraisal units and update any which are attached to this rent name
                this.props.appraisal.units.forEach((unit) =>
                {
                    if (unit.currentTenancy.recoveryStructure === recoveryStructure.name)
                    {
                        unit.currentTenancy.recoveryStructure = newValue;
                    }
                });
            }

            recoveryStructure[field] = newValue;
            this.props.onChange(recoveryStructure);
        }
    }

    changeCalculationRuleField(calculationRule, field, newValue)
    {
        if (newValue !== calculationRule[field])
        {
            calculationRule[field] = newValue;
            this.props.onChange(this.props.recovery);
        }
    }

    changeOperatingExpenseRecovery(expenseName, newValue)
    {
        if (newValue !== this.props.recovery.expenseRecoveries[expenseName])
        {
            this.props.recovery.expenseRecoveries[expenseName] = newValue;
            this.props.onChange(this.props.recovery);
        }
    }

    changeTaxRecovery(expenseName, newValue)
    {
        if (newValue !== this.props.recovery.taxRecoveries[expenseName])
        {
            this.props.recovery.taxRecoveries[expenseName] = newValue;
            this.props.onChange(this.props.recovery);
        }
    }

    changeUnitRecoveryStructure(unit)
    {
        if (unit.currentTenancy.recoveryStructure === this.props.recovery.name)
        {
            unit.currentTenancy.recoveryStructure = RecoveryStructureModel.defaultRecoveryName;
        }
        else
        {
            unit.currentTenancy.recoveryStructure = this.props.recovery.name;
        }
        this.props.onChange(this.props.recovery);
    }

    operatingExpenses()
    {
        return this.props.expenses.filter((expense) => expense.incomeStatementItemType === "operating_expense")
    }



    taxes()
    {
        return this.props.expenses.filter((expense) =>  expense.incomeStatementItemType === "taxes")
    }

    render()
    {
        const recovery = this.props.recovery;

        return <Card className={"recovery-structure-editor"}>
            <CardBody>
                <table className="recovery-structure-table">
                    <tbody>
                    <tr className={"header-row"}>
                        <td colSpan={3} className={"label-column"}>
                            {
                                !recovery.isDefault ?
                                    <FieldDisplayEdit
                                        type="text"
                                        placeholder="Recovery Structure Name"
                                        value={recovery.name}
                                        onChange={(newValue) => this.changeRecoveryStructureField('name', newValue)}
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
                        <td className={"rule-percentage-column"}>
                            <FieldDisplayEdit
                                key={1}
                                type="percent"
                                              placeholder={"Management Expense %"}
                                              value={recovery.managementCalculationRule.percentage}
                                              hideInput={false}
                                              hideIcon={true}
                                              onChange={(newValue) => this.changeCalculationRuleField(recovery.managementCalculationRule, 'percentage', newValue)}
                            />
                        </td>
                        <td className={"rule-field-column"}>
                            <span key={2} className={"seperator"}>of</span>
                            <FieldDisplayEdit
                                type="calculationField"
                                expenses={this.props.expenses}
                                placeholder={"Expense Calculation Field"}
                                value={recovery.managementCalculationRule.field}
                                hideInput={false}
                                hideIcon={true}
                                onChange={(newValue) => this.changeCalculationRuleField(recovery.managementCalculationRule, 'field', newValue)}
                            />
                        </td>
                        <td className={"rule-calculated-amount-column"}>
                            <CurrencyFormat value={recovery.calculatedManagementRecovery}/>
                        </td>
                    </tr>
                    <tr className={"recovery-rule label-row"}>
                        <td className={"label-column"}>
                            <strong>Operating Expense Recoveries</strong>
                        </td>
                        {
                            this.operatingExpenses().length === 0 ?
                                [
                                    <td className={"rule-percentage-column"} key={1} colSpan={2}>
                                        No expenses found. Please go to "Expenses" or upload an Income Statement.
                                    </td>,
                                ] : null
                        }
                        {
                            this.operatingExpenses().length > 0 ?
                                <ExpensePercentageEditor
                                    expense={this.operatingExpenses()[0]}
                                    recovery={recovery}
                                    onChange={(newValue) => this.changeOperatingExpenseRecovery(this.operatingExpenses()[0].name, newValue)}
                                    calculated={recovery.calculatedExpenseRecoveries[this.operatingExpenses()[0].name]}
                                    value={recovery.expenseRecoveries[this.operatingExpenses()[0].name]}
                                />
                                : null
                        }
                    </tr>
                    {
                        this.operatingExpenses().map((expense, expenseIndex) =>
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
                                    onChange={(newValue) => this.changeOperatingExpenseRecovery(expense.name, newValue)}
                                    calculated={recovery.calculatedExpenseRecoveries[expense.name]}
                                    value={recovery.expenseRecoveries[expense.name]}
                                />
                            </tr>
                        })
                    }
                    <tr className={"recovery-rule label-row"}>
                        <td className={"label-column"}>
                            <strong>Tax Recoveries</strong>
                        </td>
                        {
                            this.taxes().length === 0 ?
                                [
                                    <td className={"rule-percentage-column"} key={1} colSpan={2}>
                                        No taxes found. Please go to "Expenses" or upload an Income or Tax statement.
                                    </td>,
                                ] : null
                        }
                        {
                            this.taxes().length > 0 ?
                                <ExpensePercentageEditor
                                    expense={this.taxes()[0]}
                                    recovery={recovery}
                                    onChange={(newValue) => this.changeTaxRecovery(this.taxes()[0].name, newValue)}
                                    calculated={recovery.calculatedTaxRecoveries[this.taxes()[0].name]}
                                    value={recovery.taxRecoveries[this.taxes()[0].name]}
                                />
                                : null
                        }
                    </tr>
                    {
                        this.taxes().map((expense, expenseIndex) =>
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
                                    onChange={(newValue) => this.changeTaxRecovery(expense.name, newValue)}
                                    calculated={recovery.calculatedTaxRecoveries[expense.name]}
                                    value={recovery.taxRecoveries[expense.name]}
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
                            <strong>Total Recovered Under This Structure</strong>
                        </td>
                        <td className={"rule-calculated-amount-column"}>
                            <CurrencyFormat value={recovery.calculatedTotalRecovery}/>
                        </td>
                    </tr>
                    <tr className={"recovery-rule label-row"}>
                        <td className={"label-column"}>
                            <strong>Tenants Applied To</strong>
                        </td>
                        {
                            this.props.units.length > 0 ?
                                <TenantApplicableEditor unit={this.props.units[0]} recovery={recovery} onChange={() => this.changeUnitRecoveryStructure(this.props.units[0])}/>
                                : null
                        }
                    </tr>
                    {
                        this.props.units.map((unit, unitIndex) =>
                        {
                            if (unitIndex === 0)
                            {
                                return null;
                            }

                            return <tr className={"recovery-rule"} key={unitIndex}>
                                <td className={"label-column"} />
                                <TenantApplicableEditor unit={unit} recovery={recovery} onChange={() => this.changeUnitRecoveryStructure(unit)}/>
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
                            <strong>Total Recovered Under This Structure</strong>
                        </td>
                        <td className={"rule-calculated-amount-column"}>
                            <CurrencyFormat value={recovery.calculatedTotalRecovery}/>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <table className="units-applicable-table">
                    <tbody>
                    </tbody>
                </table>
                {
                    !recovery.isDefault ?
                        <Button color={"danger"} className={"delete-button"} onClick={() => this.props.onDeleteRecovery(this.props.recovery)}>Delete</Button>
                        : null
                }

            </CardBody>
        </Card>
    }
}

class ViewRecoveryStructures extends React.Component
{
    state = {
        capitalizationRate: 8.4,
        selectedUnit: null,
        comparableLeases: []
    };

    defaultRecoveryStructureData = {
        name: "New Recovery Structure",
        managementCalculationRule: {
            percentage: 100,
            field: "managementExpenses"
        },
        expenseRecoveries: {},
        taxRecoveries: {}
    };

    componentDidMount()
    {

    }

    onRecoveryChanged(recovery, recoveryIndex)
    {
        this.props.appraisal.recoveryStructures[recoveryIndex] = recovery;
        this.props.saveAppraisal(this.props.appraisal, true);
    }

    onNewRecovery(newRecovery)
    {
        newRecovery.name = newRecovery.name + " " + this.props.appraisal.recoveryStructures.length.toString();
        this.props.appraisal.recoveryStructures.push(newRecovery);
        this.props.saveAppraisal(this.props.appraisal, true);
    }

    onDeleteRecovery(recoveryIndex)
    {
        const recoveryStructure = this.props.appraisal.recoveryStructures[recoveryIndex];
        this.props.appraisal.recoveryStructures.splice(recoveryIndex, 1);

        // Go through the appraisal units and update any which are attached to this rent name
        this.props.appraisal.units.forEach((unit) =>
        {
            if (unit.currentTenancy.recoveryStructure === recoveryStructure.name)
            {
                unit.currentTenancy.recoveryStructure = RecoveryStructureModel.defaultRecoveryName;
            }
        });

        this.props.saveAppraisal(this.props.appraisal, true);
    }

    render() {
        return (
            (this.props.appraisal) ?
                <div id={"view-recovery-structures"} className={"view-recovery-structures"}>
                    <h2>Recovery Structures</h2>

                    <Row>
                        <Col>
                            <div className={"recovery-structures-list"}>
                            {
                                this.props.appraisal.recoveryStructures.map((recovery, recoveryIndex) =>
                                {
                                    return <RecoveryStructureEditor
                                        expenses={this.props.appraisal.incomeStatement.expenses}
                                        units={this.props.appraisal.units}
                                        recovery={recovery}
                                        appraisal={this.props.appraisal}
                                        onChange={(newValue) => this.onRecoveryChanged(newValue, recoveryIndex)}
                                        onDeleteRecovery={() => this.onDeleteRecovery(recoveryIndex)}
                                    />
                                })
                            }
                                {
                                    this.props.appraisal.leasingCosts.length > 1 ?
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
                                                            <CurrencyFormat value={this.props.appraisal.stabilizedStatement.operatingExpenseRecovery + this.props.appraisal.stabilizedStatement.managementRecovery + this.props.appraisal.stabilizedStatement.taxRecovery}/>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </CardBody>
                                        </Card> : null
                                }
                            {
                                <div className={"new-recovery-structure"}>
                                        <Button onClick={() => this.onNewRecovery(new RecoveryStructureModel(this.defaultRecoveryStructureData))}>
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
}

export default ViewRecoveryStructures;
