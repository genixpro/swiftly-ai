import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import {describe, expect, it} from 'vitest';

import UnitVacantUnitCalculationRows from './UnitVacantUnitCalculationRows';

describe('UnitVacantUnitCalculationRows', () => {
    it('retains detailed-appraisal labels, amounts, and leasing-cost links', () => {
        render(<MemoryRouter><table><tbody><UnitVacantUnitCalculationRows
            appraisal={{_id: 'appraisal-1', appraisalType: 'detailed'}}
            unit={{calculatedVacantUnitRentLoss: 100, calculatedVacantUnitLeasupCosts: 200}}
        /></tbody></table></MemoryRouter>);

        expect(screen.getByText('Calculated Vacant Unit Rent Loss').closest('a')).toHaveAttribute(
            'href', '/appraisal/appraisal-1/tenants/leasing_costs',
        );
        expect(screen.getByText('Calculated Vacant Unit Leaseup Costs')).toBeVisible();
        expect(screen.getByText('200.00')).toBeVisible();
    });

    it('keeps empty and zero vacant-unit calculations out of the table', () => {
        const {container} = render(<MemoryRouter><table><tbody><UnitVacantUnitCalculationRows
            appraisal={{_id: 'appraisal-1', appraisalType: 'detailed'}}
            unit={{calculatedVacantUnitRentLoss: 0, calculatedVacantUnitLeasupCosts: null}}
        /></tbody></table></MemoryRouter>);

        expect(container.querySelectorAll('.stats-row')).toHaveLength(0);
    });
});
