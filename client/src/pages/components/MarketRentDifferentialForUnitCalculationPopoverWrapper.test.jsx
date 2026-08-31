import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import MarketRentDifferentialForUnitCalculationPopoverWrapper from './MarketRentDifferentialForUnitCalculationPopoverWrapper';

describe('market-rent differential popover characterization', () => {
    it('opens the existing present-value explanation for a unit', () => {
        const appraisal = {
            effectiveDate: '2026-01-01',
            stabilizedStatementInputs: {marketRentDifferentialDiscountRate: 5},
            marketRents: [{name: 'Market', amountPSF: 20}],
        };
        const unit = {
            unitNumber: '101', squareFootage: 1000, marketRent: 'Market',
            calculatedMarketRentDifferential: 100,
            tenancies: [{yearlyRent: 18000, endDate: new Date('2026-01-31')}],
        };
        render(<MarketRentDifferentialForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit}>Details</MarketRentDifferentialForUnitCalculationPopoverWrapper>);

        fireEvent.click(screen.getByRole('button', {name: 'Details'}));
        expect(screen.getByText('Unit 101 - Market Rent Differential')).toBeVisible();
        expect(screen.getAllByText('Present Value')).not.toHaveLength(0);
    });
});
