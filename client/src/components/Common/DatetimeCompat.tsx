import type {ChangeEvent, InputHTMLAttributes} from 'react';

interface FormattableDate {
    format(pattern: string): string;
}

export type DateValue = Date | FormattableDate | string | null | undefined;

interface DatetimeCompatProps {
    closeOnSelect?: boolean;
    dateFormat?: string;
    input?: boolean;
    value?: DateValue;
    onBlur?(): void;
    onChange?(value: {toDate(): Date} | ''): void;
    inputProps?: InputHTMLAttributes<HTMLInputElement>;
    timeFormat?: boolean;
    title?: string;
    utc?: boolean;
    viewDate?: DateValue;
}

// React 18-safe replacement for the retired datetime widget.
export default function DatetimeCompat({value, onChange, inputProps = {}}: DatetimeCompatProps) {
    let rendered = '';
    if (value && typeof (value as FormattableDate).format === 'function') rendered = (value as FormattableDate).format('YYYY-MM-DD');
    else if (value instanceof Date && !Number.isNaN(value.getTime())) rendered = value.toISOString().slice(0, 10);
    else if (typeof value === 'string') rendered = value.slice(0, 10);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = event.target.value;
        onChange?.(nextValue ? {toDate: () => new Date(`${nextValue}T00:00:00.000Z`)} : '');
    };

    return <input type="date" value={rendered} onChange={handleChange} {...inputProps} />;
}
