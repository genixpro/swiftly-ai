import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import LeasingCostsForUnitCalculationPopoverWrapper from './LeasingCostsForUnitCalculationPopoverWrapper';

describe('LeasingCostsForUnitCalculationPopoverWrapper', () => {
    it("keeps the unit's percent-of-rent rows and total leasing costs", () => {
        render(<LeasingCostsForUnitCalculationPopoverWrapper
            appraisal={{
                marketRents: [{name: 'Market', amountPSF: 20}],
                leasingCosts: [{name: 'Standard',
                    tenantInducementsPSF: 1,
                    leasingCommissionMode: 'percent_of_rent',
                    leasingCommissionPercentYearOne: 5,
                    leasingCommissionPercentRemainingYears: 3,
                    leasingPeriod: 36,
                }],
            }}
            unit={{unitNumber: '301', squareFootage: 1_000, marketRent: 'Market', calculatedVacantUnitLeasupCosts: 5_000}}
        >Unit leasing costs</LeasingCostsForUnitCalculationPopoverWrapper>);

        fireEvent.click(screen.getByRole('button', {name: 'Unit leasing costs'}));

        const popover = screen.getByRole('tooltip');
        expect(popover).toHaveTextContent('Unit 301 - Leasing Costs');
        expect(popover).toHaveTextContent('Tenant Inducements');
        expect(popover).toHaveTextContent('Leasing Costs - Year One');
        expect(popover).toHaveTextContent('Leasing Costs - Remaining Term');
        expect(popover).toHaveTextContent('$5,000');
    });

    it('renders nothing when no appraisal is supplied', () => {
        const {container} = render(<LeasingCostsForUnitCalculationPopoverWrapper unit={{}}>Unit leasing costs</LeasingCostsForUnitCalculationPopoverWrapper>);
        expect(container).toBeEmptyDOMElement();
    });
});
