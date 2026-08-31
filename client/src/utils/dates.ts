import {addMonths, format, isValid, parseISO} from 'date-fns';

const LEGACY_FORMATS: Record<string, string> = {
    LL: 'MMMM d, yyyy',
    'MMMM YYYY': 'MMMM yyyy',
    'M/YY': 'M/yy',
    'YYYY-MM-DD': 'yyyy-MM-dd',
    'MMM YYYY': 'MMM yyyy',
    'MMMM D, YYYY': 'MMMM d, yyyy',
    'MMMM DD, YYYY': 'MMMM dd, yyyy',
};

interface MongoDateValue {
    $date: DateInput;
}

export type DateInput = Date | string | number | MongoDateValue | null | undefined;

export function toLocalDate(value: DateInput): Date {
    if (value instanceof Date) return new Date(value.getTime());
    if (value && typeof value === 'object' && '$date' in value) return toLocalDate(value.$date);
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    if (typeof value === 'string') return parseISO(value);
    return new Date(value ?? Number.NaN);
}

export function formatDate(value: DateInput, pattern = 'LL'): string {
    if (value == null || value === '') return '';
    const date = toLocalDate(value);
    return isValid(date) ? format(date, LEGACY_FORMATS[pattern] || pattern) : '';
}

export function eachMonthInclusive(startValue: DateInput, endValue: DateInput): Date[] {
    const end = toLocalDate(endValue);
    const months: Date[] = [];
    for (let current = toLocalDate(startValue); current <= end; current = addMonths(current, 1)) {
        months.push(current);
    }
    return months;
}
