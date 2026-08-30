export type FieldValueType = 'currency' | 'number' | 'float' | 'percent' | 'text' | 'textbox' | 'length' | 'area' | 'acres' | 'months' | 'tags' | string | undefined;

function numberWithCommas(value: string | number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatFieldValue(type: FieldValueType, value: unknown, cents = true): unknown {
    if (value === '' || value === undefined || value === null) return '';
    if (type === 'currency') {
        const amount = Number(value);
        const formatted = numberWithCommas(Math.abs(amount).toFixed(cents ? 2 : 0));
        return amount < 0 ? `($${formatted})` : `$${formatted}`;
    }
    if (type === 'percent') {
        const amount = Number(value);
        const formatted = numberWithCommas(Math.abs(amount).toFixed(2));
        return amount < 0 ? `(${formatted}%)` : `${formatted}%`;
    }
    const suffixes: Record<string, string> = {length: ' ft', area: ' sqft', acres: ' ac', months: ' months'};
    if (type === 'number' || type === 'float' || type === 'length' || type === 'area' || type === 'acres' || type === 'months') {
        const decimals = type === 'float' || type === 'acres' ? 2 : 0;
        return `${numberWithCommas(Number(value).toFixed(decimals))}${suffixes[type] ?? ''}`;
    }
    return value;
}

export function cleanFieldValue(type: FieldValueType, value: unknown): unknown {
    if (type === 'currency' || type === 'number' || type === 'percent' || type === 'length' || type === 'area' || type === 'acres' || type === 'months') {
        const text = String(value);
        const isNegative = text.includes('-') || text.includes('(') || text.includes(')');
        let cleanText = text.replace(/[^0-9.]/g, '');
        if (type === 'number' || type === 'length' || type === 'area' || type === 'months') cleanText = cleanText.replace(/\.[0-9]*/g, '');
        if (cleanText === '') return null;
        const amount = Number(cleanText);
        return isNegative ? -amount : amount;
    }
    if (type === 'tags' && !value) return [];
    return value;
}
