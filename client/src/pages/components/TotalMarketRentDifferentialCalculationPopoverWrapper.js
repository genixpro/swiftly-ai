import React from 'react';
import _ from "underscore";
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import PercentFormat from "./PercentFormat";
import CurrencyFormat from "./CurrencyFormat";
import PropTypes from "prop-types";
import AppraisalModel from "../../models/AppraisalModel";


class TotalMarketRentDifferentialCalculationPopoverWrapper extends React.Component
{
    static instance = 0;

    state = {};

    static propTypes = {
        appraisal: PropTypes.instanceOf(AppraisalModel).isRequired
    };

    constructor()
    {
        super();

        this.popoverId = `market-rent-differential-popover-${TotalMarketRentDifferentialCalculationPopoverWrapper.instance}`;
        TotalMarketRentDifferentialCalculationPopoverWrapper.instance += 1;
    }

    render()
    {
        return (
            [
                <a id={this.popoverId} onClick={() => this.setState({marketRentDifferentialPopoverOpen: !this.state.marketRentDifferentialPopoverOpen})}>
                    {this.props.children}
                </a>,
                <Popover placement="bottom" isOpen={this.state.marketRentDifferentialPopoverOpen} target={this.popoverId}
                         toggle={() => this.setState({marketRentDifferentialPopoverOpen: !this.state.marketRentDifferentialPopoverOpen})}>
                    <PopoverHeader>Market Rent Differential</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            <tr>
                                <td>Discount Rate</td>
                                <td>
                                    <PercentFormat value={this.props.appraisal.stabilizedStatementInputs.marketRentDifferentialDiscountRate}/>
                                </td>
                            </tr>
                            {
                                _.filter(this.props.appraisal.units, (unit) => unit.calculatedMarketRentDifferential).map((unit, unitIndex) =>
                                {
                                    let underline = "";
                                    if (unitIndex === this.props.appraisal.units.length - 1)
                                    {
                                        underline = `underline`;
                                    }

                                    return <tr key={unitIndex}>
                                        <td>Unit {unit.unitNumber}</td>
                                        <td className={underline}><CurrencyFormat value={unit.calculatedMarketRentDifferential}/></td>
                                    </tr>;
                                })
                            }
                            <tr className={"total-row"}>
                                <td>
                                    Total
                                </td>
                                <td>
                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.marketRentDifferential}/>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
    }
}

export default TotalMarketRentDifferentialCalculationPopoverWrapper;
