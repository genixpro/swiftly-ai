import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import IncomeStatementSortableList from './IncomeStatementSortableList';

describe('IncomeStatementSortableList', () => {
    it('preserves configured group order and the legacy sortable indexes passed to each row', () => {
        const sortableIndex = Symbol('sortable-index');
        const items = [
            {name: 'Second group', incomeStatementItemType: 'second', [sortableIndex]: 7},
            {name: 'First group', incomeStatementItemType: 'first', [sortableIndex]: 3},
        ];
        const Header = ({value}: any) => <li>{`header:${value}`}</li>;
        const Item = ({value, index}: any) => <li>{`item:${value.name}:${index}`}</li>;
        const NewItemRow = ({value, index}: any) => <li>{`new:${value}:${index}`}</li>;
        const Stats = ({field, index}: any) => <li>{`stats:${field}:${index}`}</li>;

        render(<IncomeStatementSortableList
            groups={{first: 'First', second: 'Second'}}
            items={items}
            Header={Header}
            Item={Item}
            NewItemRow={NewItemRow}
            Stats={Stats}
            sortableIndex={sortableIndex}
        />);

        expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
            'header:First', 'item:First group:3', 'new:first:2', 'stats:first_total:3',
            'header:Second', 'item:Second group:7', 'new:second:6', 'stats:second_total:7',
        ]);
    });
});
