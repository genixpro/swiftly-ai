import {afterEach, describe, expect, it, vi} from 'vitest';
import {clearBrowserTimer, setBrowserTimer} from './browserTimers';

describe('browser timer adapter', () => {
    afterEach(() => vi.useRealTimers());

    it('schedules callbacks and can cancel them', () => {
        vi.useFakeTimers();
        const run = vi.fn();
        const cancelled = vi.fn();
        setBrowserTimer(run, 10);
        const cancelledTimer = setBrowserTimer(cancelled, 10);
        clearBrowserTimer(cancelledTimer);

        vi.advanceTimersByTime(10);
        expect(run).toHaveBeenCalledOnce();
        expect(cancelled).not.toHaveBeenCalled();
    });
});
