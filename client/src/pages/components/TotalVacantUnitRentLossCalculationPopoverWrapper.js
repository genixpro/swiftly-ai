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
import LeasingCostStructureModel from "../../models/LeasingCostStructureModel";


class TotalVacantUnitRentLossCalculationPopoverWrapper extends React.Component
{
    static instance = 0;

    state = {
        popoverOpen: false
    };

    static propTypes = {
        appraisal: PropTypes.instanceOf(AppraisalModel).isRequired
    };

    constructor()
    {
        super();

        this.popoverId = `total-vacant-unit-rent-loss-calculation-popover-${TotalVacantUnitRentLossCalculationPopoverWrapper.instance}`;
        TotalVacantUnitRentLossCalculationPopoverWrapper.instance += 1;
    }

    leasingCostsForUnit(unit)
    {
        for(let leasingCost of this.props.appraisal.leasingCosts)
        {
            if (leasingCost.name === unit.leasingCostStructure)
            {
                return leasingCost;
            }
        }

        for(let leasingCost of this.props.appraisal.leasingCosts)
        {
            if (leasingCost.name === LeasingCostStructureModel.defaultLeasingCostName)
            {
                return leasingCost;
            }
        }
    }

    render()
    {
        const unitsForPopover = _.filter(this.props.appraisal.units, (unit) => unit.calculatedVacantUnitRentLoss !== 0);

        return (
            [
                <a id={this.popoverId} onClick={() => this.setState({popoverOpen: !this.state.popoverOpen})} key={0}>
                    {this.props.children}
                </a>,
                <Popover placement="bottom" isOpen={this.state.popoverOpen} target={this.popoverId} toggle={() => this.setState({popoverOpen: !this.state.popoverOpen})} key={1}>
                    <PopoverHeader>Total Leasing Costs</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tr className={"total-row"}>
                                <td>Unit</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td><strong>Annual Amount</strong></td>
                                <td></td>
                                <td></td>
                            </tr>
                            {
                                unitsForPopover.map((unit, unitIndex) =>
                                {
                                    return <tr className={`total-row ${unitIndex === unitsForPopover.length - 1 ? "underline" : ""}`}>
                                        <td>Unit {unit.unitNumber}</td>
                                        <td><IntegerFormat value={this.leasingCostsForUnit(unit).renewalPeriod}/></td>
                                        <td>/</td>
                                        <td>12</td>
                                        <td>*</td>
                                        <td><CurrencyFormat value={unit.marketRentAmount * unit.squareFootage + unit.calculatedTaxRecovery + unit.calculatedManagementRecovery + unit.calculatedExpenseRecovery}/></td>
                                        <td>=</td>
                                        <td><CurrencyFormat value={unit.calculatedVacantUnitRentLoss} cents={false}/></td>
                                    </tr>
                                })
                            }
                            <tr className={"total-row"}>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td colSpan={2}><strong>Gross Rent Loss</strong></td>
                                <td><CurrencyFormat value={this.props.appraisal.stabilizedStatement.vacantUnitRentLoss} cents={false} /></td>
                            </tr>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
    }
}

export default TotalVacantUnitRentLossCalculationPopoverWrapper;
