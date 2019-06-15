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


class ManagementExpenseRecoveryCalculationPopoverWrapper extends React.Component
{
    static instance = 0;

    state = {
        managementRecoveryPopoverOpen: false
    };

    static propTypes = {
        appraisal: PropTypes.instanceOf(AppraisalModel).isRequired,
        recovery: PropTypes.instanceOf(RecoveryStructureModel).isRequired,
    };

    constructor()
    {
        super();

        this.popoverId = `management-expense-recovery-calculation-popover-${ManagementExpenseRecoveryCalculationPopoverWrapper.instance}`;
        ManagementExpenseRecoveryCalculationPopoverWrapper.instance += 1;
    }

    render()
    {
        const recovery = this.props.recovery;

        return (
            [
                <a id={this.popoverId} onClick={() => this.setState({managementRecoveryPopoverOpen: !this.state.managementRecoveryPopoverOpen})} key={0}>
                    {this.props.children}
                </a>,
                <Popover placement="bottom" isOpen={this.state.managementRecoveryPopoverOpen} target={this.popoverId} toggle={() => this.setState({managementRecoveryPopoverOpen: !this.state.managementRecoveryPopoverOpen})} key={1}>
                    <PopoverHeader>Management Recovery</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            {
                                this.props.appraisal.units.map((unit, unitIndex) =>
                                {
                                    if (unit.currentTenancy.recoveryStructure !== recovery.name)
                                    {
                                        return null;
                                    }

                                    if (unit.currentTenancy.rentType !== "gross")
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
                                            <PercentFormat value={recovery.managementRecoveryOperatingPercentage} />
                                        </td>
                                        <td>
                                            *
                                        </td>
                                        <td>
                                            <CurrencyFormat value={recovery.calculatedManagementRecoveryBaseValue} />
                                        </td>
                                        <td>
                                            =
                                        </td>
                                        <td className={className}>
                                            <CurrencyFormat value={unit.calculatedManagementRecovery} />
                                        </td>
                                    </tr>
                                })
                            }
                            <tr className={"total-row"}>
                                <td>Recovered Amount Under Structure</td>
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
                                <td><CurrencyFormat value={recovery.calculatedManagementRecoveryTotal} /></td>
                            </tr>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
    }
}

export default ManagementExpenseRecoveryCalculationPopoverWrapper;
