import React from 'react';
import _ from 'underscore';
import type {SortableIncomeStatementItem} from './income-statement/sorting';

interface HeaderRowProps {
    children?: React.ReactNode;
    index: number;
    value: string;
}

interface StatementItemRowProps<T extends SortableIncomeStatementItem> {
    index: number;
    value: T;
}

interface NewItemRowProps {
    index: number;
    value: string;
}

interface StatsRowProps {
    field: string;
    index: number;
    name: string;
}

interface IncomeStatementSortableListProps<T extends SortableIncomeStatementItem> {
    groups: Record<string, string>;
    items: T[];
    Header: React.ComponentType<HeaderRowProps>;
    Item: React.ComponentType<StatementItemRowProps<T>>;
    NewItemRow: React.ComponentType<NewItemRowProps>;
    Stats: React.ComponentType<StatsRowProps>;
    sortableIndex: symbol;
}

/**
 * Keeps the legacy group order and list keys while leaving row behavior in the
 * editor's existing renderers.
 */
export default function IncomeStatementSortableList<T extends SortableIncomeStatementItem>({
    groups,
    items,
    Header,
    Item,
    NewItemRow,
    Stats,
    sortableIndex,
}: IncomeStatementSortableListProps<T>) {
    let increment = 0;

    return <ul className={"sortable"}>
        {Object.keys(groups).map((groupType) => {
            const groupItems = _.filter(items, item => item.incomeStatementItemType === groupType);
            const output = [
                <Header key={groupType + "header"} value={groups[groupType]} index={increment}> </Header>,
                groupItems.map((value) => (
                    <Item key={`item-${value[sortableIndex]}`} index={value[sortableIndex]!} value={value}/>
                )),
                <NewItemRow key={groupType + "new"} index={increment + groupItems.length + 1} value={groupType} />,
                <Stats key={groupType + "stats"} name="Totals" index={increment + groupItems.length + 2} field={groupType + "_total"} />,
            ];

            increment += groupItems.length + 3;
            return output;
        })}
    </ul>;
}
