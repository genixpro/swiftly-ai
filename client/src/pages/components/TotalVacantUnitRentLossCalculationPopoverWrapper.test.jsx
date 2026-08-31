import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import TotalVacantUnitRentLossCalculationPopoverWrapper from './TotalVacantUnitRentLossCalculationPopoverWrapper';

describe('TotalVacantUnitRentLossCalculationPopoverWrapper', () => {
    it('keeps vacant-unit calculation rows and gross-rent-loss output', () => {
        render(<TotalVacantUnitRentLossCalculationPopoverWrapper appraisal={{
            marketRents: [{name: 'Market', amountPSF: 20}],
            leasingCosts: [{name: 'Custom', renewalPeriod: 3}],
            units: [{
                unitNumber: '401', leasingCostStructure: 'Custom', calculatedVacantUnitRentLoss: 3_000,
                marketRent: 'Market', squareFootage: 1_000, calculatedTaxRecovery: 200,
                calculatedManagementRecovery: 100, calculatedExpenseRecovery: 300,
            }],
            stabilizedStatement: {vacantUnitRentLoss: 3_000},
        }}>Vacant rent loss</TotalVacantUnitRentLossCalculationPopoverWrapper>);

        fireEvent.click(screen.getByRole('button', {name: 'Vacant rent loss'}));
        const popover = screen.getByRole('tooltip');
        expect(popover).toHaveTextContent('Total Vacant Unit Rent Loss');
        expect(popover).toHaveTextContent('Unit 401');
        expect(popover).toHaveTextContent('Gross Rent Loss');
    });
});
