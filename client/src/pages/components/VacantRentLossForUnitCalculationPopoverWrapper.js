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


class VacantRentLossForUnitCalculationPopoverWrapper extends React.Component
{
    static instance = 0;

    state = {
        popoverOpen: false
    };

    static propTypes = {
        appraisal: PropTypes.instanceOf(AppraisalModel).isRequired,
        unit: PropTypes.instanceOf(UnitModel).isRequired
    };

    constructor()
    {
        super();

        this.popoverId = `free-rent-loss-for-unit-calculation-popover-${VacantRentLossForUnitCalculationPopoverWrapper.instance}`;
        VacantRentLossForUnitCalculationPopoverWrapper.instance += 1;
    }


    render()
    {
        if (!this.props.appraisal)
        {
            return null;
        }

        const leasingCostStructure = this.props.appraisal.leasingCostsForUnit(this.props.unit);

        return (
            [<a id={this.popoverId} onClick={() => this.setState({rentLossPopoverOpen: !this.state.rentLossPopoverOpen})}>
                {
                    this.props.children
                }
            </a>,
                <Popover placement="bottom" isOpen={this.state.rentLossPopoverOpen} target={this.popoverId}
                         toggle={() => this.setState({rentLossPopoverOpen: !this.state.rentLossPopoverOpen})}>
                    <PopoverHeader>Unit {this.props.unit.unitNumber} - Vacant Rent Loss</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            <tr className={"total-row"}>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td><strong>Annual Amount</strong></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={"total-row"}>
                                <td>Rent Loss</td>
                                <td><IntegerFormat value={leasingCostStructure.renewalPeriod}/></td>
                                <td>/</td>
                                <td>12</td>
                                <td>*</td>
                                <td><CurrencyFormat value={this.props.unit.marketRentAmount * this.props.unit.squareFootage}/></td>
                                <td>=</td>
                                <td><CurrencyFormat
                                    value={leasingCostStructure.renewalPeriod / 12.0 * this.props.unit.marketRentAmount * this.props.unit.squareFootage}
                                    cents={false}/></td>
                            </tr>
                            {
                                this.props.unit.currentTenancy.rentType === 'net' ?
                                    <tr className={"total-row"}>
                                        <td>Recovery Loss</td>
                                        <td><IntegerFormat value={leasingCostStructure.renewalPeriod}/></td>
                                        <td>/</td>
                                        <td>12</td>
                                        <td>*</td>
                                        <td><CurrencyFormat
                                            value={this.props.unit.calculatedTaxRecovery + this.props.unit.calculatedManagementRecovery + this.props.unit.calculatedExpenseRecovery}/>
                                        </td>
                                        <td>=</td>
                                        <td><CurrencyFormat
                                            value={(this.props.unit.calculatedTaxRecovery + this.props.unit.calculatedManagementRecovery + this.props.unit.calculatedExpenseRecovery) / 12.0 * leasingCostStructure.renewalPeriod}
                                            cents={false}/></td>
                                    </tr> : null
                            }
                            <tr className={"total-row"}>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td colSpan={2}><strong>Gross Rent Loss</strong></td>
                                <td><CurrencyFormat value={this.props.unit.calculatedVacantUnitRentLoss} cents={false}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
    }
}

export default VacantRentLossForUnitCalculationPopoverWrapper;
