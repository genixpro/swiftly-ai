import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import StabilizedStatementInputsPanel from './StabilizedStatementInputsPanel';

vi.mock('./FieldDisplayEdit', () => ({
    default: ({placeholder, value}: {placeholder?: string; value?: unknown}) => <output aria-label={placeholder}>{String(value)}</output>,
}));

function renderPanel(appraisal: Record<string, unknown>) {
    return render(<StabilizedStatementInputsPanel
        appraisal={appraisal as never}
        expenses={[]}
        onManagementExpenseCalculationRuleChange={vi.fn()}
        onRecoveryStructureChange={vi.fn()}
        onStabilizedInputChange={vi.fn()}
    />);
}

describe('StabilizedStatementInputsPanel', () => {
    it('keeps detailed-rule inputs and structural allowance controls', () => {
        renderPanel({
            appraisalType: 'detailed',
            expenseStatement: {items: []},
            recoveryStructures: [{managementRecoveryMode: 'none'}],
            stabilizedStatement: {calculationErrorFields: ['managementExpenses'], calculationErrors: {managementExpenses: 'Rule error'}},
            stabilizedStatementInputs: {
                managementExpenseMode: 'rule', managementExpenseCalculationRule: {percentage: 4, field: 'income'},
                structuralAllowancePercent: 2,
            },
        });

        expect(screen.getByText('Management Expense Calculation')).toBeVisible();
        expect(screen.getByLabelText('Percent Of')).toHaveTextContent('4');
        expect(screen.getByLabelText('Structural Allowance Rate')).toHaveTextContent('2');
        expect(screen.queryByText('Management Recovery Mode')).not.toBeInTheDocument();
    });

    it('keeps simple-appraisal recovery and TMI controls', () => {
        renderPanel({
            appraisalType: 'simple',
            expenseStatement: {items: []},
            recoveryStructures: [{managementRecoveryMode: 'operatingExpenses', managementRecoveryOperatingPercentage: 12}],
            stabilizedStatement: {calculationErrorFields: [], calculationErrors: {}},
            stabilizedStatementInputs: {expensesMode: 'tmi', managementExpenseCalculationRule: {}, tmiRatePSF: 8},
        });

        expect(screen.getByText('Management Recovery Mode')).toBeVisible();
        expect(screen.getByLabelText('Management Recovery %')).toHaveTextContent('12');
        expect(screen.getByLabelText('TMI Rate (psf)')).toHaveTextContent('8');
    });
});
