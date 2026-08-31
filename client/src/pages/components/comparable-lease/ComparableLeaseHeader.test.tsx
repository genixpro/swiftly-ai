import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {
    comparableLeaseHeaderConfigurations,
    ComparableLeaseListHeaderColumn,
    defaultComparableLeaseHeaderFields,
    defaultComparableLeaseStatsFields,
} from './ComparableLeaseHeader';

describe('comparable-lease header', () => {
    it('retains the established field and statistics ordering', () => {
        expect(defaultComparableLeaseHeaderFields).toEqual([
            ['leaseDate'], ['address'], ['sizeOfUnit'], ['rentEscalations'],
            ['taxesMaintenanceInsurance', 'tenantInducements', 'freeRentMonths'],
        ]);
        expect(defaultComparableLeaseStatsFields).toEqual(['sizeOfUnit', 'startingYearlyRent', 'taxesMaintenanceInsurance']);
        expect(comparableLeaseHeaderConfigurations.rentEscalations).toMatchObject({
            title: 'Rent ($)', size: 2, sortField: 'rentEscalations[0].yearlyRent',
        });
    });

    it('retains accessible sort direction and column-click semantics', () => {
        const changeSortColumn = vi.fn();
        render(<ComparableLeaseListHeaderColumn
            size={1}
            texts={['Date']}
            fields={['leaseDate']}
            sort="-leaseDate"
            sortField="leaseDate"
            changeSortColumn={changeSortColumn}
        />);

        expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'descending');
        fireEvent.click(screen.getByRole('button', {name: 'Date'}));
        expect(changeSortColumn).toHaveBeenCalledWith('leaseDate');
    });
});
