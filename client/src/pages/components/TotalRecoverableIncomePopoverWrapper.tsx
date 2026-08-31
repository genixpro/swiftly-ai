import React from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import PercentFormat from "./PercentFormat";
import CurrencyFormat from "./CurrencyFormat";
import AreaFormat from "./AreaFormat";
import {appraisalBuildingSize, currentTenancy} from '../../domain/appraisal';
import type {RecoveryStructure} from '../../domain/recoveryStructures';
import type {UnitCalculationValues} from './unitCalculationTypes';

let instance = 0;

interface RecoverableIncomeUnit extends UnitCalculationValues {
    calculatedExpenseRecovery: number;
    calculatedManagementRecovery: number;
    calculatedTaxRecovery: number;
    squareFootage: number;
}

interface RecoverableIncomeAppraisal {
    stabilizedStatement: {
        operatingExpenses: number;
        taxes: number;
    };
    units: RecoverableIncomeUnit[];
}

interface RecoverableIncomeRecovery extends RecoveryStructure {
    calculatedExpenseRecoveries: Record<string, number | null | undefined>;
    calculatedManagementRecoveryBaseValue: number;
    calculatedManagementRecoveryTotal: number;
    calculatedTaxRecoveries: Record<string, number | null | undefined>;
    name: string;
}

interface TotalRecoverableIncomePopoverWrapperProps {
    appraisal: RecoverableIncomeAppraisal;
    recovery: RecoverableIncomeRecovery;
    children: React.ReactNode;
}

function TotalRecoverableIncomePopoverWrapper({appraisal, recovery, children}: TotalRecoverableIncomePopoverWrapperProps)
{
        const [popoverOpen, setPopoverOpen] = React.useState(false);
        const popoverId = React.useRef(`total-recoverable-income-calculation-popover-${instance++}`).current;
        const sizeOfBuilding = appraisalBuildingSize(appraisal);

        return (
            [
                <button type="button" className="btn btn-link p-0" id={popoverId} onClick={() => setPopoverOpen(!popoverOpen)} key={0}>
                    {children}
                </button>,
                <Popover placement="bottom" isOpen={popoverOpen} target={popoverId} toggle={() => setPopoverOpen(!popoverOpen)} key={1}>
                    <PopoverHeader>Total Recoverable Income</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            {
                                appraisal.units.map((unit, unitIndex) =>
                                {
                                    const tenancy = currentTenancy(unit)!;
                                    if (tenancy?.recoveryStructure !== recovery.name)
                                    {
                                        return null;
                                    }

                                    if (tenancy.rentType !== "net")
                                    {
                                        return null;
                                    }

                                    let className = "";

                                    if (unitIndex === appraisal.units.length - 1)
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
                                            <PercentFormat value={unit.squareFootage / sizeOfBuilding * 100} />
                                        </td>
                                        <td>
                                            *
                                        </td>
                                        <td>
                                            <PercentFormat value={
                                                (unit.calculatedManagementRecovery + unit.calculatedExpenseRecovery + unit.calculatedTaxRecovery) * 100
                                                    / (unit.squareFootage / sizeOfBuilding)
                                                / (recovery.calculatedManagementRecoveryBaseValue + appraisal.stabilizedStatement.operatingExpenses + appraisal.stabilizedStatement.taxes)
                                            } />
                                        </td>
                                        <td>
                                            *
                                        </td>
                                        <td>
                                            <CurrencyFormat value={recovery.calculatedManagementRecoveryBaseValue + appraisal.stabilizedStatement.operatingExpenses + appraisal.stabilizedStatement.taxes} />
                                        </td>
                                        <td>
                                            =
                                        </td>
                                        <td className={className}>
                                            <CurrencyFormat value={unit.calculatedManagementRecovery + unit.calculatedExpenseRecovery + unit.calculatedTaxRecovery} />
                                        </td>
                                    </tr>
                                })
                            }
                            <tr className={"total-row"}>
                                <td>Recovered Amount</td>
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
                                <td><CurrencyFormat value={recovery.calculatedManagementRecoveryTotal +
                                    (Object.values(recovery.calculatedExpenseRecoveries) as number[]).reduce((val, memo) => val + memo, 0) +
                                    (Object.values(recovery.calculatedTaxRecoveries) as number[]).reduce((val, memo) => val + memo, 0)
                                } /></td>
                            </tr>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
}

export default TotalRecoverableIncomePopoverWrapper;
