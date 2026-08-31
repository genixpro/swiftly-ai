import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import StabilizedStatementEditableRows from './StabilizedStatementEditableRows';

vi.mock('./FieldDisplayEdit', () => ({
    default: ({placeholder, value, onChange}: {
        placeholder: string;
        value?: unknown;
        onChange?(value: unknown): void;
    }) => <button type="button" onClick={() => onChange?.('updated')}>
        {`${placeholder}:${value ?? 'new'}`}
    </button>,
}));

function renderRows(props: Partial<React.ComponentProps<typeof StabilizedStatementEditableRows>> = {}) {
    const onChange = vi.fn();
    const onCreate = vi.fn();
    render(<table><tbody><StabilizedStatementEditableRows
        appraisalType="simple"
        appraisalYear={2025}
        incomeField="incomes"
        label="Income"
        statement={{items: [{name: 'Parking', yearlyAmounts: {2025: 100}}]}}
        onChange={onChange}
        onCreate={onCreate}
        {...props}
    /></tbody></table>);
    return {onChange, onCreate};
}

describe('StabilizedStatementEditableRows', () => {
    it('keeps existing rows before the add row and sends edits through the established callbacks', () => {
        const {onChange, onCreate} = renderRows();

        const controls = screen.getAllByRole('button');
        expect(controls.map((control) => control.textContent)).toEqual([
            'Add/Remove Income:Parking', 'Amount:100', 'Add/Remove Income:new', 'Amount:new',
        ]);

        fireEvent.click(controls[0]);
        fireEvent.click(controls[1]);
        fireEvent.click(controls[2]);
        fireEvent.click(controls[3]);

        expect(onChange).toHaveBeenNthCalledWith(1, 0, 'name', 'updated', 'incomes');
        expect(onChange).toHaveBeenNthCalledWith(2, 0, 'yearlyAmounts', 'updated', 'incomes');
        expect(onCreate).toHaveBeenNthCalledWith(1, 'name', 'updated', 'incomes');
        expect(onCreate).toHaveBeenNthCalledWith(2, 'yearlyAmounts', 'updated', 'incomes');
    });

    it('preserves the detailed-appraisal empty income row only when requested', () => {
        const {rerender} = render(<table><tbody><StabilizedStatementEditableRows
            appraisalType="detailed"
            appraisalYear={2025}
            incomeField="incomes"
            label="Income"
            statement={{items: [{name: 'Hidden', yearlyAmounts: {2025: 100}}]}}
            onChange={vi.fn()}
            onCreate={vi.fn()}
        /></tbody></table>);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();

        rerender(<table><tbody><StabilizedStatementEditableRows
            appraisalType="detailed"
            appraisalYear={2025}
            incomeField="incomes"
            label="Income"
            showEmptyRowWhenHidden={true}
            statement={{items: [{name: 'Hidden', yearlyAmounts: {2025: 100}}]}}
            onChange={vi.fn()}
            onCreate={vi.fn()}
        /></tbody></table>);

        expect(screen.getAllByRole('button').map((control) => control.textContent)).toEqual([
            'Add/Remove Income:new', 'Amount:new',
        ]);
    });
});
