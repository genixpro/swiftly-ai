import _ from 'underscore';

/** Statement rows retain a transient symbol-backed position during sorting. */
export interface SortableIncomeStatementItem {
    incomeStatementItemType?: string | null;
    [field: string]: unknown;
    [sortableIndex: symbol]: number | undefined;
}

export type IncomeStatementSortResult = {
    sorted: SortableIncomeStatementItem[];
} & Record<string, number | SortableIncomeStatementItem[]>;

export function sortIncomeStatementItems(
    items: SortableIncomeStatementItem[],
    groups: Record<string, unknown>,
    sortableIndex: symbol,
): IncomeStatementSortResult {
    let sorted: SortableIncomeStatementItem[] = [];
    let index = 0;
    const others = _.filter(items, item => Object.keys(groups).indexOf(item.incomeStatementItemType as string) === -1);
    const result = {sorted: []} as IncomeStatementSortResult;

    Object.keys(groups).forEach(groupType => {
        index += 1;
        const groupItems = _.filter(items, item => item.incomeStatementItemType === groupType);
        groupItems.forEach(item => {
            item[sortableIndex] = index;
            index += 1;
        });
        index += 2;
        sorted = sorted.concat(groupItems);
        result[groupType] = groupItems.length;
    });

    index += 1;
    others.forEach(item => {
        item[sortableIndex] = index;
        index += 1;
    });
    result.others = others.length;
    result.sorted = sorted.concat(others);
    return result;
}
