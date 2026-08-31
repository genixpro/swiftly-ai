import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import TotalLeasingCostsCalculationPopoverWrapper from './TotalLeasingCostsCalculationPopoverWrapper';

describe('TotalLeasingCostsCalculationPopoverWrapper', () => {
    it('keeps the eligible unit, percent-of-rent rows, and total leasing costs', () => {
        render(<TotalLeasingCostsCalculationPopoverWrapper
            appraisal={{
                marketRents: [{name: 'Market', amountPSF: 20}],
                units: [
                    {unitNumber: '101', squareFootage: 1_000, marketRent: 'Market', calculatedVacantUnitLeasupCosts: 5_000},
                    {unitNumber: '102', squareFootage: 500, marketRent: 'Market', calculatedVacantUnitLeasupCosts: 0},
                ],
                leasingCosts: [{name: 'Standard',
                    tenantInducementsPSF: 1,
                    leasingCommissionMode: 'percent_of_rent',
                    leasingCommissionPercentYearOne: 5,
                    leasingCommissionPercentRemainingYears: 3,
                    leasingPeriod: 36,
                }],
                stabilizedStatement: {vacantUnitLeasupCosts: 5_000},
            }}
        >Leasing costs</TotalLeasingCostsCalculationPopoverWrapper>);

        fireEvent.click(screen.getByRole('button', {name: 'Leasing costs'}));

        const popover = screen.getByRole('tooltip');
        expect(popover).toHaveTextContent('Total Leasing Costs');
        expect(popover).toHaveTextContent('Unit 101');
        expect(popover).not.toHaveTextContent('Unit 102');
        expect(popover).toHaveTextContent('Leasing Costs - Year One');
        expect(popover).toHaveTextContent('Leasing Costs - Remaining Term');
        expect(popover).toHaveTextContent('$5,000.00');
    });

    it('renders nothing when no appraisal is supplied', () => {
        const {container} = render(<TotalLeasingCostsCalculationPopoverWrapper>Leasing costs</TotalLeasingCostsCalculationPopoverWrapper>);
        expect(container).toBeEmptyDOMElement();
    });
});
