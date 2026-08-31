import {cleanFieldValue, formatFieldValue, type FieldValueType} from './values';

/**
 * The value transition used by the legacy field editor.  Keeping this pure
 * makes the formatter/cleaner contract independently testable while the
 * existing component retains its focus and event timing.
 */
export interface CompletedFieldEdit {
    cleanedValue: unknown;
    displayValue: unknown;
}

export function startFieldEdit(type: FieldValueType, value: unknown, cents: boolean): unknown {
    return formatFieldValue(type, value, cents);
}

export function completeFieldEdit(type: FieldValueType, value: unknown, cents: boolean): CompletedFieldEdit {
    const cleanedValue = cleanFieldValue(type, value);
    return {
        cleanedValue,
        displayValue: formatFieldValue(type, cleanedValue, cents),
    };
}

export interface FieldEditorLabelOptions {
    ariaLabel?: string;
    title?: string;
    placeholder?: string;
    derivedAriaLabel?: string;
}

export function fieldEditorAccessibleLabel({
    ariaLabel,
    title,
    placeholder,
    derivedAriaLabel,
}: FieldEditorLabelOptions): string | undefined {
    return ariaLabel || title || placeholder || derivedAriaLabel;
}

export function derivedFieldEditorLabel(labelText: string | null | undefined): string | undefined {
    const label = labelText?.replace(/:\s*$/, '').trim();
    return label || undefined;
}
