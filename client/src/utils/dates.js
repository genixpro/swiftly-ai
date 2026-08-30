import { addMonths, format, isValid, parseISO } from 'date-fns';

const LEGACY_FORMATS = {
    LL: 'MMMM d, yyyy',
    'MMMM YYYY': 'MMMM yyyy',
    'M/YY': 'M/yy',
    'YYYY-MM-DD': 'yyyy-MM-dd',
    'MMM YYYY': 'MMM yyyy',
    'MMMM D, YYYY': 'MMMM d, yyyy',
    'MMMM DD, YYYY': 'MMMM dd, yyyy',
};

export function toLocalDate(value) {
    if (value instanceof Date) return new Date(value.getTime());
    if (value && typeof value === 'object' && '$date' in value) return toLocalDate(value.$date);
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    if (typeof value === 'string') return parseISO(value);
    return new Date(value);
}

export function formatDate(value, pattern = 'LL') {
    if (value == null || value === '') return '';
    const date = toLocalDate(value);
    return isValid(date) ? format(date, LEGACY_FORMATS[pattern] || pattern) : '';
}

export function eachMonthInclusive(startValue, endValue) {
    const end = toLocalDate(endValue);
    const months = [];
    for (let current = toLocalDate(startValue); current <= end; current = addMonths(current, 1)) {
        months.push(current);
    }
    return months;
}
