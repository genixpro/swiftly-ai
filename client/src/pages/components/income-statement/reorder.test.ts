import {describe, expect, it} from 'vitest';
import {reorderIncomeStatementItems} from './reorder';

describe('reorderIncomeStatementItems', () => {
    function createSorter(sortableIndex: symbol) {
        return (items: any[]) => {
            const grouped: any = {first: 0, second: 0, sorted: [] as any[]};
            for (const group of ['first', 'second']) {
                const groupItems = items.filter((item) => item.incomeStatementItemType === group);
                grouped[group] = groupItems.length;
                grouped.sorted.push(...groupItems);
            }
            let index = 1;
            for (const group of ['first', 'second']) {
                for (const item of grouped.sorted.filter((candidate: any) => candidate.incomeStatementItemType === group)) {
                    item[sortableIndex] = index;
                    index += 1;
                }
                index += 3;
            }
            return grouped;
        };
    }

    it('moves a row into the first group with its existing sortable-position rules', () => {
        const sortableIndex = Symbol('sortable-index');
        const first = {name: 'First', incomeStatementItemType: 'first'};
        const second = {name: 'Second', incomeStatementItemType: 'second'};
        const reordered = reorderIncomeStatementItems({
            items: [first, second],
            groups: {first: 'First', second: 'Second'},
            oldIndex: 5,
            newIndex: 1,
            sortableIndex,
            sortItems: createSorter(sortableIndex),
        });

        expect(reordered).toEqual([second, first]);
        expect(second.incomeStatementItemType).toBe('first');
    });

    it('keeps a row in its group when it lands on the group boundary', () => {
        const sortableIndex = Symbol('sortable-index');
        const first = {name: 'First', incomeStatementItemType: 'first'};
        const second = {name: 'Second', incomeStatementItemType: 'second'};
        const reordered = reorderIncomeStatementItems({
            items: [first, second],
            groups: {first: 'First', second: 'Second'},
            oldIndex: 1,
            newIndex: 3,
            sortableIndex,
            sortItems: createSorter(sortableIndex),
        });

        expect(reordered).toEqual([first, second]);
        expect(first.incomeStatementItemType).toBe('first');
    });
});
