import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import IncomeStatementNewItemRow from './IncomeStatementNewItemRow';
import type {IncomeStatementEditorController} from './income-statement/types';

vi.mock('./FieldDisplayEdit', () => ({
    DroppableFieldDisplayEdit: ({ariaLabel, onChange}: any) => <button type="button" aria-label={ariaLabel} onClick={() => onChange?.('Created name')}/>,
}));

describe('IncomeStatementNewItemRow', () => {
    it('keeps one-shot name creation and the existing add-item affordance', () => {
        const createNewIncomeItem = vi.fn();
        const editor = {
            props: {appraisal: {_id: 'appraisal-1', incomeStatement: {years: [2025]}}, field: 'incomeStatement'},
            state: {pinnedYear: null},
            renderHiddenHandleColumn: () => null,
            createNewIncomeItem,
            cleanNumericalValue: vi.fn(),
        };
        render(<ul><IncomeStatementNewItemRow editor={editor as unknown as IncomeStatementEditorController} incomeStatementItemType="income" sizeOfBuilding={0}/></ul>);

        const newName = screen.getByRole('button', {name: 'New income name'});
        fireEvent.click(newName);
        fireEvent.click(newName);
        expect(createNewIncomeItem).toHaveBeenCalledTimes(1);
        expect(createNewIncomeItem).toHaveBeenCalledWith('name', 'Created name', 'income');

        fireEvent.click(screen.getByRole('button', {name: 'Add income expense'}));
        expect(createNewIncomeItem).toHaveBeenLastCalledWith(null, null, 'income');
    });
});
