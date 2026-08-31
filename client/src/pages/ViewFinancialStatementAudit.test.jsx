import {render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ViewFinancialStatementAudit from './ViewFinancialStatementAudit';

function statementFixture() {
    return {
        extractedData: {
            income: [{lineNumber: 1, income_name: 'Base rent', income_amount: '$1,200.00'}],
            expense: [{lineNumber: 2, expense_name: 'Utilities', expense_amount: '$300.00'}],
        },
        words: [],
    };
}

describe('financial statement audit workflow characterization', () => {
    it('defaults extracted lines to included and calculates the legacy audit totals', async () => {
        const financialStatement = statementFixture();
        const saveFinancialStatementData = vi.fn();
        render(<ViewFinancialStatementAudit financialStatement={financialStatement} saveFinancialStatementData={saveFinancialStatementData}/>);

        await waitFor(() => expect(screen.getByText('1,200.00')).toBeVisible());
        expect(screen.getByText('300.00')).toBeVisible();
        expect(financialStatement.extractedData.income[0].include).toBe(true);
        expect(financialStatement.extractedData.expense[0].include).toBe(true);
        expect(screen.queryByText('Base rent')).not.toBeInTheDocument();
        expect(screen.queryByText('Utilities')).not.toBeInTheDocument();
        expect(saveFinancialStatementData).not.toHaveBeenCalled();
    });
});
