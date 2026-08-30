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


class TotalLeasingCostsCalculationPopoverWrapper extends React.Component
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

        this.popoverId = `total-leasing-costs-calculation-popover-${TotalLeasingCostsCalculationPopoverWrapper.instance}`;
        TotalLeasingCostsCalculationPopoverWrapper.instance += 1;
    }

    render()
    {
        if (!this.props.appraisal)
        {
            return null;
        }

        const unitsForPopover = _.filter(this.props.appraisal.units, (unit) => unit.calculatedVacantUnitLeasupCosts !== 0);


        return (
            [
                <a id={this.popoverId} onClick={() => this.setState({popoverOpen: !this.state.popoverOpen})} key={0}>
                    {this.props.children}
                </a>,
                <Popover placement="bottom" isOpen={this.state.popoverOpen} target={this.popoverId} toggle={() => this.setState({popoverOpen: !this.state.popoverOpen})} key={1}>
                    <PopoverHeader>Total Leasing Costs</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            {
                                unitsForPopover.map((unit, unitIndex) =>
                                {
                                    const leasingCostStructure = this.props.appraisal.leasingCostsForUnit(unit);

                                    let className = "";

                                    if (unitIndex === unitsForPopover.length - 1)
                                    {
                                        className = "underline";
                                    }

                                    const elems = [];

                                    elems.push(
                                        <tr key={unitIndex.toString() + "1"}>
                                            <td>Tenant Inducements</td>
                                            <td>Unit {unit.unitNumber}</td>
                                            <td />
                                            <td />
                                            <td>
                                            </td>
                                            <td />
                                            <td><AreaFormat value={unit.squareFootage}/></td>
                                            <td>*</td>
                                            <td><CurrencyFormat value={leasingCostStructure.tenantInducementsPSF}/></td>
                                            <td>=</td>
                                            <td><CurrencyFormat value={unit.squareFootage * leasingCostStructure.tenantInducementsPSF} cents={false}/></td>
                                        </tr>
                                    );

                                    if (leasingCostStructure.leasingCommissionMode === 'psf')
                                    {
                                        elems.push(
                                            <tr key={unitIndex.toString() + "2"}>
                                                <td>Leasing Costs</td>
                                                <td>Unit {unit.unitNumber}</td>
                                                <td />
                                                <td />
                                                <td>
                                                </td>
                                                <td>
                                                </td>
                                                <td>
                                                    <AreaFormat value={unit.squareFootage}/>
                                                </td>
                                                <td>*</td>
                                                <td>
                                                    <CurrencyFormat value={leasingCostStructure.leasingCommissionPSF}/>
                                                </td>
                                                <td>=</td>
                                                <td className={"underline"}>
                                                    <CurrencyFormat value={leasingCostStructure.leasingCommissionPSF * unit.squareFootage} cents={false}/>
                                                </td>
                                            </tr>)
                                    }

                                    if (leasingCostStructure.leasingCommissionMode === 'percent_of_rent')
                                    {
                                            elems.push(
                                                <tr key={unitIndex.toString() + "3"}>
                                                <td>Leasing Costs - Year One</td>
                                                <td>Unit {unit.unitNumber}</td>
                                                <td />
                                                <td />
                                                <td>
                                                    {
                                                        unit.marketRent ?
                                                            <CurrencyFormat value={unit.marketRentAmount} cents={true}/>
                                                            : <span className={"none-found"}>no market rent</span>
                                                    }
                                                </td>
                                                <td>
                                                    <span>*</span>
                                                </td>
                                                <td>
                                                    <AreaFormat value={unit.squareFootage}/>
                                                </td>
                                                <td>*</td>
                                                <td>
                                                    <PercentFormat value={leasingCostStructure.leasingCommissionPercentYearOne}/>
                                                </td>
                                                <td>=</td>
                                                <td>
                                                    <CurrencyFormat
                                                        value={leasingCostStructure.leasingCommissionPercentYearOne / 100.0 * (unit.marketRentAmount * unit.squareFootage)}
                                                        cents={false}/>
                                                </td>
                                            </tr>)
                                    }

                                    if(leasingCostStructure.leasingCommissionMode === 'percent_of_rent' && (leasingCostStructure.leasingPeriod > 12))
                                    {
                                        elems.push(
                                            <tr key={unitIndex.toString() + "4"}>
                                                <td>Leasing Costs - Remaining Term</td>
                                                <td>Unit {unit.unitNumber}</td>
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
                                                        unit.marketRent ?
                                                            <CurrencyFormat value={unit.marketRentAmount} cents={true}/>
                                                            : <span className={"none-found"}>no market rent</span>
                                                    }
                                                </td>
                                                <td>
                                                    <span>*</span>
                                                </td>
                                                <td>
                                                    <AreaFormat value={unit.squareFootage}/>
                                                </td>
                                                <td>*</td>
                                                <td>
                                                    <PercentFormat value={leasingCostStructure.leasingCommissionPercentRemainingYears}/>
                                                </td>
                                                <td>=</td>
                                                <td className={"underline"}>
                                                    <CurrencyFormat
                                                        value={leasingCostStructure.leasingCommissionPercentRemainingYears / 100.0 * (unit.marketRentAmount * unit.squareFootage)}
                                                        cents={false}/>
                                                </td>
                                            </tr>);
                                    }

                                    return elems;
                                })
                            }
                            <tr className={"total-row"}>
                                <td>Total Leasing Costs</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td><CurrencyFormat value={this.props.appraisal.stabilizedStatement.vacantUnitLeasupCosts} /></td>
                            </tr>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
    }
}

export default TotalLeasingCostsCalculationPopoverWrapper;
