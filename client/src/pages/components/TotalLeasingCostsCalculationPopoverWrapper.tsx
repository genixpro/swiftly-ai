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

interface TotalLeasingCostsCalculationPopoverWrapperProps {
    appraisal?: Pick<UnitCalculationAppraisal, 'leasingCosts' | 'marketRents' | 'units'> & {
        stabilizedStatement: {vacantUnitLeasupCosts?: number | null};
    };
    children?: React.ReactNode;
}

function TotalLeasingCostsCalculationPopoverWrapper({appraisal, children}: TotalLeasingCostsCalculationPopoverWrapperProps)
{
        const [popoverOpen, setPopoverOpen] = React.useState(false);
        const popoverId = React.useRef(`total-leasing-costs-calculation-popover-${instance++}`).current;

        if (!appraisal)
        {
            return null;
        }

        const unitsForPopover = appraisal.units!.filter((unit) => unit.calculatedVacantUnitLeasupCosts !== 0);


        return (
            [
                <button type="button" className="btn btn-link p-0" id={popoverId} onClick={() => setPopoverOpen(!popoverOpen)} key={0}>
                    {children}
                </button>,
                <Popover placement="bottom" isOpen={popoverOpen} target={popoverId} toggle={() => setPopoverOpen(!popoverOpen)} key={1}>
                    <PopoverHeader>Total Leasing Costs</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            {
                                unitsForPopover.map((unit: UnitCalculationValues, unitIndex: number) =>
                                {
                                    const leasingCostStructure = findLeasingCostStructure(appraisal, unit, defaultLeasingCostStructureName)!;
                                    const marketRentAmount = unitMarketRentAmount(unit, appraisal.marketRents)!;

                                    const elems = [];

                                    elems.push(
                                        <tr key={unitIndex.toString() + "1"}>
                                            <td>Tenant Inducements</td>
                                            <td>Unit {unit.unitNumber}</td>
                                            <td />
                                            <td />
                                            <td>
                                            </td>
                                            <td />
                                            <td><AreaFormat value={unit.squareFootage}/></td>
                                            <td>*</td>
                                            <td><CurrencyFormat value={leasingCostStructure.tenantInducementsPSF}/></td>
                                            <td>=</td>
                                            <td><CurrencyFormat value={(unit.squareFootage as number) * (leasingCostStructure.tenantInducementsPSF as number)} cents={false}/></td>
                                        </tr>
                                    );

                                    if (leasingCostStructure.leasingCommissionMode === 'psf')
                                    {
                                        elems.push(
                                            <tr key={unitIndex.toString() + "2"}>
                                                <td>Leasing Costs</td>
                                                <td>Unit {unit.unitNumber}</td>
                                                <td />
                                                <td />
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
                                                    <CurrencyFormat value={(leasingCostStructure.leasingCommissionPSF as number) * (unit.squareFootage as number)} cents={false}/>
                                                </td>
                                            </tr>)
                                    }

                                    if (leasingCostStructure.leasingCommissionMode === 'percent_of_rent')
                                    {
                                            elems.push(
                                                <tr key={unitIndex.toString() + "3"}>
                                                <td>Leasing Costs - Year One</td>
                                                <td>Unit {unit.unitNumber}</td>
                                                <td />
                                                <td />
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
                                                        value={(leasingCostStructure.leasingCommissionPercentYearOne as number) / 100.0 * (marketRentAmount * (unit.squareFootage as number))}
                                                        cents={false}/>
                                                </td>
                                            </tr>)
                                    }

                                    if(leasingCostStructure.leasingCommissionMode === 'percent_of_rent' && ((leasingCostStructure.leasingPeriod as number) > 12))
                                    {
                                        elems.push(
                                            <tr key={unitIndex.toString() + "4"}>
                                                <td>Leasing Costs - Remaining Term</td>
                                                <td>Unit {unit.unitNumber}</td>
                                                <td>
                                                    {
                                                        <IntegerFormat value={Math.max(0, (leasingCostStructure.leasingPeriod as number) - 12) / 12.0}/>
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
                                                        value={(leasingCostStructure.leasingCommissionPercentRemainingYears as number) / 100.0 * (marketRentAmount * (unit.squareFootage as number))}
                                                        cents={false}/>
                                                </td>
                                            </tr>);
                                    }

                                    return elems;
                                })
                            }
                            <tr className={"total-row"}>
                                <td>Total Leasing Costs</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td><CurrencyFormat value={appraisal.stabilizedStatement.vacantUnitLeasupCosts} /></td>
                            </tr>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
}

export default TotalLeasingCostsCalculationPopoverWrapper;
