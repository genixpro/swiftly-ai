import React from 'react';
import { Row, Col, Card, CardHeader, CardBody, Button, Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import axios from "axios/index";
import FieldDisplayEdit from './components/FieldDisplayEdit';
import 'react-datetime/css/react-datetime.css'
import NumberFormat from "react-number-format";
import RecoveryStructureModel from "../models/RecoveryStructureModel";
import _ from "underscore";
import CurrencyFormat from "./components/CurrencyFormat";
import PercentFormat from "./components/PercentFormat";
import AreaFormat from "./components/AreaFormat";

class ExpensePercentageEditor extends React.Component
{
    state = {};

    render()
    {
        const popoverId = `expense-recovery-popover-${this.props.expense.name.replace(/\W/g, "")}-${this.props.recovery.name.replace(/\W/g, "")}`;

        const percentage = _.isNumber(this.props.value) ? this.props.value : 100;

        return [<td className={"rule-percentage-column"} key={1}>
            <FieldDisplayEdit
                key={1}
                type="percent"
                placeholder={"Expense %"}
                value={percentage}
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
                <a id={popoverId} onClick={() => this.setState({popoverOpen: !this.state.popoverOpen})}>
                    <CurrencyFormat value={this.props.calculated}/>
                </a>
                <Popover placement="bottom" isOpen={this.state.popoverOpen} target={popoverId} toggle={() => this.setState({popoverOpen: !this.state.popoverOpen})}>
                    <PopoverHeader>Expense Recovery - {this.props.expense.name}</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            {
                                this.props.appraisal.units.map((unit, unitIndex) =>
                                {
                                    if (unit.currentTenancy.recoveryStructure !== this.props.recovery.name)
                                    {
                                        return;
                                    }

                                    let className = "";

                                    if (unitIndex === this.props.appraisal.units.length - 1)
                                    {
                                        className = "underline";
                                    }

                                    return <tr key={unitIndex}>
                                        <td>{unit.currentTenancy.name}</td>
                                        <td>
                                            <AreaFormat value={unit.squareFootage} />
                                        </td>
                                        <td>
                                            /
                                        </td>
                                        <td>
                                            <AreaFormat value={this.props.appraisal.sizeOfBuilding} />
                                        </td>
                                        <td>
                                            =
                                        </td>
                                        <td>
                                            <PercentFormat value={unit.squareFootage / this.props.appraisal.sizeOfBuilding * 100} />
                                        </td>
                                        <td>
                                            *
                                        </td>
                                        <td>
                                            <PercentFormat value={percentage} />
                                        </td>
                                        <td>
                                            *
                                        </td>
                                        <td>
                                            <CurrencyFormat value={this.props.expense.latestAmount} />
                                        </td>
                                        <td className={className}>
                                            <CurrencyFormat value={this.props.expense.latestAmount * (percentage / 100.0) * unit.squareFootage / this.props.appraisal.sizeOfBuilding} />
                                        </td>
                                    </tr>
                                })
                            }
                            <tr className={"total-row"}>
                                <td>Recovered Amount Under Structure</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td><CurrencyFormat value={this.props.calculated} /></td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            </td>
        ]
    }
}

class TenantApplicableEditor extends React.Component
{
    state = {};

    render()
    {
        const popoverId = `tenancy-recovery-popover-${this.props.unit.currentTenancy.name.replace(/\W/g, "")}-${this.props.recovery.name.replace(/\W/g, "")}`;

        return [<td className={"rule-percentage-column"} key={1}>
            Unit {this.props.unit.unitNumber} - {this.props.unit.currentTenancy.name}
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
                <a id={popoverId} onClick={() => this.setState({popoverOpen: !this.state.popoverOpen})}>

                    {
                        this.props.unit.currentTenancy.recoveryStructure === this.props.recovery.name ?
                            <CurrencyFormat value={this.props.unit.calculatedTotalRecovery}/>
                            : null
                    }
                </a>
                <Popover placement="bottom" isOpen={this.state.popoverOpen} target={popoverId} toggle={() => this.setState({popoverOpen: !this.state.popoverOpen})}>
                    <PopoverHeader>Unit {this.props.unit.unitNumber} - Tenant Recovery - {this.props.unit.currentTenancy.name}</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tr>
                                <td>Operating Expense Recovery</td>
                                <td><CurrencyFormat value={this.props.unit.calculatedExpenseRecovery} /></td>
                            </tr>
                            <tr>
                                <td>Management Recovery</td>
                                <td><CurrencyFormat value={this.props.unit.calculatedManagementRecovery} /></td>
                            </tr>
                            <tr>
                                <td>Tax Recovery</td>
                                <td className={"underline"}><CurrencyFormat value={this.props.unit.calculatedTaxRecovery} /></td>
                            </tr>

                            <tr className={"total-row"}>
                                <td>Recovered Amount Under Structure</td>
                                <td><CurrencyFormat value={this.props.unit.calculatedTotalRecovery} /></td>
                            </tr>
                        </table>
                    </PopoverBody>
                </Popover>


            </td>
    ]
    }
}



class RecoveryStructureEditor extends React.Component
{
    state = {};

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
        unit.resetCalculations();
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

        const managementRecoveryPopoverId = `management-recovery-popover-${this.props.recovery.name.replace(/\W/g, "")}`;

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
                            <a id={managementRecoveryPopoverId} onClick={() => this.setState({managementRecoveryPopoverOpen: !this.state.managementRecoveryPopoverOpen})}>
                                <CurrencyFormat value={recovery.calculatedManagementRecovery}/>
                            </a>
                            <Popover placement="bottom" isOpen={this.state.managementRecoveryPopoverOpen} target={managementRecoveryPopoverId} toggle={() => this.setState({managementRecoveryPopoverOpen: !this.state.managementRecoveryPopoverOpen})}>
                                <PopoverHeader>Management Recovery</PopoverHeader>
                                <PopoverBody>
                                    <table className={"explanation-popover-table"}>
                                        {
                                            this.props.appraisal.units.map((unit, unitIndex) =>
                                            {
                                                if (unit.currentTenancy.recoveryStructure !== recovery.name)
                                                {
                                                    return;
                                                }

                                                let className = "";

                                                if (unitIndex === this.props.appraisal.units.length - 1)
                                                {
                                                    className = "underline";
                                                }

                                                return <tr key={unitIndex}>
                                                    <td>{unit.currentTenancy.name}</td>
                                                    <td>
                                                        <AreaFormat value={unit.squareFootage} />
                                                    </td>
                                                    <td>
                                                        /
                                                    </td>
                                                    <td>
                                                        <AreaFormat value={this.props.appraisal.sizeOfBuilding} />
                                                    </td>
                                                    <td>
                                                        =
                                                    </td>
                                                    <td>
                                                        <PercentFormat value={unit.squareFootage / this.props.appraisal.sizeOfBuilding * 100} />
                                                    </td>
                                                    <td>
                                                        *
                                                    </td>
                                                    <td>
                                                        <PercentFormat value={recovery.managementCalculationRule.percentage} />
                                                    </td>
                                                    <td>
                                                        *
                                                    </td>
                                                    <td>
                                                        <CurrencyFormat value={recovery.calculatedManagementRecoveryBaseFieldValue} />
                                                    </td>
                                                    <td>
                                                        =
                                                    </td>
                                                    <td className={className}>
                                                        <CurrencyFormat value={unit.calculatedManagementRecovery} />
                                                    </td>
                                                </tr>
                                            })
                                        }
                                        <tr className={"total-row"}>
                                            <td>Recovered Amount Under Structure</td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td><CurrencyFormat value={recovery.calculatedManagementRecovery} /></td>
                                        </tr>
                                    </table>
                                </PopoverBody>
                            </Popover>
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
                                    appraisal={this.props.appraisal}
                                    onChange={(newValue) => this.changeOperatingExpenseRecovery(this.operatingExpenses()[0].machineName, newValue)}
                                    calculated={recovery.calculatedExpenseRecoveries[this.operatingExpenses()[0].machineName]}
                                    value={recovery.expenseRecoveries[this.operatingExpenses()[0].machineName]}
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
                                    appraisal={this.props.appraisal}
                                    onChange={(newValue) => this.changeOperatingExpenseRecovery(expense.machineName, newValue)}
                                    calculated={recovery.calculatedExpenseRecoveries[expense.machineName]}
                                    value={recovery.expenseRecoveries[expense.machineName]}
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
                                    appraisal={this.props.appraisal}
                                    onChange={(newValue) => this.changeTaxRecovery(this.taxes()[0].machineName, newValue)}
                                    calculated={recovery.calculatedTaxRecoveries[this.taxes()[0].machineName]}
                                    value={recovery.taxRecoveries[this.taxes()[0].machineName]}
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
                                    appraisal={this.props.appraisal}
                                    onChange={(newValue) => this.changeTaxRecovery(expense.machineName, newValue)}
                                    calculated={recovery.calculatedTaxRecoveries[expense.machineName]}
                                    value={recovery.taxRecoveries[expense.machineName]}
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
        this.props.saveAppraisal(this.props.appraisal);
    }

    onNewRecovery(newRecovery)
    {
        newRecovery.name = newRecovery.name + " " + this.props.appraisal.recoveryStructures.length.toString();
        this.props.appraisal.recoveryStructures.push(newRecovery);
        this.props.saveAppraisal(this.props.appraisal);
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

        this.props.saveAppraisal(this.props.appraisal);
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
                                    this.props.appraisal.recoveryStructures.length > 1 ?
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
                                        <Button onClick={() => this.onNewRecovery(RecoveryStructureModel.create(this.defaultRecoveryStructureData, this.props.appraisal, "recoveryStructures"))}>
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
