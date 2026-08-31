import type {ComponentPropsWithoutRef, ReactNode} from 'react';
import {formatDate, type DateInput} from '../../utils/dates';

interface MomentDisplayProps extends Omit<ComponentPropsWithoutRef<'time'>, 'children'> {
    children?: ReactNode;
    date?: DateInput;
    value?: DateInput;
    format?: string;
}

/** Compatibility-shaped date display while callers move to the shared formatter. */
export default function MomentDisplay({children, date, value, format, ...props}: MomentDisplayProps) {
    const source = date ?? value ?? children;
    const rendered = formatDate(source as DateInput, format || 'LL');
    return <time {...props}>{rendered}</time>;
}
