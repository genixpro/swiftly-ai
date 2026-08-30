import React from 'react';
import _ from "underscore";
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import PercentFormat from "./PercentFormat";
import CurrencyFormat from "./CurrencyFormat";
import IntegerFormat from "./IntegerFormat";
import PropTypes from "prop-types";
import AppraisalModel from "../../models/AppraisalModel";


class StructuralAllowanceCalculationPopoverWrapper extends React.Component
{
    static instance = 0;

    state = {};

    static propTypes = {
        appraisal: PropTypes.instanceOf(AppraisalModel).isRequired
    };

    constructor()
    {
        super();

        this.popoverId = `structural-allowance-popover-${StructuralAllowanceCalculationPopoverWrapper.instance}`;
        StructuralAllowanceCalculationPopoverWrapper.instance += 1;
    }

    render()
    {
        return (
            [
                <a id={this.popoverId} onClick={() => this.setState({structuralAllowancePopoverOpen: !this.state.structuralAllowancePopoverOpen})}>
                    {this.props.children}
                </a>,
                <Popover placement="bottom" isOpen={this.state.structuralAllowancePopoverOpen} target={this.popoverId}
                         toggle={() => this.setState({structuralAllowancePopoverOpen: !this.state.structuralAllowancePopoverOpen})}>
                    <PopoverHeader>Structural Allowance</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tr>
                                <td>Potential Gross Income</td>
                                <td><CurrencyFormat value={this.props.appraisal.stabilizedStatement.potentialGrossIncome}/></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td className={"underline"}>* <PercentFormat value={this.props.appraisal.stabilizedStatementInputs.structuralAllowancePercent}/>
                                </td>
                            </tr>
                            <tr>
                                <td>Structural Allowance</td>
                                <td><CurrencyFormat value={this.props.appraisal.stabilizedStatement.structuralAllowance}/></td>
                            </tr>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
    }
}

export default StructuralAllowanceCalculationPopoverWrapper;
