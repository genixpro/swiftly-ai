import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import TotalRecoverableIncomePopoverWrapper from './TotalRecoverableIncomePopoverWrapper';

describe('TotalRecoverableIncomePopoverWrapper', () => {
    it('keeps net tenants under the selected structure and the recovered total', () => {
        render(<TotalRecoverableIncomePopoverWrapper
            appraisal={{
                stabilizedStatement: {operatingExpenses: 2_000, taxes: 1_000},
                units: [
                    {
                        squareFootage: 500,
                        tenancies: [{name: 'Net tenant', recoveryStructure: 'Standard', rentType: 'net'}],
                        calculatedManagementRecovery: 100,
                        calculatedExpenseRecovery: 150,
                        calculatedTaxRecovery: 200,
                    },
                    {
                        squareFootage: 500,
                        tenancies: [{name: 'Gross tenant', recoveryStructure: 'Standard', rentType: 'gross'}],
                        calculatedManagementRecovery: 100,
                        calculatedExpenseRecovery: 150,
                        calculatedTaxRecovery: 200,
                    },
                ],
            }}
            recovery={{
                name: 'Standard',
                calculatedManagementRecoveryBaseValue: 1_000,
                calculatedManagementRecoveryTotal: 100,
                calculatedExpenseRecoveries: {operating: 150},
                calculatedTaxRecoveries: {taxes: 200},
            }}
        >Recoverable income</TotalRecoverableIncomePopoverWrapper>);

        fireEvent.click(screen.getByRole('button', {name: 'Recoverable income'}));

        const popover = screen.getByRole('tooltip');
        expect(popover).toHaveTextContent('Total Recoverable Income');
        expect(popover).toHaveTextContent('Net tenant');
        expect(popover).not.toHaveTextContent('Gross tenant');
        expect(popover).toHaveTextContent('$450.00');
    });
});
