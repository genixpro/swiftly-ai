import {describe, expect, it} from 'vitest';
import {defaultViewerZoom, viewerPointerPosition, viewerScrollPosition} from './domain';

describe('file viewer geometry', () => {
    it('retains the legacy OCR-based default zoom and its fallbacks', () => {
        expect(defaultViewerZoom([], 900)).toBe(100);
        expect(defaultViewerZoom([{top: 0.1, bottom: 0.12, left: 0.1, right: 0.2}], 900)).toBeGreaterThanOrEqual(75);
        expect(defaultViewerZoom([{top: 0.1, bottom: 0.1, left: 0.1, right: 0.2}], 900)).toBe(75);
    });

    it('retains pointer anchoring and scroll positioning calculations', () => {
        expect(viewerPointerPosition(250, 150, {left: 100, top: 50, width: 400, height: 200}, 10, 20)).toEqual({x: 0.35, y: 0.4});
        expect(viewerScrollPosition({width: 1_000, height: 800}, {width: 400, height: 300}, .5, .25, .5, .5))
            .toEqual({innerScrollLeft: 300, innerScrollTop: 50});
        expect(viewerScrollPosition({width: 0, height: 0}, {width: 0, height: 0}, Number.NaN, Number.NaN, .5, .5))
            .toEqual({innerScrollLeft: 0, innerScrollTop: 0});
    });
});
