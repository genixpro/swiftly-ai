import React from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import PercentFormat from "./PercentFormat";
import CurrencyFormat from "./CurrencyFormat";
import IntegerFormat from "./IntegerFormat";
import AreaFormat from "./AreaFormat";
import {findLeasingCostStructure} from './unit-details/domain';
import {defaultLeasingCostStructureName} from '../../domain/leasingCosts';
import {unitMarketRentAmount} from '../../domain/appraisal';
import type {UnitCalculationAppraisal, UnitCalculationValues} from './unitCalculationTypes';

let instance = 0;

interface LeasingCostsPopoverProps {
    appraisal?: UnitCalculationAppraisal | null;
    children?: React.ReactNode;
    unit: UnitCalculationValues;
}

function LeasingCostsForUnitCalculationPopoverWrapper({appraisal, unit, children}: LeasingCostsPopoverProps)
{
        const [leasupCostPopoverOpen, setLeasupCostPopoverOpen] = React.useState(false);
        const popoverId = React.useRef(`leasing-costs-for-unit-calculation-popover-${instance++}`).current;

        if (!appraisal)
        {
            return null;
        }

        const leasingCostStructure = findLeasingCostStructure(appraisal, unit, defaultLeasingCostStructureName)!;
        const marketRentAmount = unitMarketRentAmount(unit, appraisal.marketRents)!;

        return (
            [
                <button type="button" className="btn btn-link p-0" id={popoverId} onClick={() => setLeasupCostPopoverOpen(!leasupCostPopoverOpen)} key="trigger">
                    {children}
                </button>,
                <Popover placement="bottom" isOpen={leasupCostPopoverOpen} target={popoverId}
                         toggle={() => setLeasupCostPopoverOpen(!leasupCostPopoverOpen)} key="popover">
                    <PopoverHeader>Unit {unit.unitNumber} - Leasing Costs</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            <tr>
                                <td>Tenant Inducements</td>
                                <td/>
                                <td/>
                                <td>
                                </td>
                                <td/>
                                <td><AreaFormat value={unit.squareFootage}/></td>
                                <td>*</td>
                                <td><CurrencyFormat value={leasingCostStructure.tenantInducementsPSF}/></td>
                                <td>=</td>
                                <td><CurrencyFormat value={unit.squareFootage! * leasingCostStructure.tenantInducementsPSF!} cents={false}/>
                                </td>
                            </tr>
                            {
                                leasingCostStructure.leasingCommissionMode === 'psf' ?
                                    <tr>
                                        <td>Leasing Costs</td>
                                        <td/>
                                        <td/>
                                        <td>
                                        </td>
                                        <td>
                                        </td>
                                        <td>
                                            <AreaFormat value={unit.squareFootage}/>
                                        </td>
                                        <td>*</td>
                                        <td>
                                            <CurrencyFormat value={leasingCostStructure.leasingCommissionPSF}/>
                                        </td>
                                        <td>=</td>
                                        <td className={"underline"}>
                                            <CurrencyFormat value={leasingCostStructure.leasingCommissionPSF! * unit.squareFootage!}
                                                            cents={false}/>
                                        </td>
                                    </tr> : null
                            }
                            {
                                leasingCostStructure.leasingCommissionMode === 'percent_of_rent' ?
                                    <tr>
                                        <td>Leasing Costs - Year One</td>
                                        <td/>
                                        <td/>
                                        <td>
                                            {
                                                unit.marketRent ?
                                                    <CurrencyFormat value={marketRentAmount} cents={true}/>
                                                    : <span className={"none-found"}>no market rent</span>
                                            }
                                        </td>
                                        <td>
                                            <span>*</span>
                                        </td>
                                        <td>
                                            <AreaFormat value={unit.squareFootage}/>
                                        </td>
                                        <td>*</td>
                                        <td>
                                            <PercentFormat value={leasingCostStructure.leasingCommissionPercentYearOne}/>
                                        </td>
                                        <td>=</td>
                                        <td>
                                            <CurrencyFormat
                                                value={leasingCostStructure.leasingCommissionPercentYearOne! / 100.0 * (marketRentAmount * unit.squareFootage!)}
                                                cents={false}/>
                                        </td>
                                    </tr> : null
                            }
                            {
                                leasingCostStructure.leasingCommissionMode === 'percent_of_rent' && (leasingCostStructure.leasingPeriod! > 12) ?
                                    <tr>
                                        <td>Leasing Costs - Remaining Term</td>
                                        <td>
                                            {
                                                <IntegerFormat value={Math.max(0, leasingCostStructure.leasingPeriod! - 12) / 12.0}/>
                                            }
                                        </td>
                                        <td>
                                            *
                                        </td>
                                        <td>
                                            {
                                                unit.marketRent ?
                                                    <CurrencyFormat value={marketRentAmount} cents={true}/>
                                                    : <span className={"none-found"}>no market rent</span>
                                            }
                                        </td>
                                        <td>
                                            <span>*</span>
                                        </td>
                                        <td>
                                            <AreaFormat value={unit.squareFootage}/>
                                        </td>
                                        <td>*</td>
                                        <td>
                                            <PercentFormat value={leasingCostStructure.leasingCommissionPercentRemainingYears}/>
                                        </td>
                                        <td>=</td>
                                        <td className={"underline"}>
                                            <CurrencyFormat
                                                value={leasingCostStructure.leasingCommissionPercentRemainingYears! / 100.0 * (marketRentAmount * unit.squareFootage!) * Math.max(0, leasingCostStructure.leasingPeriod! - 12) / 12.0}
                                                cents={false}/>
                                        </td>
                                    </tr> : null
                            }
                            <tr className={"total-row"}>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td colSpan={2}>Total Leasing Costs</td>
                                <td><CurrencyFormat value={unit.calculatedVacantUnitLeasupCosts} cents={false}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
}

export default LeasingCostsForUnitCalculationPopoverWrapper;
