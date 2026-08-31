import {afterEach, describe, expect, it, vi} from 'vitest';
import {closedMapPinState, mapPinDragState, toggledMapPinState} from './mapPin';

describe('map pin browser adapter', () => {
    afterEach(() => vi.restoreAllMocks());

    it('preserves pointer offsets relative to the map container', () => {
        vi.spyOn(document, 'getElementById').mockReturnValue({
            getBoundingClientRect: () => ({left: 100, top: 50}),
        } as unknown as HTMLElement);
        vi.spyOn(window, 'scrollX', 'get').mockReturnValue(20);

        expect(mapPinDragState({pageX: 200, pageY: 300})).toEqual({
            droppingPinX: 92.5,
            droppingPinY: 247,
            isDraggingPin: true,
        });
    });

    it('keeps map-pin close and toggle state transitions unchanged', () => {
        expect(closedMapPinState()).toEqual({isDraggingPin: false});
        expect(toggledMapPinState(false)).toEqual({isDraggingPin: false, placePinOnMapPopoverOpen: true});
        expect(toggledMapPinState(true)).toEqual({placePinOnMapPopoverOpen: false});
    });
});
