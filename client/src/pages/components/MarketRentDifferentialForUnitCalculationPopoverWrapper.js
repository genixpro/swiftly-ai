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


class MarketRentDifferentialForUnitCalculationPopoverWrapper extends React.Component
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

        this.popoverId = `market-rent-differential-for-unit-calculation-popover-${MarketRentDifferentialForUnitCalculationPopoverWrapper.instance}`;
        MarketRentDifferentialForUnitCalculationPopoverWrapper.instance += 1;
    }


    calculateDifferentialMonths()
    {
        if (!this.props.unit || this.state.selectedUnitIndex === null)
        {
            return null;
        }

        const marketRentDifferentialStateDate = moment(this.props.appraisal.getEffectiveDate());
        const marketRentDifferentialEndDate = moment(this.props.unit.currentTenancy.endDate);

        const differentialMonths = [];

        const currentDate = marketRentDifferentialStateDate;

        const presentDifferentialPSF = (this.props.unit.currentTenancy.yearlyRent / this.props.unit.squareFootage) - this.props.unit.marketRentAmount;

        const monthlyDifferentialCashflow = (presentDifferentialPSF * this.props.unit.squareFootage) / 12.0;

        const monthlyDiscount = Math.pow(1.0 + (this.props.appraisal.stabilizedStatementInputs.marketRentDifferentialDiscountRate / 100), 1 / 12.0);

        let month = 0;

        while (currentDate.toDate().getTime() <= marketRentDifferentialEndDate.toDate().getTime())
        {
            const totalDiscount = monthlyDiscount ** month;

            const presentValue = monthlyDifferentialCashflow / totalDiscount;

            differentialMonths.push({
                date: currentDate.clone().toDate(),
                month: month,
                currentRent: this.props.unit.currentTenancy.yearlyRent / 12,
                marketRent: this.props.unit.marketRentAmount * this.props.unit.squareFootage / 12,
                presentMonthlyCashFlow: monthlyDifferentialCashflow,
                discount: totalDiscount,
                presentValue: presentValue,

            });

            currentDate.add(1, "months");
            month += 1;
        }

        return differentialMonths;
    }


    render()
    {
        if (!this.props.appraisal)
        {
            return null;
        }

        const differentialMonths = this.calculateDifferentialMonths();

        return (
            [
                <a id={this.popoverId}
                   onClick={() => this.setState({marketRentDifferentialPopoverOpen: !this.state.marketRentDifferentialPopoverOpen})}>
                    {
                        this.props.children
                    }
                </a>,
                <Popover placement="bottom" isOpen={this.state.marketRentDifferentialPopoverOpen} target={this.popoverId}
                         toggle={() => this.setState({marketRentDifferentialPopoverOpen: !this.state.marketRentDifferentialPopoverOpen})}>
                    <PopoverHeader>Unit {this.props.unit.unitNumber} - Market Rent Differential</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <thead>
                            <tr className={"total-row"}>
                                <td colSpan={2}></td>
                                <td colSpan={2}>
                                    PSF
                                </td>
                                <td>Annual</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={"total-row"}>
                                <td colSpan={2}>Contract Rent</td>
                                <td colSpan={2}>
                                    <CurrencyFormat value={differentialMonths[0].currentRent * 12 / this.props.unit.squareFootage}/>
                                </td>
                                <td>
                                    <CurrencyFormat value={differentialMonths[0].currentRent * 12}/>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={"total-row"}>
                                <td colSpan={2}>Market Rent</td>
                                <td colSpan={2}>
                                    <CurrencyFormat value={differentialMonths[0].marketRent * 12 / this.props.unit.squareFootage}/>
                                </td>
                                <td>
                                    <CurrencyFormat value={differentialMonths[0].marketRent * 12}/>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={"total-row"}>
                                <td colSpan={2}>Differential</td>
                                <td colSpan={2}>
                                    <CurrencyFormat value={differentialMonths[0].presentMonthlyCashFlow * 12 / this.props.unit.squareFootage}/>
                                </td>
                                <td>
                                    <CurrencyFormat value={differentialMonths[0].presentMonthlyCashFlow * 12}/>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={"total-row"}>
                                <td colSpan={2}><strong>Present Value</strong></td>
                                <td colSpan={3}><CurrencyFormat value={this.props.unit.calculatedMarketRentDifferential}/></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={"total-row"}>
                                <td colSpan={2}>Discount Rate</td>
                                <td colSpan={3}>
                                    <NonDroppableFieldDisplayEdit
                                        type={"percent"}
                                        placeholder={"Market Rent Differential Discount Rate"}
                                        value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.marketRentDifferentialDiscountRate : 5.0}
                                        onChange={(newValue) => this.changeStabilizedInput("marketRentDifferentialDiscountRate", newValue)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Date
                                </td>
                                <td>
                                    Month
                                </td>
                                <td>
                                    Actual Rent
                                </td>
                                <td>
                                    Market Rent
                                </td>
                                <td>
                                    Differential
                                </td>
                                <td>
                                    Present Value
                                </td>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                differentialMonths.map((differential, index) =>
                                {
                                    let className = "";

                                    if (index === differentialMonths.length - 1)
                                    {
                                        className = "underline";
                                    }

                                    return <tr key={index}>
                                        <td>
                                            <Moment date={differential.date} format="MMM YYYY"/>
                                        </td>
                                        <td>
                                            <IntegerFormat value={differential.month}/>
                                        </td>
                                        <td>
                                            <CurrencyFormat value={differential.currentRent}/>
                                        </td>
                                        <td>
                                            <CurrencyFormat value={differential.marketRent}/>
                                        </td>
                                        <td>
                                            <CurrencyFormat value={differential.presentMonthlyCashFlow}/>
                                        </td>
                                        <td className={className}>
                                            <CurrencyFormat value={differential.presentValue}/>
                                        </td>
                                    </tr>
                                })
                            }
                            <tr className={"total-row"}>
                                <td></td>
                                <td></td>
                                <td colSpan={3}><strong>Present Value</strong></td>
                                <td><CurrencyFormat value={this.props.unit.calculatedMarketRentDifferential}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
    }
}

export default MarketRentDifferentialForUnitCalculationPopoverWrapper;
