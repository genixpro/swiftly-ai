import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import ExpenseRecoveryForUnitCalculationPopoverWrapper from './ExpenseRecoveryForUnitCalculationPopoverWrapper';

describe('ExpenseRecoveryForUnitCalculationPopoverWrapper', () => {
    it('keeps operating-expense recovery rows and the calculated recovered amount', () => {
        const unit = {squareFootage: 500, calculatedExpenseRecovery: 250};
        render(<ExpenseRecoveryForUnitCalculationPopoverWrapper
            appraisal={{
                units: [{squareFootage: 1_000}],
                expenseStatement: {items: [
                    {name: 'Utilities', incomeStatementItemType: 'operating_expense', yearlyAmounts: {2025: 500}},
                    {name: 'Taxes', incomeStatementItemType: 'tax_expense', yearlyAmounts: {2025: 100}},
                ]},
                recoveryStructures: [{name: 'Standard', expenseRecoveries: {utilities: 100}}],
            }}
            unit={unit}
            incomeStatementItemType="operating_expense"
        >Expense recovery</ExpenseRecoveryForUnitCalculationPopoverWrapper>);

        fireEvent.click(screen.getByRole('button', {name: 'Expense recovery'}));

        const popover = screen.getByRole('tooltip');
        expect(popover).toHaveTextContent('Expense Recoveries');
        expect(popover).toHaveTextContent('Utilities');
        expect(popover).not.toHaveTextContent('Taxes');
        expect(popover).toHaveTextContent('$250.00');
    });
});
