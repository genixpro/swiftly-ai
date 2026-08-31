import React from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import FieldDisplayEdit from './FieldDisplayEdit';
import CurrencyFormat from './CurrencyFormat';
import PercentFormat from './PercentFormat';
import AreaFormat from './AreaFormat';
import {appraisalBuildingSize, currentTenancy} from '../../domain/appraisal';
import {incomeStatementItemLatestAmount, incomeStatementItemMachineName} from '../../domain/incomeStatement';
import type {IncomeStatementItemDTO} from '../../api/types';
import type {RecoveryStructure, RecoveryUnit} from '../recoveryStructureTypes';

function isLegacyNumber(value: unknown): value is number {
    return Object.prototype.toString.call(value) === '[object Number]';
}

interface RecoveryExpensePercentageEditorProps {
    appraisal: {units: RecoveryUnit[]};
    calculated: number | null | undefined;
    expense: IncomeStatementItemDTO;
    onChange(value: unknown): void;
    recovery: Pick<RecoveryStructure, 'name'>;
    value: unknown;
}

/** Expense-recovery row and its detailed calculation popover. */
export default function RecoveryExpensePercentageEditor(props: RecoveryExpensePercentageEditorProps) {
    const [popoverOpen, setPopoverOpen] = React.useState(false);
    const sizeOfBuilding = appraisalBuildingSize(props.appraisal);
    const machineName = incomeStatementItemMachineName(props.expense);
    const latestAmount = incomeStatementItemLatestAmount(props.expense);
    const popoverId = `expense-recovery-popover-${machineName.replace(/\W/g, '')}-${props.recovery.name.replace(/\W/g, '')}`;
    const percentage = isLegacyNumber(props.value) ? props.value : 100;

    return <>
        <td className="rule-percentage-column"><FieldDisplayEdit
            type="percent"
            placeholder="Expense %"
            value={percentage}
            hideInput={false}
            hideIcon
            onChange={props.onChange}
        /></td>
        <td className="rule-field-column"><span className="seperator">of</span><div className="expense-name">{props.expense.name}</div></td>
        <td className="rule-calculated-amount-column">
            <button type="button" className="btn btn-link p-0" id={popoverId} onClick={() => setPopoverOpen(!popoverOpen)}><CurrencyFormat value={props.calculated}/></button>
            <Popover placement="bottom" isOpen={popoverOpen} target={popoverId} toggle={() => setPopoverOpen(!popoverOpen)}>
                <PopoverHeader>Expense Recovery - {props.expense.name}</PopoverHeader>
                <PopoverBody><table className="explanation-popover-table"><tbody>
                    {props.appraisal.units.map((unit, unitIndex) => {
                        const tenancy = currentTenancy(unit)!;
                        if (tenancy?.recoveryStructure !== props.recovery.name || tenancy.rentType === 'gross') return undefined;
                        const className = unitIndex === props.appraisal.units.length - 1 ? 'underline' : '';
                        return <tr key={unitIndex}>
                            <td>Unit {unit.unitNumber} - {tenancy.name}</td>
                            <td><AreaFormat value={unit.squareFootage}/></td><td>/</td><td><AreaFormat value={sizeOfBuilding}/></td><td>=</td>
                            <td><PercentFormat value={unit.squareFootage / sizeOfBuilding * 100}/></td><td>*</td><td><PercentFormat value={percentage}/></td><td>*</td>
                            <td><CurrencyFormat value={latestAmount}/></td>
                            <td className={className}><CurrencyFormat value={(latestAmount as number) * (percentage / 100.0) * unit.squareFootage / sizeOfBuilding}/></td>
                        </tr>;
                    })}
                    <tr className="total-row"><td>Recovered Amount Under Structure</td><td/><td/><td/><td/><td/><td/><td/><td/><td/><td><CurrencyFormat value={props.calculated}/></td></tr>
                </tbody></table></PopoverBody>
            </Popover>
        </td>
    </>;
}
