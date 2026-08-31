import React from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import PercentFormat from "./PercentFormat";
import CurrencyFormat from "./CurrencyFormat";
import AreaFormat from "./AreaFormat";
import {appraisalBuildingSize, currentTenancy} from '../../domain/appraisal';
import {findRecoveryStructure} from '../../domain/recoveryStructures';
import type {UnitCalculationValues} from './unitCalculationTypes';
import type {RecoveryCalculationAppraisal} from './recoveryCalculationTypes';

let instance = 0;

interface ManagementRecoveriesForUnitCalculationPopoverWrapperProps {
    appraisal: RecoveryCalculationAppraisal;
    unit: UnitCalculationValues;
    children: React.ReactNode;
}

function ManagementRecoveriesForUnitCalculationPopoverWrapper({appraisal, unit, children}: ManagementRecoveriesForUnitCalculationPopoverWrapperProps)
{
    const [managementRecoveryPopoverOpen, setManagementRecoveryPopoverOpen] = React.useState(false);
    const popoverId = React.useRef(`management-recovery-for-unit-calculation-popover-${instance++}`).current;
    const recovery = findRecoveryStructure(appraisal, unit)!;
    const sizeOfBuilding = appraisalBuildingSize(appraisal as {units: UnitCalculationValues[] | null | undefined});
    const tenancy = currentTenancy(unit)!;

        return (
            <>
                <button type="button" className="btn btn-link p-0" id={popoverId} onClick={() => setManagementRecoveryPopoverOpen(open => !open)}>
                    {children}
                </button>,
                <Popover placement="bottom" isOpen={managementRecoveryPopoverOpen} target={popoverId} toggle={() => setManagementRecoveryPopoverOpen(open => !open)}>
                    <PopoverHeader>Management Recovery</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}><tbody><tr>
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
                            <td className="true">
                                <CurrencyFormat value={unit.calculatedManagementRecovery} />
                            </td>
                        </tr></tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            </>
        );
}

export default ManagementRecoveriesForUnitCalculationPopoverWrapper;
