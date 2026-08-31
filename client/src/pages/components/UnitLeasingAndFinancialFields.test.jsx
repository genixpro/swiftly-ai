import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import UnitLeasingAndFinancialFields from './UnitLeasingAndFinancialFields';

function renderFields(overrides = {}) {
    const callbacks = {
        onChangeLeasingCostField: vi.fn(),
        onChangeMarketRentField: vi.fn(),
        onChangeUnitField: vi.fn(),
    };
    const props = {
        appraisalType: 'simple',
        unit: {shouldTreatAsVacant: true, marketRent: null},
        leasingCosts: {
            leasingCommissionMode: 'psf', leasingCommissionPSF: 2, tenantInducementsPSF: 3, renewalPeriod: 12,
        },
        marketRent: {name: 'Unit market rent', amountPSF: 20},
        marketRents: [{name: 'Office', amountPSF: 20}, {name: 'Retail', amountPSF: 25}],
        ...callbacks,
        ...overrides,
    };
    render(<table><tbody><UnitLeasingAndFinancialFields {...props}/></tbody></table>);
    return {callbacks, props};
}

describe('UnitLeasingAndFinancialFields', () => {
    it('retains simple vacant-unit leasing controls and forwards cost and market-rent edits', async () => {
        const {callbacks} = renderFields();

        expect(screen.getByText('Leasing Commission')).toBeVisible();
        expect(screen.getByText('Tenant Inducements (psf)')).toBeVisible();
        expect(screen.getByText('Financials')).toBeVisible();
        expect(screen.getByText('Market Rent (psf)')).toBeVisible();

        const inducements = screen.getByPlaceholderText('Leasing Costs (psf)');
        fireEvent.focus(inducements);
        fireEvent.change(inducements, {target: {value: '$4.00'}});
        fireEvent.blur(inducements);
        await waitFor(() => expect(callbacks.onChangeLeasingCostField)
            .toHaveBeenLastCalledWith('tenantInducementsPSF', 4));

        const marketRent = screen.getByPlaceholderText('Market Rent (psf)');
        fireEvent.focus(marketRent);
        fireEvent.change(marketRent, {target: {value: '$22.00'}});
        fireEvent.blur(marketRent);
        await waitFor(() => expect(callbacks.onChangeMarketRentField).toHaveBeenLastCalledWith('amountPSF', 22));
    });

    it('shows percent commission rows only for the existing percent-of-rent mode', () => {
        renderFields({leasingCosts: {leasingCommissionMode: 'percent_of_rent', leasingCommissionPercentYearOne: 5}});

        expect(screen.getByText('Leasing Commission - Year 1')).toBeVisible();
        expect(screen.getByText('Leasing Commission - Remaining Years')).toBeVisible();
        expect(screen.queryByPlaceholderText('Leasing Costs (psf)')).toBeInTheDocument();
    });

    it('keeps detailed market-rent selection while omitting simple-appraisal leasing controls', async () => {
        const {callbacks} = renderFields({
            appraisalType: 'detailed',
            unit: {shouldTreatAsVacant: false, marketRent: 'Office'},
            leasingCosts: null,
            marketRent: null,
        });

        expect(screen.queryByText('Leasing Commission')).not.toBeInTheDocument();
        expect(screen.getByText('Market Rent')).toBeVisible();
        fireEvent.change(screen.getByRole('combobox', {name: 'Market Rent'}), {target: {value: 'Retail'}});
        await waitFor(() => expect(callbacks.onChangeUnitField).toHaveBeenLastCalledWith('marketRent', 'Retail'));
    });
});
