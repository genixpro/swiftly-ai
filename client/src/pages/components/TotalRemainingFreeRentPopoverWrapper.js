import React from 'react';
import _ from "underscore";
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import PercentFormat from "./PercentFormat";
import CurrencyFormat from "./CurrencyFormat";
import IntegerFormat from "./IntegerFormat";
import PropTypes from "prop-types";
import AppraisalModel from "../../models/AppraisalModel";


class TotalRemainingFreeRentPopoverWrapper extends React.Component
{
    static instance = 0;

    state = {};

    static propTypes = {
        appraisal: PropTypes.instanceOf(AppraisalModel).isRequired
    };

    constructor()
    {
        super();

        this.popoverId = `free-rent-loss-popover-${TotalRemainingFreeRentPopoverWrapper.instance}`;
        TotalRemainingFreeRentPopoverWrapper.instance += 1;
    }

    render()
    {
        return (
            [
                <a id={this.popoverId} onClick={() => this.setState({freeRentLossPopoverOpen: !this.state.freeRentLossPopoverOpen})}>
                    {this.props.children}
                </a>,
                <Popover placement="bottom" isOpen={this.state.freeRentLossPopoverOpen} target={this.popoverId}
                         toggle={() => this.setState({freeRentLossPopoverOpen: !this.state.freeRentLossPopoverOpen})}>
                    <PopoverHeader>Remaining Free Rent</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            {
                                this.props.appraisal.units.map((unit, unitIndex) =>
                                {
                                    const underline = unitIndex === this.props.appraisal.units.length - 1 ? "underline" : "";

                                    return <tr key={unitIndex}>
                                        <td>Unit {unit.unitNumber}</td>
                                        <td><IntegerFormat value={unit.calculatedFreeRentMonths}/> months remaining</td>
                                        <td>/</td>
                                        <td>12</td>
                                        <td>*</td>
                                        <td><CurrencyFormat value={unit.calculatedFreeRentNetAmount}/></td>
                                        <td>=</td>
                                        <td className={underline}><CurrencyFormat value={unit.calculatedFreeRentLoss} cents={false}/></td>
                                    </tr>
                                })
                            }
                            <tr className={"total-row"}>
                                <td>Free Rent Loss</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td><CurrencyFormat value={-this.props.appraisal.stabilizedStatement.freeRentRentLoss} cents={false}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
    }
}

export default TotalRemainingFreeRentPopoverWrapper;
