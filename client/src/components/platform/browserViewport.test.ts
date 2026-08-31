import {describe, expect, it, vi} from 'vitest';
import {viewportHeight, viewportScrollPosition} from './browserViewport';

describe('browser viewport adapter', () => {
    it('returns the browser viewport reads used by the document viewer', () => {
        vi.stubGlobal('innerHeight', 844);
        vi.stubGlobal('scrollX', 12);
        vi.stubGlobal('scrollY', 34);

        expect(viewportHeight()).toBe(844);
        expect(viewportScrollPosition()).toEqual({x: 12, y: 34});
    });
});
