import React from 'react';
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import FieldDisplayEdit from './FieldDisplayEdit';
import CurrencyFormat from './CurrencyFormat';
import {currentTenancy, unitCalculatedTotalRecovery} from '../../domain/appraisal';
import {isDefaultRecoveryStructure} from '../../domain/recoveryStructures';
import type {RecoveryStructure, RecoveryUnit} from '../recoveryStructureTypes';
import type {UnitDTO} from '../../api/types';

interface RecoveryTenantApplicableEditorProps {
    onChange(): void;
    recovery: RecoveryStructure;
    unit: RecoveryUnit;
}

/** Preserves the recovery editor's tenancy assignment cells and calculation popover. */
export default function RecoveryTenantApplicableEditor({onChange, recovery, unit}: RecoveryTenantApplicableEditorProps) {
    const [popoverOpen, setPopoverOpen] = React.useState(false);
    const tenancy = currentTenancy(unit as unknown as UnitDTO)!;
    const popoverId = `tenancy-recovery-popover-${tenancy.name!.replace(/\W/g, '')}-${recovery.name.replace(/\W/g, '')}`;

    return [<td className="rule-percentage-column" key={1}>Unit {unit.unitNumber} - {tenancy.name}</td>,
        <td className="rule-field-column" key={2}><FieldDisplayEdit
            type="boolean"
            hideIcon
            edit={!isDefaultRecoveryStructure(recovery)}
            value={tenancy.recoveryStructure === recovery.name}
            onChange={onChange}
            placeholder="Does recovery structure apply to this tenancy"
        /></td>,
        <td className="rule-calculated-amount-column" key={3}>
            {tenancy.rentType === 'gross' ? <span>Gross Rent</span> : [
                <button type="button" className="btn btn-link p-0" id={popoverId} onClick={() => setPopoverOpen(!popoverOpen)} key={1}>
                    {tenancy.recoveryStructure === recovery.name ? <CurrencyFormat value={unitCalculatedTotalRecovery(unit as never)}/> : null}
                </button>,
                <Popover key={1} placement="bottom" isOpen={popoverOpen} target={popoverId} toggle={() => setPopoverOpen(!popoverOpen)}>
                    <PopoverHeader>Unit {unit.unitNumber} - Tenant Recovery - {tenancy.name}</PopoverHeader>
                    <PopoverBody><table className="explanation-popover-table">
                        <tbody><tr><td>Operating Expense Recovery</td><td><CurrencyFormat value={unit.calculatedExpenseRecovery}/></td></tr>
                        <tr><td>Management Recovery</td><td><CurrencyFormat value={unit.calculatedManagementRecovery}/></td></tr>
                        <tr><td>Tax Recovery</td><td className="underline"><CurrencyFormat value={unit.calculatedTaxRecovery}/></td></tr>
                        <tr className="total-row"><td>Recovered Amount Under Structure</td><td><CurrencyFormat value={unitCalculatedTotalRecovery(unit as never)}/></td></tr></tbody>
                    </table></PopoverBody>
                </Popover>,
            ]}
        </td>];
}
