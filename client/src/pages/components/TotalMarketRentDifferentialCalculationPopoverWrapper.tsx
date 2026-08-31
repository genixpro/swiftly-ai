import React from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import PercentFormat from "./PercentFormat";
import CurrencyFormat from "./CurrencyFormat";
import type {UnitCalculationValues} from './unitCalculationTypes';

let instance = 0;

interface TotalMarketRentDifferentialCalculationPopoverWrapperProps {
    appraisal: {
        units?: readonly UnitCalculationValues[] | null;
        stabilizedStatement: {marketRentDifferential?: number | null};
        stabilizedStatementInputs: {marketRentDifferentialDiscountRate?: number | null};
    };
    children: React.ReactNode;
}

function TotalMarketRentDifferentialCalculationPopoverWrapper({appraisal, children}: TotalMarketRentDifferentialCalculationPopoverWrapperProps)
{
    const [marketRentDifferentialPopoverOpen, setMarketRentDifferentialPopoverOpen] = React.useState(false);
    const popoverId = React.useRef(`market-rent-differential-popover-${instance++}`).current;

        return (
            <>
                <button type="button" className="btn btn-link p-0" id={popoverId} onClick={() => setMarketRentDifferentialPopoverOpen(open => !open)}>
                    {children}
                </button>,
                <Popover placement="bottom" isOpen={marketRentDifferentialPopoverOpen} target={popoverId}
                         toggle={() => setMarketRentDifferentialPopoverOpen(open => !open)}>
                    <PopoverHeader>Market Rent Differential</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            <tr>
                                <td>Discount Rate</td>
                                <td>
                                    <PercentFormat value={appraisal.stabilizedStatementInputs.marketRentDifferentialDiscountRate}/>
                                </td>
                            </tr>
                            {
                                appraisal.units!.filter((unit) => unit.calculatedMarketRentDifferential).map((unit, unitIndex) =>
                                {
                                    let underline = "";
                                    if (unitIndex === appraisal.units!.length - 1)
                                    {
                                        underline = `underline`;
                                    }

                                    return <tr key={unitIndex}>
                                        <td>Unit {unit.unitNumber}</td>
                                        <td className={underline}><CurrencyFormat value={unit.calculatedMarketRentDifferential}/></td>
                                    </tr>;
                                })
                            }
                            <tr className={"total-row"}>
                                <td>
                                    Total
                                </td>
                                <td>
                                    <CurrencyFormat value={appraisal.stabilizedStatement.marketRentDifferential}/>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            </>
        );
}

export default TotalMarketRentDifferentialCalculationPopoverWrapper;
