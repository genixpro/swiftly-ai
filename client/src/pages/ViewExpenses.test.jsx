import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ViewExpenses from './ViewExpenses';

vi.mock('./components/AppraisalContentHeader', () => ({default: () => <div>Header</div>}));
vi.mock('./components/IncomeStatementEditor', () => ({default: () => <div>Income statement editor</div>}));

function appraisalFixture(expensesMode = 'income_statement', hasExpenses = false) {
    return {
        _id: 'appraisal-1',
        stabilizedStatementInputs: {expensesMode},
        validationResult: {hasExpenses},
    };
}

describe('expenses workflow characterization', () => {
    it('redirects to TMI only on its initial TMI mode', () => {
        const navigate = vi.fn();
        render(<ViewExpenses appraisal={appraisalFixture('tmi')} navigate={navigate} saveAppraisal={vi.fn()}/>);
        expect(navigate).toHaveBeenCalledWith('/appraisal/appraisal-1/expenses_tmi');
    });

    it('switches a missing-expense appraisal to TMI and saves before navigating', () => {
        const appraisal = appraisalFixture();
        const navigate = vi.fn();
        const saveAppraisal = vi.fn();
        render(<ViewExpenses appraisal={appraisal} navigate={navigate} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Set Expenses Based on TMI'}));
        expect(appraisal.stabilizedStatementInputs.expensesMode).toBe('tmi');
        expect(saveAppraisal).toHaveBeenCalledWith(appraisal);
        expect(navigate).toHaveBeenCalledWith('/appraisal/appraisal-1/expenses_tmi');
    });
});
