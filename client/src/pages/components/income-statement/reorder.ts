import _ from 'underscore';
import {arrayMove} from '@dnd-kit/sortable';
import type {IncomeStatementSortResult, SortableIncomeStatementItem} from './sorting';

interface ReorderIncomeStatementItemsArgs {
    items: SortableIncomeStatementItem[];
    groups: Record<string, string>;
    oldIndex: number;
    newIndex: number;
    sortableIndex: symbol;
    sortItems: (items: SortableIncomeStatementItem[]) => IncomeStatementSortResult;
}

/**
 * Preserves the established drag target rules, including its group-boundary
 * special case. The caller remains responsible for assigning and saving.
 */
export function reorderIncomeStatementItems({
    items,
    groups,
    oldIndex,
    newIndex,
    sortableIndex,
    sortItems,
}: ReorderIncomeStatementItemsArgs): SortableIncomeStatementItem[] {
    const expensedGrouped = sortItems(items);
    let expensesSorted: SortableIncomeStatementItem[] = expensedGrouped.sorted;
    const origOldIndex = _.indexOf(expensesSorted, _.filter(expensesSorted, expense => expense[sortableIndex] === oldIndex)[0]);
    let origNewIndex = _.indexOf(expensesSorted, _.filter(expensesSorted, expense => expense[sortableIndex] === newIndex)[0]);

    let currentIndex = 0;
    let newIncomeStatementItemType = "";
    let groupIndex = 0;
    for (const group of Object.keys(groups)) {
        const header = currentIndex;
        const itemsEnd = currentIndex + (expensedGrouped[group] as number);
        const statsRow = itemsEnd + 2;

        if ((groupIndex === 0 && newIndex <= statsRow)
            || (groupIndex > 0 && newIndex >= header && newIndex <= statsRow)
            || (newIndex < oldIndex && groupIndex > 0 && newIndex === statsRow + 1)) {
            newIncomeStatementItemType = group;
            break;
        }

        currentIndex = statsRow + 1;
        groupIndex += 1;
    }

    if (!newIncomeStatementItemType) newIncomeStatementItemType = "unknown";

    if (newIndex === 0) {
        origNewIndex = 0;
    } else {
        let start = 1;
        const expenseFilter = (expense: SortableIncomeStatementItem) => expense[sortableIndex] === newIndex - start;
        while (origNewIndex === -1 && (newIndex - start) > 0) {
            origNewIndex = _.indexOf(expensesSorted, _.filter(expensesSorted, expenseFilter)[0]);
            start += 1;
        }
    }

    if (origNewIndex !== -1) {
        // Special case if you are sliding an item into the bottom of a grouping.
        if (origNewIndex > 0 && origNewIndex < expensesSorted.length && newIndex < oldIndex && expensesSorted[origNewIndex].incomeStatementItemType !== expensesSorted[origNewIndex + 1].incomeStatementItemType) {
            expensesSorted[origOldIndex].incomeStatementItemType = newIncomeStatementItemType;
            if (origOldIndex !== origNewIndex + 1) {
                expensesSorted = arrayMove(expensesSorted, origOldIndex, origNewIndex + 1);
            }
        } else {
            expensesSorted[origOldIndex].incomeStatementItemType = newIncomeStatementItemType;
            expensesSorted = arrayMove(expensesSorted, origOldIndex, origNewIndex);
        }
    } else {
        expensesSorted[origOldIndex].incomeStatementItemType = newIncomeStatementItemType;
    }

    return expensesSorted;
}
