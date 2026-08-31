import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import DroppableFieldDisplayEdit, {NonDroppableFieldDisplayEdit as FieldDisplayEdit} from './FieldDisplayEdit';

const dnd = vi.hoisted(() => ({useDroppable: vi.fn()}));
vi.mock('@dnd-kit/core', () => ({useDroppable: dnd.useDroppable}));

beforeEach(() => {
    dnd.useDroppable.mockReset().mockReturnValue({isOver: false, setNodeRef: vi.fn()});
});

describe('FieldDisplayEdit characterization', () => {
    it('preserves formatted display, immediate focus editing, blur cleaning, and single update delivery', async () => {
        const onChange = vi.fn();
        render(<label>Amount<FieldDisplayEdit type="currency" value={12.5} onChange={onChange} /></label>);
        const input = screen.getByRole('textbox', {name: 'Amount'});
        expect(input).toHaveValue('$12.50');
        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: '($20.25)'}});
        fireEvent.blur(input);
        await waitFor(() => expect(onChange).toHaveBeenCalledWith(-20.25));
        expect(onChange).toHaveBeenCalledOnce();
    });

    it('commits text edits on Enter and restores the non-editing value', async () => {
        const onChange = vi.fn();
        render(<FieldDisplayEdit type="text" ariaLabel="Client" value="Before" onChange={onChange} />);
        const input = screen.getByRole('textbox', {name: 'Client'});
        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: 'After'}});
        fireEvent.keyPress(input, {key: 'Enter', charCode: 13});
        await waitFor(() => expect(onChange).toHaveBeenCalledWith('After'));
    });

    it('keeps multiline blur editing and empty-number clearing behavior', async () => {
        const onNotesChange = vi.fn();
        const onAmountChange = vi.fn();
        render(<>
            <FieldDisplayEdit type="textbox" ariaLabel="Notes" value="Existing note" onChange={onNotesChange} />
            <FieldDisplayEdit type="number" ariaLabel="Unit count" value={12} onChange={onAmountChange} />
        </>);

        const notes = screen.getByRole('textbox', {name: 'Notes'});
        expect(notes).toHaveAttribute('rows', '1');
        fireEvent.focus(notes);
        fireEvent.change(notes, {target: {value: 'Updated\nnote'}});
        fireEvent.blur(notes);
        const amount = screen.getByRole('textbox', {name: 'Unit count'});
        fireEvent.focus(amount);
        fireEvent.change(amount, {target: {value: ''}});
        fireEvent.blur(amount);

        await waitFor(() => expect(onNotesChange).toHaveBeenCalledWith('Updated\nnote'));
        await waitFor(() => expect(onAmountChange).toHaveBeenCalledWith(null));
    });

    it('commits selected and cleared dates through the existing Date envelope', async () => {
        const onChange = vi.fn();
        render(<FieldDisplayEdit type="date" ariaLabel="Lease start" value="2024-01-02T00:00:00.000Z" onChange={onChange} />);
        const input = screen.getByLabelText('Lease start');

        expect(input).toHaveValue('2024-01-02');
        fireEvent.change(input, {target: {value: '2024-03-04'}});
        await waitFor(() => expect(onChange).toHaveBeenCalledWith(new Date('2024-03-04T00:00:00.000Z')));

        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: ''}});
        await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(null));
    });

    it('derives the current visual field label only when no explicit label is supplied', async () => {
        render(<div className="form-group"><strong>Stabilized rent:</strong><FieldDisplayEdit type="currency" value={25} onChange={vi.fn()} /></div>);
        await waitFor(() => expect(screen.getByRole('textbox', {name: 'Stabilized rent'})).toHaveValue('$25.00'));
    });

    it.each([
        ['propertyType', 'office', 'retail', {}],
        ['rentType', 'net', 'gross', {}],
        ['incomeItemType', 'rental_income', 'additional_income', {cashFlowType: 'income'}],
        ['adjustmentType', 'percentage', 'amount', {}],
        ['managementExpenseMode', 'income_statement', 'rule', {}],
        ['managementRecoveryMode', 'none', 'custom', {}],
        ['directComparisonMetric', 'psf', 'noi_multiple', {}],
        ['leasingCommissionMode', 'psf', 'percent_of_rent', {}],
        ['tenancyType', 'single_tenant', 'vacant', {}],
        ['marketRent', 'Office', 'Retail', {marketRents: [{name: 'Office', amountPSF: 20}, {name: 'Retail', amountPSF: 30}]}],
        ['recoveryStructure', 'Standard', 'Net', {recoveryStructures: [{name: 'Standard'}, {name: 'Net'}]}],
        ['leasingCostStructure', 'Default', 'Custom', {leasingCostStructures: [{name: 'Default'}, {name: 'Custom'}]}],
        ['calculationField', 'operatingExpenses', 'taxes', {expenses: []}],
    ])('preserves %s selection and commit timing', async (type, initial, next, extra) => {
        const onChange = vi.fn();
        render(<FieldDisplayEdit type={type} ariaLabel={`${type} field`} value={initial} onChange={onChange} {...extra} />);
        fireEvent.change(screen.getByRole('combobox', {name: `${type} field`}), {target: {value: next}});
        await waitFor(() => expect(onChange).toHaveBeenCalledWith(next));
    });

    it('preserves boolean inversion and disabled behavior', async () => {
        const onChange = vi.fn();
        const {rerender} = render(<FieldDisplayEdit type="boolean" ariaLabel="Vacant" value={false} onChange={onChange} />);
        fireEvent.click(screen.getByRole('checkbox', {name: 'Vacant'}));
        await waitFor(() => expect(onChange).toHaveBeenCalledWith(true));
        rerender(<FieldDisplayEdit type="boolean" ariaLabel="Vacant" value edit={false} onChange={onChange} />);
        expect(screen.getByRole('checkbox', {name: 'Vacant'})).toBeDisabled();
    });

    it('keeps document-word drops limited to legacy editable number fields and forwards the source index', () => {
        const onChange = vi.fn();
        render(<DroppableFieldDisplayEdit id="subject-noi" type="currency" value={0} onChange={onChange}/>);

        const droppableConfig = dnd.useDroppable.mock.calls.at(-1)?.[0];
        expect(droppableConfig.id).toBe('subject-noi');
        droppableConfig.data.onDrop({type: 'Word', word: {index: 4, word: '($12.50)'}});

        expect(onChange).toHaveBeenCalledWith(-12.5, [4]);
    });
});
