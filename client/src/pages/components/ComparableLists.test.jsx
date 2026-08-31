import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ComparableLeaseList from './ComparableLeaseList';
import ComparableSaleList from './ComparableSaleList';

vi.mock('./ComparableSaleListItem', () => ({
    default: ({comparableSale}) => <div data-testid={`sale-${comparableSale._id}`}>{comparableSale._id}</div>,
}));
vi.mock('./ComparableLeaseListItem', () => ({
    default: ({comparableLease}) => <div data-testid={`lease-${comparableLease._id}`}>{comparableLease._id}</div>,
}));
vi.mock('./ComparableSalesStatistics', () => ({
    default: ({comparableSales, stats}) => <output data-testid="sale-stats">{`${comparableSales.length}:${stats.join(',')}`}</output>,
}));
vi.mock('./ComparableLeasesStatistics', () => ({
    default: ({comparableLeases, stats}) => <output data-testid="lease-stats">{`${comparableLeases.length}:${stats.join(',')}`}</output>,
}));
vi.mock('./SortDirection', () => ({default: () => null}));
vi.mock('@api/hooks', () => ({
    useCreateComparableSale: () => ({mutateAsync: vi.fn()}),
    useCreateComparableLease: () => ({mutateAsync: vi.fn()}),
    useComparableLeasesByIds: () => ({data: undefined}),
}));

describe('comparable list containers', () => {
    it('renders selected sales, preserves exclusion, land columns, stats, and sort direction callbacks', async () => {
        const onSortChanged = vi.fn();
        render(<ComparableSaleList
            comparableSales={[{_id: 'sale-1'}, {_id: 'sale-2'}]}
            excludeIds={['sale-2']}
            search={{propertyType: 'land'}}
            sort="-saleDate"
            onSortChanged={onSortChanged}
            statsPosition="above"
        />);

        await waitFor(() => expect(screen.getByTestId('sale-sale-1')).toBeInTheDocument());
        expect(screen.queryByTestId('sale-sale-2')).not.toBeInTheDocument();
        expect(screen.getByRole('columnheader', {name: /Site Area \(acres\)/})).toBeInTheDocument();
        expect(screen.getByTestId('sale-stats')).toHaveTextContent('2:sizeOfLandAcres,floorSpaceIndex,pricePerSquareFootLand,pricePerSquareFootBuildableArea,pricePerAcreLand');

        fireEvent.click(screen.getByRole('button', {name: 'Date'}));
        expect(onSortChanged).toHaveBeenCalledWith('+saleDate');
    });

    it('renders the established empty-sale message and below-statistics position', async () => {
        render(<ComparableSaleList comparableSales={[]} noCompMessage="No selected sales" statsPosition="below" />);

        await waitFor(() => expect(screen.getByText('No selected sales')).toBeInTheDocument());
        expect(screen.getByTestId('sale-stats')).toBeInTheDocument();
    });

    it('renders selected leases, preserves exclusion and sort callbacks', async () => {
        const onSortChanged = vi.fn();
        render(<ComparableLeaseList
            comparableLeases={[{_id: 'lease-1'}, {_id: 'lease-2'}]}
            excludeIds={['lease-2']}
            sort="-leaseDate"
            onSortChanged={onSortChanged}
        />);

        await waitFor(() => expect(screen.getByTestId('lease-lease-1')).toBeInTheDocument());
        expect(screen.queryByTestId('lease-lease-2')).not.toBeInTheDocument();
        expect(screen.getByTestId('lease-stats')).toHaveTextContent('2:sizeOfUnit,startingYearlyRent,taxesMaintenanceInsurance');

        fireEvent.click(screen.getByRole('button', {name: 'Date'}));
        expect(onSortChanged).toHaveBeenCalledWith('+leaseDate');
    });

    it('renders the established empty-lease message and below-statistics position', async () => {
        render(<ComparableLeaseList comparableLeases={[]} noCompMessage="No selected leases" statsPosition="below" />);

        await waitFor(() => expect(screen.getByText('No selected leases')).toBeInTheDocument());
        expect(screen.getByTestId('lease-stats')).toBeInTheDocument();
    });
});
