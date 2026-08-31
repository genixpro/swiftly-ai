import React from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import CurrencyFormat from "./CurrencyFormat";
import IntegerFormat from "./IntegerFormat";
import {findLeasingCostStructure} from './unit-details/domain';
import {defaultLeasingCostStructureName} from '../../domain/leasingCosts';
import {unitMarketRentAmount} from '../../domain/appraisal';
import type {UnitCalculationAppraisal, UnitCalculationValues} from './unitCalculationTypes';

let instance = 0;

interface TotalVacantUnitRentLossCalculationPopoverWrapperProps {
    appraisal: Pick<UnitCalculationAppraisal, 'leasingCosts' | 'marketRents' | 'units'> & {
        stabilizedStatement: {vacantUnitRentLoss?: number | null};
    };
    children: React.ReactNode;
}

function TotalVacantUnitRentLossCalculationPopoverWrapper({appraisal, children}: TotalVacantUnitRentLossCalculationPopoverWrapperProps)
{
    const [popoverOpen, setPopoverOpen] = React.useState(false);
    const popoverId = React.useRef(`total-vacant-unit-rent-loss-calculation-popover-${instance++}`).current;

        const unitsForPopover = appraisal.units!.filter((unit) => unit.calculatedVacantUnitRentLoss !== 0);

        return (
            <>
                <button type="button" className="btn btn-link p-0" id={popoverId} onClick={() => setPopoverOpen(open => !open)}>
                    {children}
                </button>,
                <Popover placement="bottom" isOpen={popoverOpen} target={popoverId} toggle={() => setPopoverOpen(open => !open)}>
                    <PopoverHeader>Total Vacant Unit Rent Loss</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tr className={"total-row"}>
                                <td>Unit</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td><strong>Annual Amount</strong></td>
                                <td></td>
                                <td></td>
                            </tr>
                            {
                                unitsForPopover.map((unit: UnitCalculationValues, unitIndex: number) =>
                                {
                                    const marketRentAmount = unitMarketRentAmount(unit, appraisal.marketRents)!;
                                    return <tr key={unitIndex} className={`total-row ${unitIndex === unitsForPopover.length - 1 ? "underline" : ""}`}>
                                        <td>Unit {unit.unitNumber}</td>
                                        <td><IntegerFormat value={findLeasingCostStructure(appraisal, unit, defaultLeasingCostStructureName)!.renewalPeriod}/></td>
                                        <td>/</td>
                                        <td>12</td>
                                        <td>*</td>
                                        <td><CurrencyFormat value={marketRentAmount * (unit.squareFootage as number) + (unit.calculatedTaxRecovery as number) + (unit.calculatedManagementRecovery as number) + (unit.calculatedExpenseRecovery as number)}/></td>
                                        <td>=</td>
                                        <td><CurrencyFormat value={unit.calculatedVacantUnitRentLoss} cents={false}/></td>
                                    </tr>
                                })
                            }
                            <tr className={"total-row"}>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td colSpan={2}><strong>Gross Rent Loss</strong></td>
                                <td><CurrencyFormat value={appraisal.stabilizedStatement.vacantUnitRentLoss} cents={false} /></td>
                            </tr>
                        </table>
                    </PopoverBody>
                </Popover>
            </>
        );
}

export default TotalVacantUnitRentLossCalculationPopoverWrapper;
