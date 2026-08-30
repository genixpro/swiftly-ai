import React from 'react';
import _ from "underscore";
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import PercentFormat from "./PercentFormat";
import CurrencyFormat from "./CurrencyFormat";
import IntegerFormat from "./IntegerFormat";
import AreaFormat from "./AreaFormat";
import PropTypes from "prop-types";
import AppraisalModel from "../../models/AppraisalModel";
import UnitModel from "../../models/UnitModel";
import RecoveryStructureModel from "../../models/RecoveryStructureModel";
import LeasingCostStructureModel from "../../models/LeasingCostStructureModel";
import {NonDroppableFieldDisplayEdit} from "./FieldDisplayEdit";
import Moment from "react-moment";
import moment from "moment/moment";


class ExpenseRecoveryForUnitCalculationPopoverWrapper extends React.Component
{
    static instance = 0;

    state = {
        popoverOpen: false
    };

    static propTypes = {
        appraisal: PropTypes.instanceOf(AppraisalModel).isRequired,
        unit: PropTypes.instanceOf(UnitModel).isRequired,
        incomeStatementItemType: PropTypes.string.isRequired
    };

    constructor()
    {
        super();
    }

    componentWillMount()
    {
        this.popoverId = `expense-recovery-for-unit-${this.props.incomeStatementItemType}-calculation-popover-${ExpenseRecoveryForUnitCalculationPopoverWrapper.instance}`;
        ExpenseRecoveryForUnitCalculationPopoverWrapper.instance += 1;
    }


    render()
    {
        if (!this.props.appraisal)
        {
            return null;
        }

        const expenses = this.props.appraisal.expenseStatement.items.filter((expense) => expense.incomeStatementItemType === this.props.incomeStatementItemType);
        const unit = this.props.unit;
        const recoveryStructure = this.props.appraisal.recoveryStructureForUnit(unit);

        let calculated;

        let recoveries;

        if (this.props.incomeStatementItemType === 'operating_expense')
        {
            calculated = unit.calculatedExpenseRecovery;
            recoveries = recoveryStructure.expenseRecoveries;
        }
        else if (this.props.incomeStatementItemType === 'management_expense')
        {
            calculated = unit.calculatedManagementRecovery;
            recoveries = recoveryStructure.managementRecoveries;
        }
        else if (this.props.incomeStatementItemType === 'tax_expense')
        {
            calculated = unit.calculatedTaxRecovery;
            recoveries = recoveryStructure.taxRecoveries;
        }

        return (
            [<a id={this.popoverId} onClick={() => this.setState({popoverOpen: !this.state.popoverOpen})}>
                {this.props.children}
            </a>,
                <Popover placement="bottom" isOpen={this.state.popoverOpen} target={this.popoverId}
                         toggle={() => this.setState({popoverOpen: !this.state.popoverOpen})}>
                    <PopoverHeader>Expense Recoveries</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            {
                                expenses.map((expense, expenseIndex) =>
                                {
                                    let className = "";

                                    if (expenseIndex === this.props.appraisal.units.length - 1)
                                    {
                                        className = "underline";
                                    }

                                    const value = recoveries[expense.machineName];
                                    const percentage = _.isNumber(value) ? value : 100;

                                    return <tr key={expenseIndex}>
                                        <td>{expense.name}</td>
                                        <td>
                                            <AreaFormat value={unit.squareFootage}/>
                                        </td>
                                        <td>
                                            /
                                        </td>
                                        <td>
                                            <AreaFormat value={this.props.appraisal.sizeOfBuilding}/>
                                        </td>
                                        <td>
                                            =
                                        </td>
                                        <td>
                                            <PercentFormat value={unit.squareFootage / this.props.appraisal.sizeOfBuilding * 100}/>
                                        </td>
                                        <td>
                                            *
                                        </td>
                                        <td>
                                            <PercentFormat value={percentage}/>
                                        </td>
                                        <td>
                                            *
                                        </td>
                                        <td>
                                            <CurrencyFormat value={expense.latestAmount}/>
                                        </td>
                                        <td className={className}>
                                            <CurrencyFormat
                                                value={expense.latestAmount * (percentage / 100.0) * unit.squareFootage / this.props.appraisal.sizeOfBuilding}/>
                                        </td>
                                    </tr>
                                })
                            }
                            <tr className={"total-row"}>
                                <td>Recovered Amount</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td><CurrencyFormat value={calculated}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
    }
}

export default ExpenseRecoveryForUnitCalculationPopoverWrapper;
