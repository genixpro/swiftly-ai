import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import IncomeStatementItemRow from './IncomeStatementItemRow';
import type {IncomeStatementEditorController} from './income-statement/types';

vi.mock('./FieldDisplayEdit', () => ({
    DroppableFieldDisplayEdit: ({ariaLabel}: any) => <span aria-label={ariaLabel}/>,
}));

describe('IncomeStatementItemRow', () => {
    it('delegates pointer reordering, keyboard moves, and deletion to the existing editor controller', () => {
        const onSortEnd = vi.fn();
        const moveIncomeItem = vi.fn();
        const removeIncomeItem = vi.fn();
        const item = {name: 'Rent', yearlyAmounts: {2025: 100}, extractionReferences: {}};
        const editor = {
            props: {appraisal: {incomeStatement: {years: [2025]}}, field: 'incomeStatement'},
            state: {pinnedYear: null},
            onSortEnd,
            moveIncomeItem,
            removeIncomeItem,
            onViewExtractionReference: vi.fn(),
            changeIncomeItemName: vi.fn(),
            changeIncomeItemValue: vi.fn(),
            changeIncomeItemPSFValue: vi.fn(),
        };
        const transfer = {
            value: '',
            setData: vi.fn((_: string, value: string) => { transfer.value = value; }),
            getData: vi.fn(() => transfer.value),
        };
        render(<ul><IncomeStatementItemRow editor={editor as unknown as IncomeStatementEditorController} item={item} itemIndex={7} sizeOfBuilding={0}/></ul>);

        const row = screen.getByRole('listitem');
        fireEvent.dragStart(row, {dataTransfer: transfer});
        fireEvent.drop(row, {dataTransfer: transfer});
        expect(onSortEnd).not.toHaveBeenCalled();

        transfer.value = '3';
        fireEvent.drop(row, {dataTransfer: transfer});
        expect(onSortEnd).toHaveBeenCalledWith({oldIndex: 3, newIndex: 7});

        fireEvent.click(screen.getByRole('button', {name: 'Move Rent up'}));
        fireEvent.click(screen.getByRole('button', {name: 'Move Rent down'}));
        fireEvent.click(screen.getByRole('button', {name: 'Delete Rent'}));
        expect(moveIncomeItem).toHaveBeenNthCalledWith(1, item, -1);
        expect(moveIncomeItem).toHaveBeenNthCalledWith(2, item, 1);
        expect(removeIncomeItem).toHaveBeenCalledWith(item);
    });
});
