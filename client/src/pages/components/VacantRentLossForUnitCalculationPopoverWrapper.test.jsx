import {fireEvent, render, screen} from '@testing-library/react';
import {expect, it} from 'vitest';
import VacantRentLossForUnitCalculationPopoverWrapper from './VacantRentLossForUnitCalculationPopoverWrapper';

it('preserves vacant rent and net-recovery loss rows', () => {
    const unit = {unitNumber: '501', marketRent: 'Market', squareFootage: 1000, tenancies: [{rentType: 'net'}], calculatedTaxRecovery: 100, calculatedManagementRecovery: 50, calculatedExpenseRecovery: 150, calculatedVacantUnitRentLoss: 3_000};
    render(<VacantRentLossForUnitCalculationPopoverWrapper appraisal={{marketRents: [{name: 'Market', amountPSF: 20}], leasingCosts: [{name: 'Standard', renewalPeriod: 3}]}} unit={unit}>Vacant loss</VacantRentLossForUnitCalculationPopoverWrapper>);
    fireEvent.click(screen.getByRole('button', {name: 'Vacant loss'}));
    expect(screen.getByRole('tooltip')).toHaveTextContent('Unit 501 - Vacant Rent Loss');
    expect(screen.getByRole('tooltip')).toHaveTextContent('Recovery Loss');
    expect(screen.getByRole('tooltip')).toHaveTextContent('Gross Rent Loss');
});
