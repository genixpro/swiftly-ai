import {describe, expect, it} from 'vitest';
import {
    completeFieldEdit,
    derivedFieldEditorLabel,
    fieldEditorAccessibleLabel,
    startFieldEdit,
} from './controller';

describe('field editor controller', () => {
    it.each([
        ['currency', 12.5, true, '$12.50'],
        ['number', 12.5, true, '13'],
        ['text', 'Existing value', true, 'Existing value'],
    ])('starts %s editing with the legacy editable display value', (type, value, cents, expected) => {
        expect(startFieldEdit(type, value, cents)).toBe(expected);
    });

    it.each([
        ['currency', '($20.25)', true, -20.25, '($20.25)'],
        ['number', '1,234.99', true, 1234, '1,234'],
        ['tags', null, true, [], []],
        ['text', 'Unchanged', true, 'Unchanged', 'Unchanged'],
    ])('completes %s edits with the existing saved and display values', (type, input, cents, cleanedValue, displayValue) => {
        expect(completeFieldEdit(type, input, cents)).toEqual({cleanedValue, displayValue});
    });

    it('keeps explicit accessibility labels ahead of the derived label', () => {
        expect(fieldEditorAccessibleLabel({ariaLabel: 'Client', title: 'Title', derivedAriaLabel: 'Derived'})).toBe('Client');
        expect(fieldEditorAccessibleLabel({title: 'Title', placeholder: 'Placeholder', derivedAriaLabel: 'Derived'})).toBe('Title');
        expect(fieldEditorAccessibleLabel({placeholder: 'Placeholder', derivedAriaLabel: 'Derived'})).toBe('Placeholder');
        expect(fieldEditorAccessibleLabel({derivedAriaLabel: 'Derived'})).toBe('Derived');
    });

    it('derives the existing label text without its trailing colon', () => {
        expect(derivedFieldEditorLabel(' Amount:  ')).toBe('Amount');
        expect(derivedFieldEditorLabel('')).toBeUndefined();
        expect(derivedFieldEditorLabel(undefined)).toBeUndefined();
    });
});
