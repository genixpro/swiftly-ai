import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {MemoryRouter} from 'react-router';
import ViewStabilizedStatement from './ViewStabilizedStatement';

vi.mock('./components/AppraisalContentHeader', () => ({default: () => <div>Header</div>}));
vi.mock('./components/UnitsTable', () => ({
    default: ({onCreateUnit, onChangeUnitOrder, onRemoveUnit, onUnitChanged, onUnitClicked}) => <>
        <button onClick={() => onCreateUnit({unitNumber: 'New'})}>Create unit</button>
        <button onClick={() => onChangeUnitOrder([{unitNumber: 'Reordered'}])}>Reorder units</button>
        <button onClick={() => onRemoveUnit(0)}>Remove unit</button>
        <button onClick={() => onUnitChanged(0, {unitNumber: 'Changed'})}>Change unit</button>
        <button onClick={() => onUnitClicked({unitNumber: 'Clicked'}, 0)}>Open unit</button>
    </>,
}));
vi.mock('./components/FieldDisplayEdit', () => ({
    default: ({onChange, placeholder}) => <button aria-label={placeholder} onClick={() => onChange('Edited value')}>{placeholder}</button>,
}));

function appraisalFixture() {
    return {
        _id: 'appraisal-1',
        address: '10 Main Street',
        effectiveDate: new Date('2026-01-01'),
        appraisalType: 'simple',
        units: [],
        incomeStatement: {items: []},
        expenseStatement: {items: []},
        recoveryStructures: [{managementRecoveryMode: 'none', managementRecoveryOperatingPercentage: 5}],
        stabilizedStatementInputs: {
            vacancyRate: 5,
            managementExpenseMode: 'income_statement',
            managementExpenseCalculationRule: {percentage: 5, field: 'operatingExpenses'},
            expensesMode: 'income_statement',
        },
        stabilizedStatement: {
            rentalIncome: 100, recoverableIncome: 0, potentialGrossIncome: 100,
            vacancyDeduction: 0, effectiveGrossIncome: 100, operatingExpenses: 0,
            taxes: 0, managementExpenses: 0, totalExpenses: 0, netOperatingIncome: 100,
            calculationErrorFields: [], calculationErrors: {},
        },
    };
}

describe('stabilized statement workflow characterization', () => {
    it('immediately saves editable inputs and nested unit changes', () => {
        const appraisal = appraisalFixture();
        const saveAppraisal = vi.fn();
        render(<ViewStabilizedStatement appraisal={appraisal} saveAppraisal={saveAppraisal} expenses={[]}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Vacancy Rate'}));
        expect(appraisal.stabilizedStatementInputs.vacancyRate).toBe('Edited value');

        fireEvent.click(screen.getByRole('button', {name: 'Create unit'}));
        expect(appraisal.units).toEqual([{unitNumber: 'New'}]);

        fireEvent.click(screen.getByRole('button', {name: 'Reorder units'}));
        expect(appraisal.units).toEqual([{unitNumber: 'Reordered'}]);
        expect(saveAppraisal).toHaveBeenCalledTimes(3);
        expect(saveAppraisal).toHaveBeenLastCalledWith(appraisal);
    });

    it('keeps rule, recovery, structural allowance, and TMI edits on their existing paths', () => {
        const appraisal = appraisalFixture();
        appraisal.stabilizedStatementInputs.managementExpenseMode = 'rule';
        appraisal.stabilizedStatementInputs.expensesMode = 'tmi';
        appraisal.recoveryStructures[0].managementRecoveryMode = 'operatingExpenses';
        const saveAppraisal = vi.fn();
        render(<ViewStabilizedStatement appraisal={appraisal} saveAppraisal={saveAppraisal} expenses={[]}/>);

        for (const label of [
            'Percent Of', 'Expense Calculation Field', 'Management Recovery %', 'Management Recovery Mode',
            'Structural Allowance Rate', 'TMI Rate (psf)',
        ]) {
            fireEvent.click(screen.getByRole('button', {name: label}));
        }

        expect(appraisal.stabilizedStatementInputs).toMatchObject({
            managementExpenseCalculationRule: {percentage: 'Edited value', field: 'Edited value'},
            structuralAllowancePercent: 'Edited value',
            tmiRatePSF: 'Edited value',
        });
        expect(appraisal.recoveryStructures[0]).toMatchObject({
            managementRecoveryOperatingPercentage: 'Edited value', managementRecoveryMode: 'Edited value',
        });
        expect(saveAppraisal).toHaveBeenCalledTimes(6);
        expect(saveAppraisal).toHaveBeenLastCalledWith(appraisal);
    });

    it('keeps unit removal, replacement, and detailed-navigation callbacks unchanged', () => {
        const appraisal = appraisalFixture();
        appraisal.appraisalType = 'detailed';
        appraisal.units = [{unitNumber: 'Original'}];
        const saveAppraisal = vi.fn();
        const navigate = vi.fn();
        render(<MemoryRouter><ViewStabilizedStatement appraisal={appraisal} saveAppraisal={saveAppraisal} expenses={[]} navigate={navigate}/></MemoryRouter>);

        fireEvent.click(screen.getByRole('button', {name: 'Open unit'}));
        expect(navigate).toHaveBeenCalledWith('/appraisal/appraisal-1/tenants/rent_roll?unit=0');

        fireEvent.click(screen.getByRole('button', {name: 'Change unit'}));
        expect(appraisal.units).toEqual([{unitNumber: 'Changed'}]);

        fireEvent.click(screen.getByRole('button', {name: 'Remove unit'}));
        expect(appraisal.units).toEqual([]);
        expect(saveAppraisal).toHaveBeenCalledTimes(2);
    });

    it('preserves the separate simple-statement create paths for income and expense inputs', () => {
        const appraisal = appraisalFixture();
        const appraisalYear = appraisal.effectiveDate.getFullYear();
        appraisal.incomeStatement.items = [{name: 'Existing income', yearlyAmounts: {2026: 1}}];
        appraisal.expenseStatement.items = [{name: 'Existing expense', yearlyAmounts: {2026: 1}}];
        // The screen's established simple-mode contract writes to these
        // collections while rendering the statement item rows above.
        appraisal.incomes = {items: [{name: 'Existing income', yearlyAmounts: {2026: 1}}]};
        appraisal.expenses = {items: [{name: 'Existing expense', yearlyAmounts: {2026: 1}}]};
        const saveAppraisal = vi.fn();
        render(<ViewStabilizedStatement appraisal={appraisal} saveAppraisal={saveAppraisal} expenses={[]}/>);

        fireEvent.click(screen.getAllByRole('button', {name: 'Add/Remove Income'})[1]);
        fireEvent.click(screen.getAllByRole('button', {name: 'Amount'})[1]);
        fireEvent.click(screen.getAllByRole('button', {name: 'Add/Remove Expense'})[1]);
        fireEvent.click(screen.getAllByRole('button', {name: 'Amount'})[3]);

        expect(appraisal.incomes.items).toEqual(expect.arrayContaining([
            expect.objectContaining({name: 'Edited value'}),
            expect.objectContaining({yearlyAmounts: {[appraisalYear]: 'Edited value'}}),
        ]));
        expect(appraisal.expenses.items).toEqual(expect.arrayContaining([
            expect.objectContaining({name: 'Edited value'}),
            expect.objectContaining({yearlyAmounts: {[appraisalYear]: 'Edited value'}}),
        ]));
        expect(saveAppraisal).toHaveBeenCalledTimes(4);
    });

});
