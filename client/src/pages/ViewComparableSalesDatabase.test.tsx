import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ViewComparableSalesDatabase from './ViewComparableSalesDatabase';

const query = vi.hoisted(() => ({
    importComparableSales: {mutateAsync: vi.fn()},
    useComparableSales: vi.fn(),
    useImportComparableSales: vi.fn(),
}));

vi.mock('@api/hooks', () => query);
vi.mock('./components/ComparableSaleSearch', () => ({
    default: ({onChange}: {onChange(search: Record<string, unknown>): void}) => <button onClick={() => onChange({propertyType: 'office'})}>Apply sale search</button>,
}));
vi.mock('./components/ComparableSaleList', () => ({
    default: ({comparableSales}: {comparableSales: Array<{_id: string}>}) => <output data-testid="sale-results">{comparableSales.map(sale => sale._id).join(',')}</output>,
}));
vi.mock('./components/ComparableSalesMap', () => ({default: () => null}));
vi.mock('./components/ComparableConfirmationDialog', () => ({default: () => null}));
vi.mock('./components/Toolbar', () => ({default: ({children}: {children: React.ReactNode}) => <>{children}</>}));

describe('comparable sales database query boundary', () => {
    it('keeps the initial list dormant and loads the existing search payload after a search interaction', async () => {
        query.useImportComparableSales.mockReturnValue(query.importComparableSales);
        const dormantQuery = {data: undefined};
        const loadedQuery = {data: [{_id: 'sale-1'}]};
        query.useComparableSales.mockImplementation((filters: Record<string, unknown>, options: {enabled: boolean}) => (
            options.enabled ? loadedQuery : dormantQuery
        ));
        render(<ViewComparableSalesDatabase
            appraisal={{_id: 'appraisal-1', propertyType: 'office', comparableSalesCapRate: [], comparableSalesDCA: []} as any}
            appraisalId="appraisal-1"
            updateAppraisal={vi.fn()}
        />);

        expect(query.useComparableSales).toHaveBeenCalledWith({}, {enabled: false});
        fireEvent.click(screen.getByRole('button', {name: 'Apply sale search'}));

        await waitFor(() => expect(query.useComparableSales).toHaveBeenLastCalledWith(
            {propertyType: 'office', sort: '-saleDate'}, {enabled: true},
        ));
        expect(screen.getByTestId('sale-results')).toHaveTextContent('sale-1');
    });
});
