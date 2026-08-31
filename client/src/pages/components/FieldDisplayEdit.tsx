import React from 'react';
import type {RefCallback} from 'react';
import {useDroppable} from '@dnd-kit/core';
import FieldEditorInput, {type LegacyFieldDisplayEditProps} from './field-editor/FieldEditorInput';
import {
    completeFieldEdit,
    derivedFieldEditorLabel,
    fieldEditorAccessibleLabel,
    startFieldEdit,
} from './field-editor/controller';
import {cleanFieldValue, formatFieldValue, type FieldValueType} from './field-editor/values';

interface FieldDisplayEditProps extends LegacyFieldDisplayEditProps {
    ariaLabel?: string;
    cents?: boolean;
    className?: string;
    dropRef?: RefCallback<HTMLDivElement>;
    hideInput?: boolean;
    /** Legacy compatibility flags retained for existing editor call sites. */
    hideField?: boolean;
    id?: string;
    isOver?: boolean;
    onChange?(value: unknown, sourceWordIndexes?: number[]): void;
    onStartEditing?(): void;
    navigate?: unknown;
    search?: unknown;
}

interface FieldDisplayEditState {
    derivedAriaLabel?: string;
    isEditing: boolean;
    value?: unknown;
}

interface EditorInputElement {
    blur(): void;
    closest?(selectors: string): Element | null;
}

type FieldDisplayEditComponent = ((props: FieldDisplayEditProps) => React.JSX.Element) & {
    cleanValue(type: FieldValueType, value: unknown): unknown;
};

const cleanValue = (type: FieldValueType, value: unknown) => cleanFieldValue(type, value);

function FieldDisplayEditBase(incomingProps: FieldDisplayEditProps) {
    const props = {edit: true, hideInput: true, cents: true, ...incomingProps};
    const [state, setState] = React.useState<FieldDisplayEditState>({isEditing: false});
    const inputElemRef = React.useRef<EditorInputElement | null>(null);
    const sentUpdateRef = React.useRef(false);
    const initialPropsRef = React.useRef(props);

    const updateState = (updates: Partial<FieldDisplayEditState>) => {
        setState((currentState) => ({...currentState, ...updates}));
    };

    const inputUpdated = (newValue: unknown) => {
        updateState({value: newValue});
    };

    const startEditing = () => {
        sentUpdateRef.current = false;
        updateState({value: startFieldEdit(props.type, props.value, props.cents), isEditing: true});
        props.onStartEditing?.();
    };

    const finishEditing = (value = state.value) => {
        if (sentUpdateRef.current) return;
        sentUpdateRef.current = true;
        const completedEdit = completeFieldEdit(props.type, value, props.cents);
        if (props.onChange) {
            updateState({value: completedEdit.displayValue});
            props.onChange(completedEdit.cleanedValue);
        }
        inputElemRef.current?.blur();
        updateState({isEditing: false});
    };

    const dateInputUpdated = (newValue: unknown) => {
        if (newValue || newValue === null) {
            updateState({value: newValue});
            finishEditing(newValue);
        }
    };

    const selectInputUpdated = (newValue: unknown) => {
        updateState({value: newValue});
        finishEditing(newValue);
    };

    const tagInputUpdated = (newValue: unknown) => {
        updateState({value: newValue});
        props.onChange!(cleanValue(props.type, newValue));
    };

    const tenantNameInputUpdated = (newValue: unknown) => {
        updateState({value: newValue});
        props.onChange!(newValue);
    };

    const zoneInputUpdated = (newValue: unknown) => {
        updateState({value: newValue});
        props.onChange!(newValue);
    };

    React.useEffect(() => {
        const initialProps = initialPropsRef.current;
        setState((currentState) => ({
            ...currentState,
            value: formatFieldValue(initialProps.type, initialProps.value, initialProps.cents),
        }));
        const inputElement = inputElemRef.current;
        if (initialProps.ariaLabel || initialProps.title || initialProps.placeholder || !inputElement) return;
        const container = inputElement.closest?.('tr, .comparable-list-boxes, .form-group');
        const labelElement = container && container.querySelector('label, strong, [data-field-label], .field-label, .comparable-list-boxes > span');
        const derivedAriaLabel = derivedFieldEditorLabel(labelElement?.textContent);
        if (derivedAriaLabel) setState((currentState) => ({...currentState, derivedAriaLabel}));
    }, []);

    const editStateClass = state.isEditing ? ' editing' : 'static';
    const customClass = props.className || '';
    const editableClass = props.edit === false ? 'non-editable' : 'editable';
    const hideInput = props.hideInput === false ? 'show-input' : 'hide-input';
    const typeClass = `edit-type-${props.type}`;
    const accessibleLabel = fieldEditorAccessibleLabel({
        ariaLabel: props.ariaLabel,
        title: props.title,
        placeholder: props.placeholder,
        derivedAriaLabel: state.derivedAriaLabel,
    });

    return <div ref={props.dropRef} className={`field-display-edit ${editStateClass} ${customClass} ${editableClass} ${hideInput} ${typeClass}`}>
        <FieldEditorInput
            accessibleLabel={accessibleLabel}
            formatValue={(value) => formatFieldValue(props.type, value, props.cents)}
            inputRef={(inputElement: EditorInputElement | null) => { inputElemRef.current = inputElement; }}
            isEditing={state.isEditing}
            onDateChange={dateInputUpdated}
            onFocus={startEditing}
            onInputChange={inputUpdated}
            onKeyPress={(event) => { if (event.key === 'Enter') finishEditing(); }}
            onSelectChange={selectInputUpdated}
            onTagsChange={tagInputUpdated}
            onTenantNameChange={tenantNameInputUpdated}
            onZoneChange={zoneInputUpdated}
            onBlur={() => finishEditing()}
            props={props}
            value={state.value}
        />
    </div>;
}

const FieldDisplayEdit = FieldDisplayEditBase as FieldDisplayEditComponent;
FieldDisplayEdit.cleanValue = cleanValue;

function DroppableFieldDisplayEdit(props: FieldDisplayEditProps) {
    const uniqueId = React.useId();
    const {setNodeRef} = useDroppable({
        id: props.id || `field-${uniqueId}`,
        data: {onDrop: (item: unknown) => {
            const droppedItem = item as {type?: string; word: {index: number; word: unknown}} | undefined;
            if (droppedItem?.type === 'Word' && (props.type === 'currency' || props.type === 'number' ||
                props.type === 'percent' || props.type === 'length' || props.type === 'area' ||
                props.type === 'acres' || props.type === 'months' || props.type === 'text')) {
                props.onChange!(cleanValue(props.type, droppedItem.word.word), [droppedItem.word.index]);
            }
        }},
    });
    return <FieldDisplayEdit {...props} dropRef={setNodeRef}/>;
}

const NonDroppableFieldDisplayEdit = FieldDisplayEdit;

export default DroppableFieldDisplayEdit;
export {NonDroppableFieldDisplayEdit, DroppableFieldDisplayEdit};
