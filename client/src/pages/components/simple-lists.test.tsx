import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import AppraisalList from './AppraisalList';
import ChecklistItem from './ChecklistItem';
import FinancialStatementList from './FinancialStatementList';
import LeaseList from './LeaseList';
import {AppraisalNavigationProvider} from '../../app/AppraisalNavigation';

describe('simple list components', () => {
    it('preserves appraisal columns and delegates row actions', () => {
        const navigate = vi.fn();
        const deleteAppraisal = vi.fn();
        render(<AppraisalNavigationProvider value={{
            appraisalType: null,
            hasActiveAppraisal: false,
            changeAppraisalType: vi.fn(),
            clearAppraisal: vi.fn(),
        }}><AppraisalList
                appraisals={[{_id: 'a', name: 'Harbour', address: '1 Bay'}]}
                navigate={navigate}
                deleteAppraisal={deleteAppraisal}
            /></AppraisalNavigationProvider>);
        expect(screen.getAllByRole('columnheader').map(cell => cell.textContent)).toEqual(['Name', 'Address', 'Actions']);
        expect(screen.getByText('Harbour')).toBeInTheDocument();
    });

    it('navigates lease and statement rows to their established routes', () => {
        const navigate = vi.fn();
        render(<>
            <LeaseList appraisalId="a" navigate={navigate} leases={[{
                _id: 'l', fileName: 'Lease.pdf', extractedData: {rent_per_square_foot: 12, size_square_feet: 1000, term: 5},
            }]} />
            <FinancialStatementList appraisalId="a" navigate={navigate} financialStatements={[{_id: 'f', fileName: 'Statement.pdf'}]} />
        </>);
        fireEvent.click(screen.getByText('Lease.pdf'));
        expect(navigate).toHaveBeenCalledWith('/appraisal/a/lease/l/summary');
        fireEvent.click(screen.getByText('Statement.pdf'));
        expect(navigate).toHaveBeenCalledWith('/appraisal/a/financial_statement/f/audit');
    });

    it('preserves checklist completion icons', () => {
        const view = render(<ChecklistItem completed title="Complete" />);
        expect(view.container.querySelector('.fa-check')).not.toBeNull();
        view.rerender(<ChecklistItem completed={false} title="Incomplete" />);
        expect(view.container.querySelector('.fa-times')).not.toBeNull();
    });
});
