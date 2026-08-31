import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import FreeRentLossForUnitCalculationPopoverWrapper from './FreeRentLossForUnitCalculationPopoverWrapper';

describe('FreeRentLossForUnitCalculationPopoverWrapper', () => {
    it('keeps unit free-rent-loss disclosure and calculation values', () => {
        render(<FreeRentLossForUnitCalculationPopoverWrapper appraisal={{}} unit={{
            calculatedFreeRentMonths: 2, calculatedFreeRentNetAmount: 12_000, calculatedFreeRentLoss: 2_000,
        }}>Free rent loss</FreeRentLossForUnitCalculationPopoverWrapper>);

        fireEvent.click(screen.getByRole('button', {name: 'Free rent loss'}));
        const popover = screen.getByRole('tooltip');
        expect(popover).toHaveTextContent('Free Rent Loss');
        expect(popover).toHaveTextContent('2 months remaining');
        expect(popover).toHaveTextContent('$12,000.00');
    });
});
