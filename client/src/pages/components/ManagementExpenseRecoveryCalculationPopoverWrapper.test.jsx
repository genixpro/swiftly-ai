import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import ManagementExpenseRecoveryCalculationPopoverWrapper from './ManagementExpenseRecoveryCalculationPopoverWrapper';

describe('ManagementExpenseRecoveryCalculationPopoverWrapper', () => {
    it('keeps gross tenants under the selected recovery structure and its total', () => {
        render(<ManagementExpenseRecoveryCalculationPopoverWrapper
            appraisal={{
                units: [
                    {
                        squareFootage: 500,
                        tenancies: [{name: 'Gross tenant', recoveryStructure: 'Standard', rentType: 'gross'}],
                        calculatedManagementRecovery: 125,
                    },
                    {
                        squareFootage: 500,
                        tenancies: [{name: 'Net tenant', recoveryStructure: 'Standard', rentType: 'net'}],
                        calculatedManagementRecovery: 125,
                    },
                ],
            }}
            recovery={{
                name: 'Standard',
                managementRecoveryOperatingPercentage: 12.5,
                calculatedManagementRecoveryBaseValue: 1_000,
                calculatedManagementRecoveryTotal: 125,
            }}
        >Management recovery</ManagementExpenseRecoveryCalculationPopoverWrapper>);

        fireEvent.click(screen.getByRole('button', {name: 'Management recovery'}));

        const popover = screen.getByRole('tooltip');
        expect(popover).toHaveTextContent('Management Recovery');
        expect(popover).toHaveTextContent('Gross tenant');
        expect(popover).not.toHaveTextContent('Net tenant');
        expect(popover).toHaveTextContent('$125.00');
    });
});
