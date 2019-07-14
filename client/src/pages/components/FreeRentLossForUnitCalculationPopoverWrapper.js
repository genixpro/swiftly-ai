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


class FreeRentLossForUnitCalculationPopoverWrapper extends React.Component
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

        this.popoverId = `free-rent-loss-for-unit-calculation-popover-${FreeRentLossForUnitCalculationPopoverWrapper.instance}`;
        FreeRentLossForUnitCalculationPopoverWrapper.instance += 1;
    }


    render()
    {
        if (!this.props.appraisal)
        {
            return null;
        }

        return (
            [
                <a id={this.popoverId}
                   key={1}
                   onClick={() => this.setState({freeRentLossPopoverOpen: !this.state.freeRentLossPopoverOpen})}>
                    {
                        this.props.children
                    }
                </a>,
                <Popover key={2} placement="bottom" isOpen={this.state.freeRentLossPopoverOpen} target={this.popoverId}
                         toggle={() => this.setState({freeRentLossPopoverOpen: !this.state.freeRentLossPopoverOpen})}>
                    <PopoverHeader>Free Rent Loss</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            <tr className={"total-row"}>
                                <td>Free Rent Loss</td>
                                <td><IntegerFormat value={this.props.unit.calculatedFreeRentMonths}/> months remaining</td>
                                <td>/</td>
                                <td>12</td>
                                <td>*</td>
                                <td><CurrencyFormat value={this.props.unit.calculatedFreeRentNetAmount}/></td>
                                <td>=</td>
                                <td><CurrencyFormat value={this.props.unit.calculatedFreeRentLoss} cents={false}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
    }
}

export default FreeRentLossForUnitCalculationPopoverWrapper;
