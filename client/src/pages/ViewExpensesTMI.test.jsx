import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import ViewExpensesTMI from './ViewExpensesTMI';

const comparableLeasesQuery = vi.hoisted(() => ({useComparableLeasesByIds: vi.fn()}));
vi.mock('@api/hooks', () => comparableLeasesQuery);
vi.mock('./components/AppraisalContentHeader', () => ({default: () => <div>Header</div>}));
vi.mock('./components/ComparableLeaseList', () => ({default: () => <div>Comparable leases</div>}));
vi.mock('./components/FieldDisplayEdit', () => ({
    default: ({onChange, placeholder}) => <button aria-label={placeholder} onClick={() => onChange(15)}>{placeholder}</button>,
}));

describe('TMI expenses workflow characterization', () => {
    beforeEach(() => comparableLeasesQuery.useComparableLeasesByIds.mockReturnValue({data: []}));

    it('saves the TMI input and keeps the line-item mode route action', () => {
        const appraisal = {
            _id: 'appraisal-1', comparableLeases: [],
            stabilizedStatementInputs: {tmiRatePSF: 10, expensesMode: 'tmi'},
        };
        const saveAppraisal = vi.fn();
        const navigate = vi.fn();
        render(<ViewExpensesTMI appraisal={appraisal} saveAppraisal={saveAppraisal} navigate={navigate}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Amount (psf)'}));
        expect(appraisal.stabilizedStatementInputs.tmiRatePSF).toBe(15);
        expect(saveAppraisal).toHaveBeenCalledWith(appraisal);

        fireEvent.click(screen.getByRole('button', {name: /Set expenses based on line-items/}));
        expect(appraisal.stabilizedStatementInputs.expensesMode).toBe('income_statement');
        expect(navigate).toHaveBeenCalledWith('/appraisal/appraisal-1/expenses');
    });
});
