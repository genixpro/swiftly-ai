import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import UnitRentSummary from './UnitRentSummary';

describe('UnitRentSummary', () => {
    it('keeps the two rent rows and hides market-rent controls until a market rent is selected', () => {
        render(<UnitRentSummary
            unit={{squareFootage: 1_000, tenancies: [{yearlyRent: 12_000}], marketRent: null}}
            onChangeUnitField={vi.fn()}
        />);

        expect(screen.getByText('Current Annual Rent (psf)')).toBeVisible();
        expect(screen.getByText('Current Annual Rent')).toBeVisible();
        expect(screen.getByText('12.00')).toBeVisible();
        expect(screen.queryByText('Apply Market Rent')).not.toBeInTheDocument();
    });

    it('forwards both inline market-rent checkbox changes with their existing field names', async () => {
        const onChangeUnitField = vi.fn();
        render(<UnitRentSummary
            unit={{
                squareFootage: 1_000, marketRent: 'Office',
                tenancies: [{yearlyRent: 12_000}],
                shouldUseMarketRent: false, shouldApplyMarketRentDifferential: false,
            }}
            onChangeUnitField={onChangeUnitField}
        />);

        fireEvent.click(screen.getByRole('checkbox', {name: 'Use Market Rent for Stabilized Statement?'}));
        await waitFor(() => expect(onChangeUnitField).toHaveBeenLastCalledWith('shouldUseMarketRent', true));

        fireEvent.click(screen.getByRole('checkbox', {name: 'Apply Market Rent Differential?'}));
        await waitFor(() => expect(onChangeUnitField).toHaveBeenLastCalledWith('shouldApplyMarketRentDifferential', true));
    });
});
