import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AppraisalNavigationProvider} from '../app/AppraisalNavigation';
import ViewAllAppraisals from './ViewAllAppraisals';
import ViewFinancialStatement from './ViewFinancialStatement';
import ViewFinancialStatements from './ViewFinancialStatements';
import ViewLease from './ViewLease';
import ViewLeases from './ViewLeases';

const {mutateDelete, mutateFile} = vi.hoisted(() => ({mutateDelete: vi.fn(), mutateFile: vi.fn()}));

vi.mock('../api/hooks', () => ({
    useAppraisals: () => ({data: [{_id: 'a', name: 'Harbour', address: '1 Bay', appraisalType: 'detailed'}]}),
    useDeleteAppraisal: () => ({mutateAsync: mutateDelete}),
    useFiles: (_appraisalId: string, type?: string) => ({data: type === 'lease'
        ? [{_id: 'l', fileName: 'Lease.pdf', extractedData: {rent_per_square_foot: 20, size_square_feet: 1000, term: 5}}]
        : [{_id: 'f', fileName: 'Statement.pdf'}]}),
    useFile: (_appraisalId: string, fileId: string) => ({data: fileId === 'l'
        ? {_id: 'l', fileName: 'Lease.pdf', extractedData: {rent_per_square_foot: 20}, words: []}
        : {
            _id: 'f', fileName: 'Statement.pdf', words: [],
            extractedData: {
                income: [{lineNumber: 1, income_name: 'Rent', income_amount: '$1,000', include: true}],
                expense: [{lineNumber: 2, expense_name: 'Tax', expense_amount: '$200', include: true}],
                items: [{lineNumber: 1, income_name: 'Rent', income_amount: '$1,000', include: true}],
            },
        }}),
    useUpdateFile: () => ({mutateAsync: mutateFile}),
}));

beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
});

describe('migrated route pages', () => {
    it('lists, opens, and deletes appraisals through navigation and query mutations', () => {
        const navigate = vi.fn();
        const changeAppraisalType = vi.fn();
        render(<MemoryRouter><AppraisalNavigationProvider value={{
            appraisalType: null,
            hasActiveAppraisal: false,
            changeAppraisalType,
            clearAppraisal: vi.fn(),
        }}><ViewAllAppraisals navigate={navigate} /></AppraisalNavigationProvider></MemoryRouter>);
        fireEvent.click(screen.getByRole('button', {name: 'Open Harbour'}));
        expect(changeAppraisalType).toHaveBeenCalledWith('detailed');
        expect(navigate).toHaveBeenCalledWith('/appraisal/a/upload');
        fireEvent.click(screen.getByRole('button', {name: 'Delete Harbour'}));
        expect(mutateDelete).toHaveBeenCalledWith('a');
    });

    it('renders lease and statement collections without proxy model instances', () => {
        const navigate = vi.fn();
        const {rerender} = render(<ViewLeases appraisalId="a" navigate={navigate} />);
        expect(screen.getByText('Lease.pdf')).toBeInTheDocument();
        expect(screen.getByText('1000')).toBeInTheDocument();
        rerender(<ViewFinancialStatements appraisalId="a" navigate={navigate} />);
        expect(screen.getByText('Statement.pdf')).toBeInTheDocument();
    });

    it('renders an extracted lease report from typed file state', () => {
        render(<MemoryRouter initialEntries={['/report']}><ViewLease appraisalId="a" leaseId="l" /></MemoryRouter>);
        expect(screen.getByText('Property Description')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('renders statement audit totals and persists inclusion edits', async () => {
        render(<MemoryRouter initialEntries={['/audit']}><ViewFinancialStatement appraisalId="a" financialStatementId="f" /></MemoryRouter>);
        expect(await screen.findByText('Income')).toBeInTheDocument();
        expect(screen.getByText('$1,000')).toBeInTheDocument();
        fireEvent.click(screen.getAllByRole('checkbox')[0]);
        await waitFor(() => expect(mutateFile).toHaveBeenCalled());
        expect(mutateFile.mock.calls[0][0]).toHaveProperty('extractedData');
    });
});
