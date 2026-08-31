import {fireEvent, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {EditableAppraisal} from '../app/AppraisalWorkspace';
import {renderWithApp} from '../test/render';
import ViewAppraisalComparableLeases from './ViewAppraisalComparableLeases';

const comparableLeasesApi = vi.hoisted(() => ({getMany: vi.fn()}));

vi.mock('@api/resources', () => ({comparableLeasesApi}));
vi.mock('./components/ComparableLeasesMap', () => ({
    default: ({onAddComparableToAppraisal, onRemoveComparableFromAppraisal}: {
        onAddComparableToAppraisal: (lease: {_id: string}) => void;
        onRemoveComparableFromAppraisal: (lease: {_id: string}) => void;
    }) => <>
        <button onClick={() => onAddComparableToAppraisal({_id: 'lease-3'})}>Add lease</button>
        <button onClick={() => onRemoveComparableFromAppraisal({_id: 'lease-1'})}>Remove lease</button>
    </>,
}));
vi.mock('./components/ComparableLeaseList', () => ({
    default: ({comparableLeases, onSortChanged}: {
        comparableLeases: Array<{_id: string}>;
        onSortChanged: (sort: string) => void;
    }) => <>
        <output data-testid="lease-order">{comparableLeases.map((lease) => lease._id).join(',')}</output>
        <button onClick={() => onSortChanged('+leaseDate')}>Sort leases</button>
    </>,
}));

function appraisalFixture(ids = ['lease-2', 'lease-1']): EditableAppraisal {
    return {
        _id: 'appraisal-1',
        comparableLeases: ids,
    };
}

describe('ViewAppraisalComparableLeases', () => {
    beforeEach(() => {
        comparableLeasesApi.getMany.mockReset();
    });

    it('keeps selected-lease loading, sort order, and selection update payloads', async () => {
        comparableLeasesApi.getMany.mockResolvedValue([
            {_id: 'lease-2', leaseDate: '2023-01-01'},
            {_id: 'lease-1', leaseDate: '2024-01-01'},
        ]);
        const updateAppraisal = vi.fn();

        renderWithApp(<ViewAppraisalComparableLeases
            appraisal={appraisalFixture()}
            appraisalId="appraisal-1"
            updateAppraisal={updateAppraisal}
        />);

        await waitFor(() => expect(screen.getByTestId('lease-order')).toHaveTextContent('lease-1,lease-2'));
        expect(comparableLeasesApi.getMany).toHaveBeenCalledWith(['lease-2', 'lease-1']);

        fireEvent.click(screen.getByRole('button', {name: 'Sort leases'}));
        expect(screen.getByTestId('lease-order')).toHaveTextContent('lease-2,lease-1');

        fireEvent.click(screen.getByRole('button', {name: 'Add lease'}));
        expect(updateAppraisal).toHaveBeenLastCalledWith({comparableLeases: ['lease-2', 'lease-1', 'lease-3']});

        fireEvent.click(screen.getByRole('button', {name: 'Remove lease'}));
        expect(updateAppraisal).toHaveBeenLastCalledWith({comparableLeases: ['lease-2']});
        expect(screen.getByTestId('lease-order')).toHaveTextContent('lease-2');
    });

    it('retains the mount-only lease load when the selected ids later change', async () => {
        comparableLeasesApi.getMany.mockResolvedValue([]);
        const updateAppraisal = vi.fn();
        const {rerender} = renderWithApp(<ViewAppraisalComparableLeases
            appraisal={appraisalFixture(['lease-1'])}
            appraisalId="appraisal-1"
            updateAppraisal={updateAppraisal}
        />);

        await waitFor(() => expect(comparableLeasesApi.getMany).toHaveBeenCalledTimes(1));
        rerender(<ViewAppraisalComparableLeases
            appraisal={appraisalFixture(['lease-2'])}
            appraisalId="appraisal-1"
            updateAppraisal={updateAppraisal}
        />);
        expect(comparableLeasesApi.getMany).toHaveBeenCalledTimes(1);
    });
});
