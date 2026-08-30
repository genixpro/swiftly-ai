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


class ManagementRecoveriesForUnitCalculationPopoverWrapper extends React.Component
{
    static instance = 0;

    state = {
        managementRecoveryPopoverOpen: false
    };

    static propTypes = {
        appraisal: PropTypes.instanceOf(AppraisalModel).isRequired,
        unit: PropTypes.instanceOf(UnitModel).isRequired,
    };

    constructor()
    {
        super();

        this.popoverId = `management-recovery-for-unit-calculation-popover-${ManagementRecoveriesForUnitCalculationPopoverWrapper.instance}`;
        ManagementRecoveriesForUnitCalculationPopoverWrapper.instance += 1;
    }

    render()
    {
        const unit = this.props.unit;
        const recovery = this.props.appraisal.recoveryStructureForUnit(unit);

        return (
            [
                <a id={this.popoverId} onClick={() => this.setState({managementRecoveryPopoverOpen: !this.state.managementRecoveryPopoverOpen})} key={0}>
                    {this.props.children}
                </a>,
                <Popover placement="bottom" isOpen={this.state.managementRecoveryPopoverOpen} target={this.popoverId} toggle={() => this.setState({managementRecoveryPopoverOpen: !this.state.managementRecoveryPopoverOpen})} key={1}>
                    <PopoverHeader>Management Recovery</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}><tr>
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
                            <td className>
                                <CurrencyFormat value={unit.calculatedManagementRecovery} />
                            </td>
                        </tr>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
    }
}

export default ManagementRecoveriesForUnitCalculationPopoverWrapper;
