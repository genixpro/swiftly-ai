import { describe, expect, it } from 'vitest';
import { eachMonthInclusive, formatDate, toLocalDate } from './dates';

describe('date utilities', () => {
    it('keeps date-only values on the same local calendar day', () => {
        const date = toLocalDate('2026-03-08');
        expect([date.getFullYear(), date.getMonth() + 1, date.getDate()]).toEqual([2026, 3, 8]);
    });

    it('preserves the legacy display formats', () => {
        expect(formatDate('2026-03-08', 'LL')).toBe('March 8, 2026');
        expect(formatDate('2026-03-08', 'YYYY-MM-DD')).toBe('2026-03-08');
        expect(formatDate('2026-03-08', 'MMM YYYY')).toBe('Mar 2026');
    });

    it('generates inclusive month ranges without mutating inputs', () => {
        expect(eachMonthInclusive('2026-01-31', '2026-03-31').map((date) => formatDate(date, 'YYYY-MM-DD')))
            .toEqual(['2026-01-31', '2026-02-28', '2026-03-28']);
    });
});
