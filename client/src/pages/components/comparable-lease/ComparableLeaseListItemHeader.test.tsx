import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {
    comparableLeaseListItemHeaderConfigurations,
    ComparableLeaseListItemHeaderColumn,
} from './ComparableLeaseListItemHeader';

describe('comparable-lease item header', () => {
    it('retains formatter sizes and the established rent-escalation labels', () => {
        const configuration = comparableLeaseListItemHeaderConfigurations.rentEscalations;
        render(<>{configuration.render([
            {startYear: 1, endYear: 3, yearlyRent: 25_000},
            {startYear: 4, yearlyRent: 30_000},
        ], {})}</>);

        expect(configuration.size).toBe(2);
        expect(comparableLeaseListItemHeaderConfigurations.freeRentMonths.size).toBe(3);
        expect(screen.getByText(/Yrs\. 1 - 3 @/)).toBeVisible();
        expect(screen.getByText(/Yr\. 4 @/)).toBeVisible();
    });

    it('retains no-data rendering and the multi-field header line break', () => {
        render(<ComparableLeaseListItemHeaderColumn
            size={3}
            fields={['taxesMaintenanceInsurance', 'tenantInducements']}
            renders={[
                comparableLeaseListItemHeaderConfigurations.taxesMaintenanceInsurance.render,
                comparableLeaseListItemHeaderConfigurations.tenantInducements.render,
            ]}
            comparableLease={{taxesMaintenanceInsurance: 15, tenantInducements: null}}
        />);

        expect(screen.getByText('TMI @')).toBeVisible();
        expect(screen.getByText('n/a')).toBeVisible();
        expect(document.querySelector('.header-field-column br')).toBeInTheDocument();
    });
});
