import React from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import CurrencyFormat from "./CurrencyFormat";
import IntegerFormat from "./IntegerFormat";
import {NonDroppableFieldDisplayEdit} from "./FieldDisplayEdit";
import Moment from "@components/Common/MomentDisplay";
import { eachMonthInclusive } from '@utils/dates';
import {appraisalEffectiveDate, currentTenancy, unitMarketRentAmount} from '../../domain/appraisal';
import type {TenancyDTO} from '../../api/types';
import type {UnitCalculationAppraisal, UnitCalculationValues} from './unitCalculationTypes';


let marketRentDifferentialPopoverInstance = 0;

interface MarketRentDifferentialForUnitCalculationPopoverWrapperProps {
    appraisal: UnitCalculationAppraisal;
    unit: UnitCalculationValues;
    children?: React.ReactNode;
}

interface DifferentialMonth {
    currentRent: number;
    date: Date;
    discount: number;
    marketRent: number;
    month: number;
    presentMonthlyCashFlow: number;
    presentValue: number;
}

interface LegacyMarketRentDifferentialEditor {
    changeStabilizedInput(field: string, value: unknown): void;
}

interface MarketRentDifferentialPopoverState {
    marketRentDifferentialPopoverOpen: boolean;
    selectedUnitIndex?: number | null;
}

function MarketRentDifferentialForUnitCalculationPopoverWrapper({appraisal, children, unit}: MarketRentDifferentialForUnitCalculationPopoverWrapperProps)
{
    const [state, setState] = React.useState<MarketRentDifferentialPopoverState>({marketRentDifferentialPopoverOpen: false});
    const popoverIdRef = React.useRef<string | null>(null);
    if (!popoverIdRef.current)
    {
        popoverIdRef.current = `market-rent-differential-for-unit-calculation-popover-${marketRentDifferentialPopoverInstance}`;
        marketRentDifferentialPopoverInstance += 1;
    }
    const popoverId = popoverIdRef.current;
    // This unconnected legacy editor intentionally retains the current edit-time
    // failure behaviour until the calculation workflow is migrated as a unit.
    const legacyEditor = {} as LegacyMarketRentDifferentialEditor;


    function calculateDifferentialMonths()
    {
        if (!unit || state.selectedUnitIndex === null)
        {
            return null;
        }

        const differentialMonths: DifferentialMonth[] = [];

        const presentDifferentialPSF = ((tenancy.yearlyRent as number) / (unit.squareFootage as number)) - marketRentAmount!;

        const monthlyDifferentialCashflow = (presentDifferentialPSF * (unit.squareFootage as number)) / 12.0;

        const monthlyDiscount = Math.pow(1.0 + ((appraisal.stabilizedStatementInputs!.marketRentDifferentialDiscountRate as number) / 100), 1 / 12.0);

        let month = 0;

        for (const currentDate of eachMonthInclusive(appraisalEffectiveDate(appraisal), tenancy.endDate))
        {
            const totalDiscount = monthlyDiscount ** month;

            const presentValue = monthlyDifferentialCashflow / totalDiscount;

            differentialMonths.push({
                date: currentDate,
                month: month,
                currentRent: (tenancy.yearlyRent as number) / 12,
                marketRent: marketRentAmount! * (unit.squareFootage as number) / 12,
                presentMonthlyCashFlow: monthlyDifferentialCashflow,
                discount: totalDiscount,
                presentValue: presentValue,

            });

            month += 1;
        }

        return differentialMonths;
    }


        if (!appraisal)
        {
            return null;
        }

        const marketRentAmount = unitMarketRentAmount(unit, appraisal.marketRents)!;
        const tenancy = currentTenancy(unit) as TenancyDTO;
        const differentialMonths = calculateDifferentialMonths() as DifferentialMonth[];

        return (
            [
                <button type="button" className="btn btn-link p-0" id={popoverId}
                   onClick={() => setState({marketRentDifferentialPopoverOpen: !state.marketRentDifferentialPopoverOpen})}>
                    {
                        children
                    }
                </button>,
                <Popover placement="bottom" isOpen={state.marketRentDifferentialPopoverOpen} target={popoverId}
                         toggle={() => setState({marketRentDifferentialPopoverOpen: !state.marketRentDifferentialPopoverOpen})}>
                    <PopoverHeader>Unit {unit.unitNumber} - Market Rent Differential</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <thead>
                            <tr className={"total-row"}>
                                <td colSpan={2}></td>
                                <td colSpan={2}>
                                    PSF
                                </td>
                                <td>Annual</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={"total-row"}>
                                <td colSpan={2}>Contract Rent</td>
                                <td colSpan={2}>
                                    <CurrencyFormat value={differentialMonths[0].currentRent * 12 / (unit.squareFootage as number)}/>
                                </td>
                                <td>
                                    <CurrencyFormat value={differentialMonths[0].currentRent * 12}/>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={"total-row"}>
                                <td colSpan={2}>Market Rent</td>
                                <td colSpan={2}>
                                    <CurrencyFormat value={differentialMonths[0].marketRent * 12 / (unit.squareFootage as number)}/>
                                </td>
                                <td>
                                    <CurrencyFormat value={differentialMonths[0].marketRent * 12}/>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={"total-row"}>
                                <td colSpan={2}>Differential</td>
                                <td colSpan={2}>
                                    <CurrencyFormat value={differentialMonths[0].presentMonthlyCashFlow * 12 / (unit.squareFootage as number)}/>
                                </td>
                                <td>
                                    <CurrencyFormat value={differentialMonths[0].presentMonthlyCashFlow * 12}/>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={"total-row"}>
                                <td colSpan={2}><strong>Present Value</strong></td>
                                <td colSpan={3}><CurrencyFormat value={unit.calculatedMarketRentDifferential}/></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={"total-row"}>
                                <td colSpan={2}>Discount Rate</td>
                                <td colSpan={3}>
                                    <NonDroppableFieldDisplayEdit
                                        type={"percent"}
                                        placeholder={"Market Rent Differential Discount Rate"}
                                        value={appraisal.stabilizedStatementInputs ? appraisal.stabilizedStatementInputs.marketRentDifferentialDiscountRate : 5.0}
                                        onChange={(newValue) => legacyEditor.changeStabilizedInput("marketRentDifferentialDiscountRate", newValue)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Date
                                </td>
                                <td>
                                    Month
                                </td>
                                <td>
                                    Actual Rent
                                </td>
                                <td>
                                    Market Rent
                                </td>
                                <td>
                                    Differential
                                </td>
                                <td>
                                    Present Value
                                </td>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                differentialMonths.map((differential, index) =>
                                {
                                    let className = "";

                                    if (index === differentialMonths.length - 1)
                                    {
                                        className = "underline";
                                    }

                                    return <tr key={index}>
                                        <td>
                                            <Moment date={differential.date} format="MMM YYYY"/>
                                        </td>
                                        <td>
                                            <IntegerFormat value={differential.month}/>
                                        </td>
                                        <td>
                                            <CurrencyFormat value={differential.currentRent}/>
                                        </td>
                                        <td>
                                            <CurrencyFormat value={differential.marketRent}/>
                                        </td>
                                        <td>
                                            <CurrencyFormat value={differential.presentMonthlyCashFlow}/>
                                        </td>
                                        <td className={className}>
                                            <CurrencyFormat value={differential.presentValue}/>
                                        </td>
                                    </tr>
                                })
                            }
                            <tr className={"total-row"}>
                                <td></td>
                                <td></td>
                                <td colSpan={3}><strong>Present Value</strong></td>
                                <td><CurrencyFormat value={unit.calculatedMarketRentDifferential}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
}

export default MarketRentDifferentialForUnitCalculationPopoverWrapper;
