import {describe, expect, it} from 'vitest';

import {sortIncomeStatementItems, type SortableIncomeStatementItem} from './sorting';

describe('sortIncomeStatementItems', () => {
    it('keeps configured groups first, leaves unconfigured rows last, and records legacy sortable positions', () => {
        const sortableIndex = Symbol('sortable-index');
        const income: SortableIncomeStatementItem = {name: 'Income', incomeStatementItemType: 'income'};
        const expense: SortableIncomeStatementItem = {name: 'Expense', incomeStatementItemType: 'expense'};
        const other: SortableIncomeStatementItem = {name: 'Other', incomeStatementItemType: 'other'};

        const result = sortIncomeStatementItems([other, expense, income], {
            income: 'Income', expense: 'Expense',
        }, sortableIndex);

        expect(result.sorted).toEqual([income, expense, other]);
        expect(result.income).toBe(1);
        expect(result.expense).toBe(1);
        expect(result.others).toBe(1);
        expect(income[sortableIndex]).toBe(1);
        expect(expense[sortableIndex]).toBe(5);
        expect(other[sortableIndex]).toBe(9);
    });
});
