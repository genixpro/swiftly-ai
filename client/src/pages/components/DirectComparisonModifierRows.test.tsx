import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import DirectComparisonModifierRows from './DirectComparisonModifierRows';

vi.mock('./FieldDisplayEdit', () => ({
    default: ({placeholder, onChange, value}: {placeholder: string; onChange(value: unknown): void; value?: unknown}) => <button type="button" aria-label={placeholder} onClick={() => onChange(value === undefined ? 'New adjustment' : null)}>{placeholder}</button>,
}));

describe('DirectComparisonModifierRows', () => {
    it('keeps existing modifiers before the final add row and forwards their edits', () => {
        const onChange = vi.fn();
        const onCreate = vi.fn();
        render(<table><tbody><DirectComparisonModifierRows
            modifiers={[{name: 'Existing adjustment', amount: 50}]}
            onChange={onChange}
            onCreate={onCreate}
        /></tbody></table>);

        expect(screen.getAllByRole('button', {name: 'Add/Remove'})).toHaveLength(2);
        expect(screen.getAllByRole('button', {name: 'Amount ($)'})).toHaveLength(2);

        fireEvent.click(screen.getAllByRole('button', {name: 'Amount ($)'})[0]);
        expect(onChange).toHaveBeenCalledWith(0, 'amount', null);

        fireEvent.click(screen.getAllByRole('button', {name: 'Add/Remove'})[1]);
        expect(onCreate).toHaveBeenCalledWith('name', 'New adjustment');
    });
});
