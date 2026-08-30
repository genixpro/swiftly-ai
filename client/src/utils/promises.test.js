import { describe, expect, it } from 'vitest';
import { mapConcurrent, mapSeries } from './promises';

describe('promise utilities', () => {
    it('runs ordered work sequentially', async () => {
        const events = [];
        const result = await mapSeries([1, 2, 3], async (value) => {
            events.push(`start-${value}`);
            await Promise.resolve();
            events.push(`end-${value}`);
            return value * 2;
        });
        expect(events).toEqual(['start-1', 'end-1', 'start-2', 'end-2', 'start-3', 'end-3']);
        expect(result).toEqual([2, 4, 6]);
    });

    it('collects concurrent results in input order', async () => {
        await expect(mapConcurrent([1, 2], async (value) => value * 2)).resolves.toEqual([2, 4]);
    });
});
