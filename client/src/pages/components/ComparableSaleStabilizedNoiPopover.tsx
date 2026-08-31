import {Button, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import {NonDroppableFieldDisplayEdit} from './FieldDisplayEdit';
import CurrencyFormat from './CurrencyFormat';
import type {ComparableSaleCardRecord} from '../../domain/comparableSaleCard';

interface ComparableSaleStabilizedNoiPopoverProps {
    comparableSale: ComparableSaleCardRecord;
    editable: boolean;
    popoverId: string;
    open: boolean;
    onToggle: () => void;
    onChange: (field: string, value: unknown) => void;
}

/** The existing stabilized-NOI calculator UI; mutation remains in its parent. */
export default function ComparableSaleStabilizedNoiPopover({
    comparableSale,
    editable,
    popoverId,
    open,
    onToggle,
    onChange,
}: ComparableSaleStabilizedNoiPopoverProps) {
    if (!editable) return null;

    return <div className={"stabilize-noi-button-container"}>
        <Button color={'secondary'} id={`stabilize-noi-button-${popoverId}`} onClick={onToggle}>Stabilize NOI</Button>
        <Popover placement="bottom" isOpen={open} target={`stabilize-noi-button-${popoverId}`} toggle={onToggle} className={"stabilized-noi-popover"}>
            <PopoverHeader>Stabilize NOI</PopoverHeader>
            <PopoverBody>
                <table><tbody>
                    <tr><td>Net Operating Income</td><td></td><td className={"result-column"}><CurrencyFormat value={comparableSale.netOperatingIncome}/></td></tr>
                    <tr>
                        <td>Vacancy Rate</td>
                        <td><NonDroppableFieldDisplayEdit type={"percent"} edit={editable} placeholder={"Vacancy Rate"} value={comparableSale.stabilizedNoiVacancyRate} onChange={(value) => onChange('stabilizedNoiVacancyRate', value)}/></td>
                        <td className={"result-column"}><CurrencyFormat value={-comparableSale.stabilizedNOIVacancyDeduction!}/></td>
                    </tr>
                    <tr>
                        <td>Structural Allowance</td>
                        <td><NonDroppableFieldDisplayEdit type={"percent"} edit={editable} placeholder={"Structural Allowance"} value={comparableSale.stabilizedNoiStructuralAllowance} onChange={(value) => onChange('stabilizedNoiStructuralAllowance', value)}/></td>
                        <td className={"result-column"}><CurrencyFormat value={-comparableSale.stabilizedNOIStructuralAllowance!}/></td>
                    </tr>
                    <tr className={"stabilized-noi-custom-line"}>
                        <td><NonDroppableFieldDisplayEdit type={"text"} edit={editable} placeholder={"Custom Deduction"} value={comparableSale.stabilizedNoiCustomName} onChange={(value) => onChange('stabilizedNoiCustomName', value)}/></td>
                        <td><NonDroppableFieldDisplayEdit type={"percent"} edit={editable} placeholder={"Custom Deduction %"} value={comparableSale.stabilizedNoiCustomDeduction} onChange={(value) => onChange('stabilizedNoiCustomDeduction', value)}/></td>
                        <td className={"result-column"}><CurrencyFormat value={-comparableSale.stabilizedNOICustomDeduction!}/></td>
                    </tr>
                    <tr className={"stabilized-noi-result-line"}><td>Stabilized NOI</td><td></td><td className={"result-column"}><CurrencyFormat value={comparableSale.stabilizedNOI}/></td></tr>
                    <tr>
                        <td>Use Stabilized NOI?</td>
                        <td><NonDroppableFieldDisplayEdit type={"boolean"} edit={editable} hideIcon={true} placeholder={"Use Stabilized NOI"} value={comparableSale.useStabilizedNoi} onChange={(value) => onChange('useStabilizedNoi', value)}/></td>
                        <td className={"result-column"}></td>
                    </tr>
                </tbody></table>
            </PopoverBody>
        </Popover>
    </div>;
}
