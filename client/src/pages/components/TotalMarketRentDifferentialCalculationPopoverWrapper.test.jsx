import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import TotalMarketRentDifferentialCalculationPopoverWrapper from './TotalMarketRentDifferentialCalculationPopoverWrapper';

describe('TotalMarketRentDifferentialCalculationPopoverWrapper', () => {
    it('keeps its trigger and calculated unit rows', () => {
        render(<TotalMarketRentDifferentialCalculationPopoverWrapper appraisal={{
            stabilizedStatementInputs: {marketRentDifferentialDiscountRate: 8},
            stabilizedStatement: {marketRentDifferential: 1_500},
            units: [
                {unitNumber: '301', calculatedMarketRentDifferential: 1_000},
                {unitNumber: '302', calculatedMarketRentDifferential: 0},
            ],
        }}>Market rent differential</TotalMarketRentDifferentialCalculationPopoverWrapper>);

        fireEvent.click(screen.getByRole('button', {name: 'Market rent differential'}));
        const popover = screen.getByRole('tooltip');
        expect(popover).toHaveTextContent('Market Rent Differential');
        expect(popover).toHaveTextContent('Discount Rate');
        expect(popover).toHaveTextContent('Unit 301');
        expect(popover).not.toHaveTextContent('Unit 302');
        expect(popover).toHaveTextContent('Total');
    });
});
