import React from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import CurrencyFormat from "./CurrencyFormat";
import IntegerFormat from "./IntegerFormat";
import {findLeasingCostStructure} from './unit-details/domain';
import {defaultLeasingCostStructureName} from '../../domain/leasingCosts';
import {currentTenancy, unitMarketRentAmount} from '../../domain/appraisal';
import type {UnitCalculationAppraisal, UnitCalculationValues} from './unitCalculationTypes';
let instance = 0;

interface VacantRentLossPopoverProps {
    appraisal?: UnitCalculationAppraisal | null;
    children?: React.ReactNode;
    unit: UnitCalculationValues;
}

function VacantRentLossForUnitCalculationPopoverWrapper({appraisal, unit, children}: VacantRentLossPopoverProps)
{
    const [rentLossPopoverOpen, setRentLossPopoverOpen] = React.useState(false);
    const popoverId = React.useRef(`free-rent-loss-for-unit-calculation-popover-${instance++}`).current;
        if (!appraisal)
        {
            return null;
        }

        const leasingCostStructure = findLeasingCostStructure(appraisal, unit, defaultLeasingCostStructureName)!;
        const marketRentAmount = unitMarketRentAmount(unit, appraisal.marketRents)!;
        const tenancy = currentTenancy(unit)!;

        return (
            <><button type="button" className="btn btn-link p-0" id={popoverId} onClick={() => setRentLossPopoverOpen(open => !open)}>
                {
                    children
                }
            </button>,
                <Popover placement="bottom" isOpen={rentLossPopoverOpen} target={popoverId}
                         toggle={() => setRentLossPopoverOpen(open => !open)}>
                    <PopoverHeader>Unit {unit.unitNumber} - Vacant Rent Loss</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            <tr className={"total-row"}>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td><strong>Annual Amount</strong></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={"total-row"}>
                                <td>Rent Loss</td>
                                <td><IntegerFormat value={leasingCostStructure.renewalPeriod}/></td>
                                <td>/</td>
                                <td>12</td>
                                <td>*</td>
                                <td><CurrencyFormat value={marketRentAmount * unit.squareFootage!}/></td>
                                <td>=</td>
                                <td><CurrencyFormat
                                    value={leasingCostStructure.renewalPeriod! / 12.0 * marketRentAmount * unit.squareFootage!}
                                    cents={false}/></td>
                            </tr>
                            {
                                tenancy.rentType === 'net' ?
                                    <tr className={"total-row"}>
                                        <td>Recovery Loss</td>
                                        <td><IntegerFormat value={leasingCostStructure.renewalPeriod}/></td>
                                        <td>/</td>
                                        <td>12</td>
                                        <td>*</td>
                                        <td><CurrencyFormat
                                            value={unit.calculatedTaxRecovery! + unit.calculatedManagementRecovery! + unit.calculatedExpenseRecovery!}/>
                                        </td>
                                        <td>=</td>
                                        <td><CurrencyFormat
                                            value={(unit.calculatedTaxRecovery! + unit.calculatedManagementRecovery! + unit.calculatedExpenseRecovery!) / 12.0 * leasingCostStructure.renewalPeriod!}
                                            cents={false}/></td>
                                    </tr> : null
                            }
                            <tr className={"total-row"}>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td colSpan={2}><strong>Gross Rent Loss</strong></td>
                                <td><CurrencyFormat value={unit.calculatedVacantUnitRentLoss} cents={false}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            </>
        );
}

export default VacantRentLossForUnitCalculationPopoverWrapper;
