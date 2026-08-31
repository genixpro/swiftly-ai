import React from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import PercentFormat from "./PercentFormat";
import CurrencyFormat from "./CurrencyFormat";
import AreaFormat from "./AreaFormat";
import {appraisalBuildingSize, currentTenancy} from '../../domain/appraisal';
import type {RecoveryStructure} from '../../domain/recoveryStructures';
import type {UnitCalculationValues} from './unitCalculationTypes';
import type {RecoveryCalculationAppraisal} from './recoveryCalculationTypes';

let instance = 0;

interface ManagementExpenseRecoveryCalculationPopoverWrapperProps {
    appraisal: RecoveryCalculationAppraisal;
    recovery: RecoveryStructure;
    children: React.ReactNode;
}

function ManagementExpenseRecoveryCalculationPopoverWrapper({appraisal, recovery, children}: ManagementExpenseRecoveryCalculationPopoverWrapperProps)
{
        const [managementRecoveryPopoverOpen, setManagementRecoveryPopoverOpen] = React.useState(false);
        const popoverId = React.useRef(`management-expense-recovery-calculation-popover-${instance++}`).current;
        const sizeOfBuilding = appraisalBuildingSize(appraisal as {units: UnitCalculationValues[] | null | undefined});

        return (
            [
                <button type="button" className="btn btn-link p-0" id={popoverId} onClick={() => setManagementRecoveryPopoverOpen(!managementRecoveryPopoverOpen)} key={0}>
                    {children}
                </button>,
                <Popover placement="bottom" isOpen={managementRecoveryPopoverOpen} target={popoverId} toggle={() => setManagementRecoveryPopoverOpen(!managementRecoveryPopoverOpen)} key={1}>
                    <PopoverHeader>Management Recovery</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            {
                                appraisal.units!.map((unit, unitIndex) =>
                                {
                                    const tenancy = currentTenancy(unit)!;
                                    if (tenancy?.recoveryStructure !== recovery.name)
                                    {
                                        return null;
                                    }

                                    if (tenancy.rentType !== "gross")
                                    {
                                        return null;
                                    }

                                    let className = "";

                                    if (unitIndex === appraisal.units!.length - 1)
                                    {
                                        className = "underline";
                                    }

                                    return <tr key={unitIndex}>
                                        <td>{tenancy.name}</td>
                                        <td>
                                            <AreaFormat value={unit.squareFootage} />
                                        </td>
                                        <td>
                                            /
                                        </td>
                                        <td>
                                            <AreaFormat value={sizeOfBuilding} />
                                        </td>
                                        <td>
                                            =
                                        </td>
                                        <td>
                                            <PercentFormat value={unit.squareFootage! / sizeOfBuilding * 100} />
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
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
}

export default ManagementExpenseRecoveryCalculationPopoverWrapper;
