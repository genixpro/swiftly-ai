import type {PropsWithChildren} from 'react';
import {useState} from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import CurrencyFormat from './CurrencyFormat';
import PercentFormat from './PercentFormat';

let structuralAllowanceInstance = 0;

interface StructuralAllowanceAppraisal {
    stabilizedStatement: {potentialGrossIncome?: number; structuralAllowance?: number};
    stabilizedStatementInputs: {structuralAllowancePercent?: number};
}

export default function StructuralAllowanceCalculationPopoverWrapper({appraisal, children}: PropsWithChildren<{appraisal: StructuralAllowanceAppraisal}>) {
    const [popoverId] = useState(() => `structural-allowance-popover-${structuralAllowanceInstance++}`);
    const [open, setOpen] = useState(false);
    const toggle = () => setOpen(value => !value);
    return <>
        <button type="button" className="btn btn-link p-0" id={popoverId} onClick={toggle}>{children}</button>
        <Popover placement="bottom" isOpen={open} target={popoverId} toggle={toggle}>
            <PopoverHeader>Structural Allowance</PopoverHeader>
            <PopoverBody><table className="explanation-popover-table"><tbody>
                <tr><td>Potential Gross Income</td><td><CurrencyFormat value={appraisal.stabilizedStatement.potentialGrossIncome} /></td></tr>
                <tr><td /><td className="underline">* <PercentFormat value={appraisal.stabilizedStatementInputs.structuralAllowancePercent} /></td></tr>
                <tr><td>Structural Allowance</td><td><CurrencyFormat value={appraisal.stabilizedStatement.structuralAllowance} /></td></tr>
            </tbody></table></PopoverBody>
        </Popover>
    </>;
}
