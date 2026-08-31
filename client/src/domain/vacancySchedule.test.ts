import {describe, expect, it} from 'vitest';
import {isUnitOccupiedInYear, sequentialOccupancyYears, vacancyScheduleYears} from './vacancySchedule';

describe('vacancy schedule selectors', () => {
    const unit = {tenancies: [
        {startDate: {$date: '2025-06-01'}, endDate: {$date: '2026-04-30'}},
        {startDate: new Date(2028, 0, 1), endDate: new Date(2028, 11, 31)},
    ]};

    it('keeps the ten-year inclusive year sequence', () => {
        expect(vacancyScheduleYears(2025)).toEqual([2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034]);
    });

    it('treats Mongo-compatible dates as occupied at both period boundaries', () => {
        expect(isUnitOccupiedInYear(unit, 2025)).toBe(true);
        expect(isUnitOccupiedInYear(unit, 2026)).toBe(true);
        expect(isUnitOccupiedInYear(unit, 2027)).toBe(false);
    });

    it('groups consecutive occupied and vacant years into table-cell spans', () => {
        expect(sequentialOccupancyYears(unit, [2025, 2026, 2027, 2028, 2029])).toEqual([
            {start: 2025, end: 2026, occupied: true, period: 2},
            {start: 2027, end: 2027, occupied: false, period: 1},
            {start: 2028, end: 2028, occupied: true, period: 1},
            {start: 2029, end: 2029, occupied: false, period: 1},
        ]);
    });
});
