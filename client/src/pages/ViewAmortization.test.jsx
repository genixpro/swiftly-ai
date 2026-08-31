import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ViewAmortization from './ViewAmortization';

vi.mock('./components/AppraisalContentHeader', () => ({default: () => <div>Header</div>}));
vi.mock('./components/FieldDisplayEdit', () => ({
    default: ({onChange, placeholder}) => <button aria-label={placeholder} onClick={() => onChange('Edited value')}>{placeholder}</button>,
}));

describe('amortization workflow characterization', () => {
    it('creates an inline amortization item and saves the same appraisal', () => {
        const appraisal = {_id: 'appraisal-1', amortizationSchedule: {items: []}};
        const saveAppraisal = vi.fn();
        render(<ViewAmortization appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'name'}));

        expect(appraisal.amortizationSchedule.items).toEqual([expect.objectContaining({
            name: 'Edited value',
            amount: 0,
            interest: 3,
            discountRate: 8,
            periodMonths: 1,
            startDate: expect.any(Date),
        })]);
        expect(saveAppraisal).toHaveBeenCalledWith(appraisal);
    });

    it('removes an amortization item and saves the same appraisal', () => {
        const item = {name: 'Existing', amount: 1, interest: 3, discountRate: 8, startDate: new Date(), periodMonths: 1};
        const appraisal = {_id: 'appraisal-1', amortizationSchedule: {items: [item]}};
        const saveAppraisal = vi.fn();
        render(<ViewAmortization appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Delete Amortization Item'}));

        expect(appraisal.amortizationSchedule.items).toEqual([]);
        expect(saveAppraisal).toHaveBeenCalledWith(appraisal);
    });

    it('keeps all inline field edits immediate and saves the existing item', () => {
        const item = {name: 'Existing', amount: 1, interest: 3, discountRate: 8, startDate: new Date(), periodMonths: 1};
        const appraisal = {_id: 'appraisal-1', amortizationSchedule: {items: [item]}};
        const saveAppraisal = vi.fn();
        render(<ViewAmortization appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        for (const label of ['name', 'Amount', 'Interest', 'Discount Rate', 'Start Date', 'Period (months)']) {
            fireEvent.click(screen.getAllByRole('button', {name: label})[0]);
        }

        expect(item).toMatchObject({
            name: 'Edited value', amount: 'Edited value', interest: 'Edited value', discountRate: 'Edited value',
            startDate: 'Edited value', periodMonths: 'Edited value',
        });
        expect(saveAppraisal).toHaveBeenCalledTimes(6);
        expect(saveAppraisal).toHaveBeenLastCalledWith(appraisal);
    });

    it('retains the legacy once-only guard for repeated edits to a rendered field', () => {
        const item = {name: 'Existing', amount: 1, interest: 3, discountRate: 8, startDate: new Date(), periodMonths: 1};
        const appraisal = {_id: 'appraisal-1', amortizationSchedule: {items: [item]}};
        const saveAppraisal = vi.fn();
        render(<ViewAmortization appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        const amount = screen.getAllByRole('button', {name: 'Amount'})[0];
        fireEvent.click(amount);
        fireEvent.click(amount);

        expect(item.amount).toBe('Edited value');
        expect(saveAppraisal).toHaveBeenCalledOnce();
    });
});
