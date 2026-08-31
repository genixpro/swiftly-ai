import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ViewRecoveryStructures, {ExpensePercentageEditor, RecoveryStructureEditor} from './ViewRecoveryStructures';

vi.mock('./components/FieldDisplayEdit', () => ({default: ({onChange, placeholder, value}) => <button aria-label={placeholder || String(value)} onClick={() => onChange?.('Edited')}>{String(value)}</button>}));
vi.mock('./components/ManagementExpenseRecoveryCalculationPopoverWrapper', () => ({default: ({children}) => <>{children}</>}));

function appraisalFixture() {
    return {
        recoveryStructures: [{
            name: 'Standard', isDefault: true, managementRecoveryMode: 'none',
            expenseRecoveries: {}, managementRecoveries: {}, taxRecoveries: {},
            calculatedExpenseRecoveries: {}, calculatedManagementRecoveries: {}, calculatedTaxRecoveries: {}, calculatedTotalRecovery: 0,
        }],
        units: [{
            tenancies: [{name: 'Taylor', rentType: 'net', recoveryStructure: 'Custom'}],
            unitNumber: '101', calculatedTotalRecovery: 0, calculatedExpenseRecovery: 0,
            calculatedManagementRecovery: 0, calculatedTaxRecovery: 0,
        }],
        expenseStatement: {items: []},
        stabilizedStatement: {operatingExpenseRecovery: 0, managementRecovery: 0, taxRecovery: 0},
    };
}

describe('recovery-structure workflow characterization', () => {
    it('creates and deletes a structure while returning attached tenancies to the default', () => {
        const appraisal = appraisalFixture();
        const saveAppraisal = vi.fn();
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const {rerender} = render(<ViewRecoveryStructures appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Create a new recovery structure'}));
        expect(appraisal.recoveryStructures[1].name).toBe('New Recovery Structure 1');
        appraisal.units[0].tenancies[0].recoveryStructure = 'New Recovery Structure 1';
        rerender(<ViewRecoveryStructures appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
        expect(confirm).toHaveBeenCalledWith('Are you sure you want to delete the recovery structure?');
        expect(appraisal.units[0].tenancies[0].recoveryStructure).toBe('Standard');
        expect(appraisal.recoveryStructures).toHaveLength(1);
        expect(saveAppraisal).toHaveBeenCalledTimes(2);
        confirm.mockRestore();
    });

    it('renames attached tenancies and toggles the assigned recovery structure before saving', () => {
        const recovery = {
            name: 'Premium', managementRecoveryMode: 'none', expenseRecoveries: {}, managementRecoveries: {}, taxRecoveries: {},
            calculatedExpenseRecoveries: {}, calculatedManagementRecoveries: {}, calculatedTaxRecoveries: {}, calculatedTotalRecovery: 0,
        };
        const unit = {
            unitNumber: '101', tenancies: [{name: 'Taylor', rentType: 'net', recoveryStructure: 'Premium'}],
            calculatedTotalRecovery: 0, calculatedExpenseRecovery: 0, calculatedManagementRecovery: 0, calculatedTaxRecovery: 0,
            calculatedMarketRentDifferential: 10,
        };
        const appraisal = {units: [unit]};
        const onChange = vi.fn();
        render(<RecoveryStructureEditor recovery={recovery} appraisal={appraisal} units={[unit]} expenses={[]} onChange={onChange} onDeleteRecovery={vi.fn()}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Recovery Structure Name'}));
        expect(recovery.name).toBe('Edited');
        expect(unit.tenancies[0].recoveryStructure).toBe('Edited');

        fireEvent.click(screen.getByRole('button', {name: 'Does recovery structure apply to this tenancy'}));
        expect(unit.tenancies[0].recoveryStructure).toBe('Standard');
        expect(unit.calculatedMarketRentDifferential).toBeNull();
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenLastCalledWith(recovery);
    });

    it('retains the legacy undefined callback payload for tax-recovery edits', () => {
        const recovery = {
            name: 'Premium', managementRecoveryMode: 'none', expenseRecoveries: {}, managementRecoveries: {},
            taxRecoveries: {PropertyTax: 50}, calculatedExpenseRecoveries: {}, calculatedManagementRecoveries: {},
            calculatedTaxRecoveries: {PropertyTax: 25}, calculatedTotalRecovery: 25,
        };
        const appraisal = {units: []};
        const onChange = vi.fn();
        render(<RecoveryStructureEditor
            recovery={recovery}
            appraisal={appraisal}
            units={[]}
            expenses={[{name: 'PropertyTax', incomeStatementItemType: 'taxes', yearlyAmounts: {2025: 100}}]}
            onChange={onChange}
            onDeleteRecovery={vi.fn()}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Expense %'}));
        expect(recovery.taxRecoveries.PropertyTax).toBe('Edited');
        expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('keeps the expense-recovery calculation popover available on demand', () => {
        const recovery = {name: 'Standard'};
        const appraisal = {sizeOfBuilding: 100, units: [{unitNumber: '101', squareFootage: 100, tenancies: [{name: 'Taylor', rentType: 'net', recoveryStructure: 'Standard'}]}]};
        render(<table><tbody><tr><ExpensePercentageEditor expense={{name: 'Utilities', yearlyAmounts: {2025: 100}}} recovery={recovery} appraisal={appraisal} value={100} calculated={100} onChange={vi.fn()}/></tr></tbody></table>);

        fireEvent.click(screen.getByRole('button', {name: '$100.00'}));
        expect(screen.getByText('Expense Recovery - Utilities')).toBeVisible();
        expect(screen.getByText('Recovered Amount Under Structure')).toBeVisible();
    });
});
