import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import TotalRemainingFreeRentPopoverWrapper from './TotalRemainingFreeRentPopoverWrapper';

describe('TotalRemainingFreeRentPopoverWrapper', () => {
    it('keeps the trigger, calculation rows, and disclosure state', () => {
        render(<TotalRemainingFreeRentPopoverWrapper appraisal={{
            units: [{unitNumber: '201', calculatedFreeRentMonths: 2, calculatedFreeRentNetAmount: 12_000, calculatedFreeRentLoss: 2_000}],
            stabilizedStatement: {freeRentRentLoss: -2_000},
        }}>Remaining free rent</TotalRemainingFreeRentPopoverWrapper>);

        const trigger = screen.getByRole('button', {name: 'Remaining free rent'});
        fireEvent.click(trigger);
        expect(screen.getByRole('tooltip')).toHaveTextContent('Remaining Free Rent');
        expect(screen.getByRole('tooltip')).toHaveTextContent('Unit 201');
        expect(screen.getByRole('tooltip')).toHaveTextContent('Free Rent Loss');
    });
});
