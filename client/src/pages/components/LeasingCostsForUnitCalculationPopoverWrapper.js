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


class LeasingCostsForUnitCalculationPopoverWrapper extends React.Component
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

        this.popoverId = `leasing-costs-for-unit-calculation-popover-${LeasingCostsForUnitCalculationPopoverWrapper.instance}`;
        LeasingCostsForUnitCalculationPopoverWrapper.instance += 1;
    }


    render()
    {
        if (!this.props.appraisal)
        {
            return null;
        }

        const leasingCostStructure = this.props.appraisal.leasingCostsForUnit(this.props.unit);

        return (
            [
                <a id={this.popoverId} onClick={() => this.setState({leasupCostPopoverOpen: !this.state.leasupCostPopoverOpen})}>
                    {this.props.children}
                </a>,
                <Popover placement="bottom" isOpen={this.state.leasupCostPopoverOpen} target={this.popoverId}
                         toggle={() => this.setState({leasupCostPopoverOpen: !this.state.leasupCostPopoverOpen})}>
                    <PopoverHeader>Unit {this.props.unit.unitNumber} - Leasing Costs</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            <tr>
                                <td>Tenant Inducements</td>
                                <td/>
                                <td/>
                                <td>
                                </td>
                                <td/>
                                <td><AreaFormat value={this.props.unit.squareFootage}/></td>
                                <td>*</td>
                                <td><CurrencyFormat value={leasingCostStructure.tenantInducementsPSF}/></td>
                                <td>=</td>
                                <td><CurrencyFormat value={this.props.unit.squareFootage * leasingCostStructure.tenantInducementsPSF} cents={false}/>
                                </td>
                            </tr>
                            {
                                leasingCostStructure.leasingCommissionMode === 'psf' ?
                                    <tr>
                                        <td>Leasing Costs</td>
                                        <td/>
                                        <td/>
                                        <td>
                                        </td>
                                        <td>
                                        </td>
                                        <td>
                                            <AreaFormat value={this.props.unit.squareFootage}/>
                                        </td>
                                        <td>*</td>
                                        <td>
                                            <CurrencyFormat value={leasingCostStructure.leasingCommissionPSF}/>
                                        </td>
                                        <td>=</td>
                                        <td className={"underline"}>
                                            <CurrencyFormat value={leasingCostStructure.leasingCommissionPSF * this.props.unit.squareFootage}
                                                            cents={false}/>
                                        </td>
                                    </tr> : null
                            }
                            {
                                leasingCostStructure.leasingCommissionMode === 'percent_of_rent' ?
                                    <tr>
                                        <td>Leasing Costs - Year One</td>
                                        <td/>
                                        <td/>
                                        <td>
                                            {
                                                this.props.unit.marketRent ?
                                                    <CurrencyFormat value={this.props.unit.marketRentAmount} cents={true}/>
                                                    : <span className={"none-found"}>no market rent</span>
                                            }
                                        </td>
                                        <td>
                                            <span>*</span>
                                        </td>
                                        <td>
                                            <AreaFormat value={this.props.unit.squareFootage}/>
                                        </td>
                                        <td>*</td>
                                        <td>
                                            <PercentFormat value={leasingCostStructure.leasingCommissionPercentYearOne}/>
                                        </td>
                                        <td>=</td>
                                        <td>
                                            <CurrencyFormat
                                                value={leasingCostStructure.leasingCommissionPercentYearOne / 100.0 * (this.props.unit.marketRentAmount * this.props.unit.squareFootage)}
                                                cents={false}/>
                                        </td>
                                    </tr> : null
                            }
                            {
                                leasingCostStructure.leasingCommissionMode === 'percent_of_rent' && (leasingCostStructure.leasingPeriod > 12) ?
                                    <tr>
                                        <td>Leasing Costs - Remaining Term</td>
                                        <td>
                                            {
                                                <IntegerFormat value={Math.max(0, leasingCostStructure.leasingPeriod - 12) / 12.0}/>
                                            }
                                        </td>
                                        <td>
                                            *
                                        </td>
                                        <td>
                                            {
                                                this.props.unit.marketRent ?
                                                    <CurrencyFormat value={this.props.unit.marketRentAmount} cents={true}/>
                                                    : <span className={"none-found"}>no market rent</span>
                                            }
                                        </td>
                                        <td>
                                            <span>*</span>
                                        </td>
                                        <td>
                                            <AreaFormat value={this.props.unit.squareFootage}/>
                                        </td>
                                        <td>*</td>
                                        <td>
                                            <PercentFormat value={leasingCostStructure.leasingCommissionPercentRemainingYears}/>
                                        </td>
                                        <td>=</td>
                                        <td className={"underline"}>
                                            <CurrencyFormat
                                                value={leasingCostStructure.leasingCommissionPercentRemainingYears / 100.0 * (this.props.unit.marketRentAmount * this.props.unit.squareFootage)}
                                                cents={false}/>
                                        </td>
                                    </tr> : null
                            }
                            <tr className={"total-row"}>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td colSpan={2}>Total Leasing Costs</td>
                                <td><CurrencyFormat value={this.props.unit.calculatedVacantUnitLeasupCosts} cents={false}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
    }
}

export default LeasingCostsForUnitCalculationPopoverWrapper;
