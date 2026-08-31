import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {createComparableLeaseDraft} from '../../domain/comparableLeaseDraft';
import ComparableLeaseListItem from './ComparableLeaseListItem';

const apiSpies = vi.hoisted(() => ({update: vi.fn(), remove: vi.fn()}));

vi.mock('@api/resources', () => ({comparableLeasesApi: {}}));
vi.mock('@api/hooks', () => ({
    useUpdateComparableLease: () => ({mutate: ({id, payload}) => apiSpies.update(id, payload)}),
    useDeleteComparableLease: () => ({mutate: (id) => apiSpies.remove(id)}),
}));

vi.mock('./FieldDisplayEdit', () => ({
    default: ({placeholder = 'field', onChange}) => <button aria-label={placeholder} onClick={() => onChange?.('Edited value')}>Field</button>,
}));
vi.mock('./UploadableImageSet', () => ({default: () => <div>Images</div>}));
vi.mock('./CurrencyFormat', () => ({default: ({value}) => <span>{value}</span>}));
vi.mock('./IntegerFormat', () => ({default: ({value}) => <span>{value}</span>}));
vi.mock('./AreaFormat', () => ({default: ({value}) => <span>{value}</span>}));
vi.mock('./PercentFormat', () => ({default: ({value}) => <span>{value}</span>}));

function leaseFixture() {
    return createComparableLeaseDraft({
        _id: 'lease-1',
        address: '10 Main Street, Toronto, ON',
        leaseDate: '2024-01-01',
        propertyType: 'office',
        rentEscalations: [{startYear: 1, endYear: 3, yearlyRent: 25_000}],
    }).values;
}

describe('ComparableLeaseListItem', () => {
    afterEach(() => {
        apiSpies.update.mockClear();
        apiSpies.remove.mockClear();
    });

    it('keeps a persisted comparable collapsed initially and toggles its accessible details region', () => {
        render(<ComparableLeaseListItem
            comparableLease={leaseFixture()}
            appraisal={{location: null}}
            headers={[["leaseDate"], ["address"], ["rentEscalations"]]}
            edit={false}
        />);

        const expand = screen.getByRole('button', {name: /10 Main Street/});
        expect(expand).toHaveAttribute('aria-expanded', 'false');
        expect(expand).toHaveAttribute('aria-controls', 'comparable-lease-details-lease-1');

        fireEvent.click(expand);
        expect(expand).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('Images')).toBeInTheDocument();
        expect(screen.getByText('Remarks:')).toBeInTheDocument();
    });

    it('keeps the lease-selection button and callback semantics', () => {
        const onAddComparableClicked = vi.fn();
        const lease = leaseFixture();
        render(<ComparableLeaseListItem
            comparableLease={lease}
            appraisal={{location: null}}
            appraisalComparables={[]}
            headers={[["leaseDate"]]}
            edit={false}
            onAddComparableClicked={onAddComparableClicked}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Add comparable lease to appraisal'}));
        expect(onAddComparableClicked).toHaveBeenCalledWith(lease);
    });

    it('keeps immediate field editing, parent delivery, and persisted update timing', () => {
        const onChange = vi.fn();
        const lease = leaseFixture();
        render(<ComparableLeaseListItem
            comparableLease={lease}
            appraisal={{location: null}}
            headers={[["leaseDate"]]}
            onChange={onChange}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Remarks'}));

        expect(lease.remarks).toBe('Edited value');
        expect(lease.rentType).toBe('net');
        expect(onChange).toHaveBeenCalledWith(lease);
        expect(apiSpies.update).toHaveBeenCalledWith('lease-1', lease);
    });

    it('keeps rent-escalation additions immediate while retaining the compatibility source object', () => {
        const onChange = vi.fn();
        const lease = leaseFixture();
        render(<ComparableLeaseListItem
            comparableLease={lease}
            appraisal={{location: null}}
            headers={[["leaseDate"]]}
            onChange={onChange}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Add rent escalation'}));

        expect(lease.rentEscalations).toHaveLength(2);
        expect(lease.rentEscalations[1]).toMatchObject({yearlyRent: 0});
        expect(onChange).toHaveBeenCalledWith(lease);
        expect(apiSpies.update).toHaveBeenCalledWith('lease-1', lease);
    });

    it('keeps the industrial shipping-door fields and their immediate save path', () => {
        const lease = {
            ...leaseFixture(),
            propertyType: 'industrial',
            shippingDoorsDoubleMan: 1,
            shippingDoorsDriveIn: 2,
            shippingDoorsTruckLevel: 3,
        };
        render(<ComparableLeaseListItem
            comparableLease={lease}
            appraisal={{location: null}}
            headers={[["leaseDate"]]}
            onChange={vi.fn()}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Shipping Doors Drive In'}));

        expect(lease.shippingDoorsDriveIn).toBe('Edited value');
        expect(apiSpies.update).toHaveBeenCalledWith('lease-1', lease);
    });

    it('keeps delete confirmation, parent notification, and persisted deletion in the established order', () => {
        const onDeleteComparable = vi.fn();
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const lease = leaseFixture();
        render(<ComparableLeaseListItem
            comparableLease={lease}
            appraisal={{location: null}}
            appraisalComparables={[]}
            headers={[["leaseDate"]]}
            edit={false}
            onAddComparableClicked={vi.fn()}
            onDeleteComparable={onDeleteComparable}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Delete comparable lease'}));

        expect(confirm).toHaveBeenCalledWith('Are you sure you want to delete the comparable?');
        expect(onDeleteComparable).toHaveBeenCalledWith(lease);
        expect(apiSpies.remove).toHaveBeenCalledWith('lease-1');
        confirm.mockRestore();
    });
});
