import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ViewDiscountedCashFlow from './ViewDiscountedCashFlow';

vi.mock('./components/AppraisalContentHeader', () => ({default: () => <div>Header</div>}));
vi.mock('./components/FieldDisplayEdit', () => ({
    default: ({onChange, value}) => <button onClick={() => onChange('edited')}>{String(value)}</button>,
}));

function appraisalFixture() {
    const row = (name, value) => ({name, amounts: {2025: value}});
    return {
        discountedCashFlowInputs: {inflation: 2, discountRate: 8},
        discountedCashFlow: {cashFlowSummary: {
            years: [2025],
            incomes: [row('Rent', 100)],
            expenses: [row('Taxes', -20)],
            incomeTotal: row('Income Total', 100),
            expenseTotal: row('Expense Total', -20),
            netOperatingIncome: row('NOI', 80),
            presentValue: row('Present Value', 70),
        }},
    };
}

describe('discounted cash-flow workflow characterization', () => {
    it('keeps the DCF rows and immediately saves edited inputs', () => {
        const appraisal = appraisalFixture();
        const saveAppraisal = vi.fn();
        render(<ViewDiscountedCashFlow appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        expect(screen.getByRole('columnheader', {name: '2025'})).toBeVisible();
        expect(screen.getByText('Present Value')).toBeVisible();

        fireEvent.click(screen.getByRole('button', {name: '2'}));
        expect(appraisal.discountedCashFlowInputs.inflation).toBe('edited');
        expect(saveAppraisal).toHaveBeenCalledWith(appraisal);
    });
});
