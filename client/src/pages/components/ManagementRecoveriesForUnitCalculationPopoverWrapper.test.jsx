import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import ManagementRecoveriesForUnitCalculationPopoverWrapper from './ManagementRecoveriesForUnitCalculationPopoverWrapper';

describe('ManagementRecoveriesForUnitCalculationPopoverWrapper', () => {
    it('keeps the management-recovery calculation disclosure', () => {
        const unit = {tenancies: [{name: 'Tenant A'}], squareFootage: 1_000, calculatedManagementRecovery: 500};
        const appraisal = {
            sizeOfBuilding: 10_000,
            recoveryStructures: [{name: 'Standard', managementRecoveryOperatingPercentage: 25, calculatedManagementRecoveryBaseValue: 20_000}],
        };
        render(<ManagementRecoveriesForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit}>Management recovery</ManagementRecoveriesForUnitCalculationPopoverWrapper>);

        fireEvent.click(screen.getByRole('button', {name: 'Management recovery'}));
        const popover = screen.getByRole('tooltip');
        expect(popover).toHaveTextContent('Management Recovery');
        expect(popover).toHaveTextContent('Tenant A');
        expect(popover).toHaveTextContent('$20,000.00');
    });
});
