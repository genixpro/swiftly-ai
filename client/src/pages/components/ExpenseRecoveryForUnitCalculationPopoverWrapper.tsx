import React from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import PercentFormat from "./PercentFormat";
import CurrencyFormat from "./CurrencyFormat";
import AreaFormat from "./AreaFormat";
import {appraisalBuildingSize} from '../../domain/appraisal';
import {incomeStatementItemLatestAmount, incomeStatementItemMachineName} from '../../domain/incomeStatement';
import {findRecoveryStructure} from '../../domain/recoveryStructures';
import type {UnitCalculationValues} from './unitCalculationTypes';
import type {RecoveryCalculationAppraisal} from './recoveryCalculationTypes';

let instance = 0;

interface ExpenseRecoveryForUnitCalculationPopoverWrapperProps {
    appraisal?: RecoveryCalculationAppraisal | null;
    unit: UnitCalculationValues;
    incomeStatementItemType: string;
    children?: React.ReactNode;
}

function ExpenseRecoveryForUnitCalculationPopoverWrapper({appraisal, unit, incomeStatementItemType, children}: ExpenseRecoveryForUnitCalculationPopoverWrapperProps)
{
        const [popoverOpen, setPopoverOpen] = React.useState(false);
        const popoverId = React.useRef(`expense-recovery-for-unit-${incomeStatementItemType}-calculation-popover-${instance++}`).current;

        if (!appraisal)
        {
            return null;
        }

        const sizeOfBuilding = appraisalBuildingSize(appraisal as {units: UnitCalculationValues[] | null | undefined});
        const expenses = appraisal.expenseStatement!.items!.filter((expense) => expense.incomeStatementItemType === incomeStatementItemType);
        const recoveryStructure = findRecoveryStructure(appraisal, unit)!;

        let calculated: number | null | undefined;

        let recoveries: Record<string, number>;

        if (incomeStatementItemType === 'operating_expense')
        {
            calculated = unit.calculatedExpenseRecovery;
            recoveries = recoveryStructure.expenseRecoveries!;
        }
        else if (incomeStatementItemType === 'management_expense')
        {
            calculated = unit.calculatedManagementRecovery;
            recoveries = recoveryStructure.managementRecoveries!;
        }
        else if (incomeStatementItemType === 'tax_expense')
        {
            calculated = unit.calculatedTaxRecovery;
            recoveries = recoveryStructure.taxRecoveries!;
        }

        return (
            [<button type="button" className="btn btn-link p-0" id={popoverId} onClick={() => setPopoverOpen(!popoverOpen)}>
                {children}
            </button>,
                <Popover placement="bottom" isOpen={popoverOpen} target={popoverId}
                         toggle={() => setPopoverOpen(!popoverOpen)}>
                    <PopoverHeader>Expense Recoveries</PopoverHeader>
                    <PopoverBody>
                        <table className={"explanation-popover-table"}>
                            <tbody>
                            {
                                expenses.map((expense, expenseIndex) =>
                                {
                                    let className = "";

                                    if (expenseIndex === appraisal.units!.length - 1)
                                    {
                                        className = "underline";
                                    }

                                    const machineName = incomeStatementItemMachineName(expense);
                                    const latestAmount = incomeStatementItemLatestAmount(expense) as number;
                                    const value = recoveries[machineName];
                                    const percentage = typeof value === 'number' ? value : 100;

                                    return <tr key={expenseIndex}>
                                        <td>{expense.name}</td>
                                        <td>
                                            <AreaFormat value={unit.squareFootage}/>
                                        </td>
                                        <td>
                                            /
                                        </td>
                                        <td>
                                            <AreaFormat value={sizeOfBuilding}/>
                                        </td>
                                        <td>
                                            =
                                        </td>
                                        <td>
                                            <PercentFormat value={unit.squareFootage! / sizeOfBuilding * 100}/>
                                        </td>
                                        <td>
                                            *
                                        </td>
                                        <td>
                                            <PercentFormat value={percentage}/>
                                        </td>
                                        <td>
                                            *
                                        </td>
                                        <td>
                                            <CurrencyFormat value={latestAmount}/>
                                        </td>
                                        <td className={className}>
                                            <CurrencyFormat
                                                value={latestAmount * (percentage / 100.0) * unit.squareFootage! / sizeOfBuilding}/>
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
                                <td><CurrencyFormat value={calculated}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </PopoverBody>
                </Popover>
            ]
        );
}

export default ExpenseRecoveryForUnitCalculationPopoverWrapper;
