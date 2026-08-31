import {browserElementById} from './browserDom';

interface MapPinPointerEvent {
    pageX: number;
    pageY: number;
}

/** Browser boundary for the legacy map-pin drag coordinates. */
export function mapPinDragState(event: MapPinPointerEvent) {
    const mapElement = browserElementById('place-pin-body-wrapper')!;
    const position = mapElement.getBoundingClientRect();
    return {
        droppingPinX: event.pageX + 12.5 - position.left - window.scrollX,
        droppingPinY: event.pageY - 3 - position.top - window.scrollY,
        isDraggingPin: true,
    };
}

export function closedMapPinState() {
    return {isDraggingPin: false};
}

export function toggledMapPinState(open: boolean) {
    return open
        ? {placePinOnMapPopoverOpen: false}
        : {isDraggingPin: false, placePinOnMapPopoverOpen: true};
}
