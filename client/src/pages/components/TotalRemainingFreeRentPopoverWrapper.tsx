import React from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import CurrencyFormat from "./CurrencyFormat";
import IntegerFormat from "./IntegerFormat";
import type {UnitCalculationValues} from './unitCalculationTypes';

let instance = 0;

interface TotalRemainingFreeRentPopoverWrapperProps {
    appraisal: {
        units?: readonly UnitCalculationValues[] | null;
        stabilizedStatement: {freeRentRentLoss?: number | null};
    };
    children: React.ReactNode;
}

function TotalRemainingFreeRentPopoverWrapper({appraisal, children}: TotalRemainingFreeRentPopoverWrapperProps)
{
    const [freeRentLossPopoverOpen, setFreeRentLossPopoverOpen] = React.useState(false);
    const popoverId = React.useRef(`free-rent-loss-popover-${instance++}`).current;

        return (
            <>
                <button type="button" className="btn btn-link p-0" id={popoverId} onClick={() => setFreeRentLossPopoverOpen(open => !open)}>
                    {children}
                </button>,
                <Popover placement="bottom" isOpen={freeRentLossPopoverOpen} target={popoverId}
                         toggle={() => setFreeRentLossPopoverOpen(open => !open)}>
                    <PopoverHeader>Remaining Free Rent</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            {
                                appraisal.units!.map((unit, unitIndex) =>
                                {
                                    const underline = unitIndex === appraisal.units!.length - 1 ? "underline" : "";

                                    return <tr key={unitIndex}>
                                        <td>Unit {unit.unitNumber}</td>
                                        <td><IntegerFormat value={unit.calculatedFreeRentMonths}/> months remaining</td>
                                        <td>/</td>
                                        <td>12</td>
                                        <td>*</td>
                                        <td><CurrencyFormat value={unit.calculatedFreeRentNetAmount}/></td>
                                        <td>=</td>
                                        <td className={underline}><CurrencyFormat value={unit.calculatedFreeRentLoss} cents={false}/></td>
                                    </tr>
                                })
                            }
                            <tr className={"total-row"}>
                                <td>Free Rent Loss</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td><CurrencyFormat value={-(appraisal.stabilizedStatement.freeRentRentLoss as number)} cents={false}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            </>
        );
}

export default TotalRemainingFreeRentPopoverWrapper;
