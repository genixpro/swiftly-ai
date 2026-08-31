import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import UnitDetailsEditor from './UnitDetailsEditor';

function renderEditor(overrides = {}) {
    const tenancy = {
        name: 'Existing Tenant', yearlyRent: 12_000, monthlyRent: 1_000,
        rentType: 'net', freeRentType: 'net', freeRentMonths: 0,
        startDate: null, endDate: null, recoveryStructure: 'Standard',
    };
    const unit = {
        unitNumber: '101', floorNumber: 1, squareFootage: 1_000, tenancies: [tenancy], currentTenancy: tenancy,
        marketRent: null, leasingCostStructure: 'Standard', remarks: null,
        shouldApplyMarketRentDifferential: null, shouldUseMarketRent: null, shouldTreatAsVacant: null,
        stabilizedRent: 12_000,
        calculatedManagementRecovery: null, calculatedExpenseRecovery: null, calculatedTaxRecovery: null,
        calculatedMarketRentDifferential: null, calculatedFreeRentLoss: null, calculatedVacantUnitRentLoss: null,
        calculatedVacantUnitLeasupCosts: null, calculatedFreeRentMonths: null, calculatedFreeRentNetAmount: null,
        ...overrides.unit,
    };
    const appraisal = {
        _id: 'appraisal-1', appraisalType: 'detailed', units: [unit], marketRents: [],
        recoveryStructures: [{name: 'Standard'}], leasingCosts: [{name: 'Standard'}], stabilizedStatementInputs: {},
        ...overrides.appraisal,
    };
    const onChange = vi.fn();
    const rendered = render(<UnitDetailsEditor unit={unit} appraisal={appraisal} onChange={onChange}/>);
    return {appraisal, onChange, unit, ...rendered};
}

describe('UnitDetailsEditor characterization', () => {
    it('retains the detailed rent-roll fields and creates a default tenancy through the existing save callback', async () => {
        const {onChange, unit} = renderEditor();

        expect(screen.getByText('Tenancy & Escalation Schedule')).toBeVisible();
        expect(screen.getByText('Free Rent Period (months)')).toBeVisible();
        fireEvent.click(screen.getByTitle('New Tenancy'));

        await waitFor(() => expect(onChange).toHaveBeenCalledWith(unit));
        expect(unit.tenancies).toHaveLength(2);
        expect(unit.tenancies[1]).toMatchObject({
            name: 'New Tenant', monthlyRent: 0, yearlyRent: 0, rentType: 'net',
            freeRentType: 'net', freeRentMonths: 0, recoveryStructure: 'Standard',
        });
    });

    it('updates annual rent per square foot as annual and monthly rent, then saves the same unit immediately', async () => {
        const {onChange, unit} = renderEditor();
        const rentPSF = screen.getByPlaceholderText('yearly rent (psf)');

        fireEvent.focus(rentPSF);
        fireEvent.change(rentPSF, {target: {value: '$25.00'}});
        fireEvent.blur(rentPSF);

        await waitFor(() => expect(onChange).toHaveBeenCalledWith(unit));
        expect(unit.tenancies[0]).toMatchObject({yearlyRent: 25_000, monthlyRent: 25_000 / 12});
    });

    it('creates from the provisional tenancy name row and removes a later tenancy with the existing save timing', async () => {
        const secondTenancy = {name: 'Second Tenant', yearlyRent: 10_000, monthlyRent: 833.33, rentType: 'net'};
        const {onChange, unit} = renderEditor({unit: {tenancies: [
            {name: 'Existing Tenant', yearlyRent: 12_000, monthlyRent: 1_000, rentType: 'net'},
            secondTenancy,
        ]}});

        fireEvent.click(screen.getAllByTitle('New Tenancy')[0]);
        await waitFor(() => expect(onChange).toHaveBeenCalledWith(unit));
        expect(unit.tenancies).toHaveLength(1);

        const name = screen.getByPlaceholderText('Name');
        fireEvent.focus(name);
        fireEvent.change(name, {target: {value: 'Created from row'}});
        fireEvent.blur(name);
        await waitFor(() => expect(unit.tenancies).toHaveLength(2));
        expect(unit.tenancies[1]).toMatchObject({name: 'Created from row', yearlyRent: 0, monthlyRent: 0});
    });

    it('propagates tenant-level edits and treats the vacancy checkbox as an immediate unit edit', async () => {
        const secondTenancy = {name: 'Second Tenant', yearlyRent: 10_000, monthlyRent: 833.33, rentType: 'net'};
        const {onChange, unit} = renderEditor({unit: {tenancies: [
            {name: 'Existing Tenant', yearlyRent: 12_000, monthlyRent: 1_000, rentType: 'net'},
            secondTenancy,
        ]}});

        const tenantName = screen.getByPlaceholderText('Tenant Name');
        fireEvent.focus(tenantName);
        fireEvent.change(tenantName, {target: {value: 'Shared Tenant'}});
        fireEvent.blur(tenantName);
        await waitFor(() => expect(onChange).toHaveBeenCalledWith(unit));
        expect(unit.tenancies.map((tenancy) => tenancy.name)).toEqual(['Shared Tenant', 'Shared Tenant']);

        fireEvent.click(screen.getByRole('checkbox', {name: 'Treat Unit as Vacant?'}));
        await waitFor(() => expect(unit.shouldTreatAsVacant).toBe(true));
    });

    it('creates independent market-rent and leasing-cost records for a vacant simple unit', async () => {
        const {appraisal, onChange, unit} = renderEditor({
            unit: {shouldTreatAsVacant: true},
            appraisal: {
                appraisalType: 'simple',
                leasingCosts: [{
                    name: 'Standard', leasingCommissionMode: 'psf', leasingCommissionPSF: 1,
                    tenantInducementsPSF: 0, renewalPeriod: 12, leasingPeriod: 60,
                }],
            },
        });

        const marketRent = screen.getByPlaceholderText('Market Rent (psf)');
        fireEvent.focus(marketRent);
        fireEvent.change(marketRent, {target: {value: '$20.00'}});
        fireEvent.blur(marketRent);

        await waitFor(() => expect(onChange).toHaveBeenCalledWith(unit));
        expect(unit.marketRent).toBe('New Leasing Structure 2');
        expect(appraisal.marketRents).toEqual([{name: 'New Leasing Structure 2', amountPSF: 20}]);

        const leasingCosts = screen.getByPlaceholderText('Leasing Costs (psf)');
        fireEvent.focus(leasingCosts);
        fireEvent.change(leasingCosts, {target: {value: '$2.00'}});
        fireEvent.blur(leasingCosts);

        await waitFor(() => expect(unit.leasingCostStructure).toBe('New Leasing Structure 2'));
        expect(onChange).toHaveBeenCalledWith(unit);
        expect(appraisal.leasingCosts.at(-1)).toMatchObject({name: 'New Leasing Structure 2', tenantInducementsPSF: 2});
    });

    it('removes an existing simple-unit market rent on clear without changing the save callback timing', async () => {
        const marketRent = {name: 'Suite market rent', amountPSF: 20};
        const {appraisal, onChange, rerender, unit} = renderEditor({
            unit: {marketRent: marketRent.name, shouldTreatAsVacant: true},
            appraisal: {appraisalType: 'simple', marketRents: [marketRent]},
        });

        const marketRentInput = screen.getByPlaceholderText('Market Rent (psf)');
        fireEvent.focus(marketRentInput);
        fireEvent.change(marketRentInput, {target: {value: ''}});
        fireEvent.blur(marketRentInput);

        await waitFor(() => expect(unit.marketRent).toBeNull());
        expect(appraisal.marketRents).toEqual([]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenLastCalledWith(unit);

        // The next render still shows the same empty field state used before the refactor.
        rerender(<UnitDetailsEditor unit={unit} appraisal={appraisal} onChange={onChange}/>);
        expect(screen.getByPlaceholderText('Market Rent (psf)')).toHaveValue('');
    });
});
