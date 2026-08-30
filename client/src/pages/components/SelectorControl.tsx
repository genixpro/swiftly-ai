import type {FocusEventHandler, MouseEventHandler, ChangeEventHandler, Ref} from 'react';

export interface SelectorOption {
    value: string;
    label: string;
}

export interface SelectorProps {
    value?: unknown;
    title?: string;
    placeholder?: string;
    disabled?: boolean;
    innerRef?: Ref<HTMLSelectElement> | ((element: HTMLSelectElement | null) => void);
    onChange?(value: string): void;
    onBlur?(): void;
    isSearch?: boolean;
}

interface SelectorControlProps extends SelectorProps {
    options: SelectorOption[];
    ariaLabel?: string;
    className?: string;
    useClick?: boolean;
    notifyUnchanged?: boolean;
    mutedWhenEmpty?: boolean;
}

export default function SelectorControl({
    value,
    title,
    placeholder,
    disabled,
    innerRef,
    onChange,
    onBlur,
    options,
    ariaLabel,
    className = 'form-select',
    useClick = false,
    notifyUnchanged = false,
    mutedWhenEmpty = true,
}: SelectorControlProps) {
    const notify = (nextValue: string) => {
        if (onChange && (notifyUnchanged || nextValue !== value)) onChange(nextValue);
    };
    const handleChange: ChangeEventHandler<HTMLSelectElement> = event => notify(event.target.value);
    const handleClick: MouseEventHandler<HTMLSelectElement> = event => notify(event.currentTarget.value);
    const handleBlur: FocusEventHandler<HTMLSelectElement> = () => onBlur?.();

    return <select
        className={className}
        onChange={useClick ? undefined : handleChange}
        onClick={useClick ? handleClick : undefined}
        onBlur={handleBlur}
        ref={innerRef}
        value={String(value ?? '')}
        title={title || placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        style={mutedWhenEmpty ? {color: !value ? 'lightgrey' : ''} : undefined}
    >
        {options.map(option => <option value={option.value} key={`${option.value}:${option.label}`}>{option.label}</option>)}
    </select>;
}
