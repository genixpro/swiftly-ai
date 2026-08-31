import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ViewComparableLeasesDatabase from './ViewComparableLeasesDatabase';

const query = vi.hoisted(() => ({useComparableLeases: vi.fn()}));

vi.mock('@api/hooks', () => query);
vi.mock('./components/ComparableLeaseSearch', () => ({
    default: ({onChange}: {onChange(search: Record<string, unknown>): void}) => <button onClick={() => onChange({propertyType: 'industrial'})}>Apply lease search</button>,
}));
vi.mock('./components/ComparableLeaseList', () => ({
    default: ({comparableLeases}: {comparableLeases: Array<{_id: string}>}) => <output data-testid="lease-results">{comparableLeases.map(lease => lease._id).join(',')}</output>,
}));
vi.mock('./components/ComparableLeasesMap', () => ({default: () => null}));

describe('comparable leases database query boundary', () => {
    it('keeps the initial list dormant and loads the existing search payload after a search interaction', async () => {
        const dormantQuery = {data: undefined};
        const loadedQuery = {data: [{_id: 'lease-1'}]};
        query.useComparableLeases.mockImplementation((filters: Record<string, unknown>, options: {enabled: boolean}) => (
            options.enabled ? loadedQuery : dormantQuery
        ));
        render(<ViewComparableLeasesDatabase
            appraisal={{_id: 'appraisal-1', propertyType: 'industrial', comparableLeases: []} as any}
            appraisalId="appraisal-1"
            updateAppraisal={vi.fn()}
        />);

        expect(query.useComparableLeases).toHaveBeenCalledWith({}, {enabled: false});
        fireEvent.click(screen.getByRole('button', {name: 'Apply lease search'}));

        await waitFor(() => expect(query.useComparableLeases).toHaveBeenLastCalledWith(
            {propertyType: 'industrial', sort: '-leaseDate'}, {enabled: true},
        ));
        expect(screen.getByTestId('lease-results')).toHaveTextContent('lease-1');
    });
});
