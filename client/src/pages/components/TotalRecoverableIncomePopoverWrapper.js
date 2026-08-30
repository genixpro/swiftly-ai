import React from 'react';
import _ from "underscore";
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import PercentFormat from "./PercentFormat";
import CurrencyFormat from "./CurrencyFormat";
import IntegerFormat from "./IntegerFormat";
import AreaFormat from "./AreaFormat";
import PropTypes from "prop-types";
import AppraisalModel from "../../models/AppraisalModel";
import RecoveryStructureModel from "../../models/RecoveryStructureModel";


class TotalRecoverableIncomePopoverWrapper extends React.Component
{
    static instance = 0;

    state = {
        popoverOpen: false
    };

    static propTypes = {
        appraisal: PropTypes.instanceOf(AppraisalModel).isRequired,
        recovery: PropTypes.instanceOf(RecoveryStructureModel).isRequired,
    };

    constructor()
    {
        super();

        this.popoverId = `total-recoverable-income-calculation-popover-${TotalRecoverableIncomePopoverWrapper.instance}`;
        TotalRecoverableIncomePopoverWrapper.instance += 1;
    }

    render()
    {
        const recovery = this.props.recovery;

        return (
            [
                <a id={this.popoverId} onClick={() => this.setState({popoverOpen: !this.state.popoverOpen})} key={0}>
                    {this.props.children}
                </a>,
                <Popover placement="bottom" isOpen={this.state.popoverOpen} target={this.popoverId} toggle={() => this.setState({popoverOpen: !this.state.popoverOpen})} key={1}>
                    <PopoverHeader>Total Recoverable Income</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            {
                                this.props.appraisal.units.map((unit, unitIndex) =>
                                {
                                    if (unit.currentTenancy.recoveryStructure !== recovery.name)
                                    {
                                        return null;
                                    }

                                    if (unit.currentTenancy.rentType !== "net")
                                    {
                                        return null;
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
                                            <PercentFormat value={
                                                (unit.calculatedManagementRecovery + unit.calculatedExpenseRecovery + unit.calculatedTaxRecovery) * 100
                                                    / (unit.squareFootage / this.props.appraisal.sizeOfBuilding)
                                                / (recovery.calculatedManagementRecoveryBaseValue + this.props.appraisal.stabilizedStatement.operatingExpenses + this.props.appraisal.stabilizedStatement.taxes)
                                            } />
                                        </td>
                                        <td>
                                            *
                                        </td>
                                        <td>
                                            <CurrencyFormat value={recovery.calculatedManagementRecoveryBaseValue + this.props.appraisal.stabilizedStatement.operatingExpenses + this.props.appraisal.stabilizedStatement.taxes} />
                                        </td>
                                        <td>
                                            =
                                        </td>
                                        <td className={className}>
                                            <CurrencyFormat value={unit.calculatedManagementRecovery + unit.calculatedExpenseRecovery + unit.calculatedTaxRecovery} />
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
                                <td></td>
                                <td><CurrencyFormat value={recovery.calculatedManagementRecoveryTotal +
                                    _.reduce(Object.values(recovery.calculatedExpenseRecoveries), (val, memo) => val + memo, 0) +
                                    _.reduce(Object.values(recovery.calculatedTaxRecoveries), (val, memo) => val + memo, 0)
                                } /></td>
                            </tr>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
    }
}

export default TotalRecoverableIncomePopoverWrapper;
