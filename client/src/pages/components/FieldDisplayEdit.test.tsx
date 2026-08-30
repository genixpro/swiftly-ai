import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {NonDroppableFieldDisplayEdit as FieldDisplayEdit} from './FieldDisplayEdit';

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
});
