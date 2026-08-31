import {describe, expect, it} from 'vitest';
import {computeGroupTotals, initializeIncludedLines, type FinancialStatementAudit} from './financialStatementAudit';
import {cleanFinancialStatementAmount} from './financialStatementUtilities';

describe('financial statement audit domain', () => {
    it('keeps the legacy amount-cleaning coercion at the domain boundary', () => {
        expect(cleanFinancialStatementAmount('$1,000.50')).toBe(1000.5);
        expect(cleanFinancialStatementAmount('($250.25)')).toBe(-250.25);
        expect(cleanFinancialStatementAmount('')).toBe('');
    });

    it('materializes only missing include flags on the mutable extraction draft', () => {
        const statement: FinancialStatementAudit = {extractedData: {
            income: [{income_amount: '100'}, {include: false, income_amount: '200'}],
            expense: [{expense_amount: '25'}],
        }};

        initializeIncludedLines(statement);

        expect(statement.extractedData.income?.map(item => item.include)).toEqual([true, false]);
        expect(statement.extractedData.expense?.map(item => item.include)).toEqual([true]);
    });

    it('includes only selected rows and preserves the existing negative-parentheses coercion', () => {
        const statement: FinancialStatementAudit = {extractedData: {
            income: [{include: true, income_amount: '$1,000.50'}, {include: false, income_amount: '$500'}],
            expense: [{include: true, expense_amount: '($250.25)'}, {include: false, expense_amount: '$10'}],
        }};

        expect(computeGroupTotals(statement)).toEqual({incomeTotal: 1000.5, expenseTotal: -250.25});
    });

    it('retains the legacy blank-amount total representation', () => {
        const statement: FinancialStatementAudit = {extractedData: {
            income: [{include: true, income_amount: ''}],
            expense: [],
        }};

        expect(computeGroupTotals(statement)).toEqual({incomeTotal: '0', expenseTotal: 0});
    });
});
