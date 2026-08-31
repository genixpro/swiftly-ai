import React from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import CurrencyFormat from "./CurrencyFormat";
import IntegerFormat from "./IntegerFormat";
import type {UnitCalculationValues} from './unitCalculationTypes';

let instance = 0;

interface FreeRentLossPopoverProps {
    appraisal?: object | null;
    children?: React.ReactNode;
    unit: UnitCalculationValues;
}

function FreeRentLossForUnitCalculationPopoverWrapper({appraisal, unit, children}: FreeRentLossPopoverProps)
{
    const [freeRentLossPopoverOpen, setFreeRentLossPopoverOpen] = React.useState(false);
    const popoverId = React.useRef(`free-rent-loss-for-unit-calculation-popover-${instance++}`).current;
    if (!appraisal)
        {
            return null;
        }

        return (
            <>
                <button type="button" className="btn btn-link p-0" id={popoverId}
                   onClick={() => setFreeRentLossPopoverOpen(open => !open)}>
                    {
                        children
                    }
                </button>,
                <Popover placement="bottom" isOpen={freeRentLossPopoverOpen} target={popoverId}
                         toggle={() => setFreeRentLossPopoverOpen(open => !open)}>
                    <PopoverHeader>Free Rent Loss</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            <tr className={"total-row"}>
                                <td>Free Rent Loss</td>
                                <td><IntegerFormat value={unit.calculatedFreeRentMonths}/> months remaining</td>
                                <td>/</td>
                                <td>12</td>
                                <td>*</td>
                                <td><CurrencyFormat value={unit.calculatedFreeRentNetAmount}/></td>
                                <td>=</td>
                                <td><CurrencyFormat value={unit.calculatedFreeRentLoss} cents={false}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            </>
        );
}

export default FreeRentLossForUnitCalculationPopoverWrapper;
