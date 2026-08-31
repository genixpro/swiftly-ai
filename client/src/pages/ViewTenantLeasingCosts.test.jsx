import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ViewTenantsLeasingCosts, {LeasingCostStructureEditor} from './ViewTenantLeasingCosts';

vi.mock('./components/FieldDisplayEdit', () => ({
    default: ({onChange, placeholder, value}) => <button aria-label={placeholder || String(value)} onClick={() => onChange?.('Edited')}>{String(value)}</button>,
}));
vi.mock('./components/LeasingCostsForUnitCalculationPopoverWrapper', () => ({
    default: ({children}) => <>{children}</>,
}));
vi.mock('./components/VacantRentLossForUnitCalculationPopoverWrapper', () => ({
    default: ({children}) => <>{children}</>,
}));

function appraisalFixture() {
    return {
        leasingCosts: [{
            name: 'Standard',
            leasingCommissionMode: 'psf',
            leasingCommissionPSF: 1,
            tenantInducementsPSF: 0,
            renewalPeriod: 0,
            leasingPeriod: 60,
            isDefault: true,
        }],
        units: [],
        sizeOfBuilding: 0,
        stabilizedStatement: {vacantUnitLeasupCosts: 0, vacantUnitRentLoss: 0},
    };
}

describe('tenant leasing-cost workflow characterization', () => {
    it('creates and deletes a leasing structure while immediately persisting the appraisal', () => {
        const appraisal = appraisalFixture();
        const saveAppraisal = vi.fn();
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const {rerender} = render(<ViewTenantsLeasingCosts appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Create a new leasing cost structure'}));
        expect(appraisal.leasingCosts).toHaveLength(2);
        expect(appraisal.leasingCosts[1].name).toBe('New Leasing Structure 1');
        expect(saveAppraisal).toHaveBeenLastCalledWith(appraisal);
        rerender(<ViewTenantsLeasingCosts appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
        expect(confirm).toHaveBeenCalledWith('Are you sure you want to delete the leasing cost structure?');
        expect(appraisal.leasingCosts).toHaveLength(1);
        expect(saveAppraisal).toHaveBeenCalledTimes(2);
        confirm.mockRestore();
    });

    it('renames assigned units and preserves vacancy-toggle save timing', () => {
        const leasingCostStructure = {name: 'Premium', tenantInducementsPSF: 0, leasingCommissionMode: 'psf', leasingCommissionPSF: 1, renewalPeriod: 0, leasingPeriod: 60};
        const appraisal = {units: [{unitNumber: '101', tenancies: [{name: 'Taylor'}], leasingCostStructure: 'Premium', marketRent: 'Standard', squareFootage: 100, calculatedVacantUnitLeasupCosts: 10, calculatedVacantUnitRentLoss: 20, shouldTreatAsVacant: false}]};
        const onChange = vi.fn();
        render(<LeasingCostStructureEditor leasingCostStructure={leasingCostStructure} appraisal={appraisal} onChange={onChange} onDeleteLeasingStructure={vi.fn()}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Leasing Cost Structure Name'}));
        expect(leasingCostStructure.name).toBe('Edited');
        expect(appraisal.units[0].leasingCostStructure).toBe('Edited');

        fireEvent.click(screen.getByRole('button', {name: 'Should the unit 101 be considered vacant when calculating the valuation.'}));
        expect(appraisal.units[0].shouldTreatAsVacant).toBe(true);
        expect(appraisal.units[0].calculatedVacantUnitLeasupCosts).toBeNull();
        expect(appraisal.units[0].calculatedVacantUnitRentLoss).toBeNull();
        expect(onChange).toHaveBeenCalledTimes(2);
    });
});
