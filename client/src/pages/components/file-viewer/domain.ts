export interface ViewerWordBounds {top: number; bottom: number; left: number; right: number}
export interface ViewerRect {left: number; top: number; width: number; height: number}

export function defaultViewerZoom(words: ReadonlyArray<Partial<ViewerWordBounds>>, viewportHeight: number): number {
    const positionedWords = words.filter((word): word is ViewerWordBounds =>
        Number.isFinite(word.top) && Number.isFinite(word.bottom)
        && Number.isFinite(word.left) && Number.isFinite(word.right),
    );
    if (!positionedWords.length) return 100;
    const averageWordHeight = positionedWords.reduce((total, word) => total + (word.bottom - word.top), 0) / positionedWords.length;
    const averageWordWidth = positionedWords.reduce((total, word) => total + (word.right - word.left), 0) / positionedWords.length;
    const adjustedAverageWordHeight = averageWordWidth * (averageWordWidth / averageWordHeight) * viewportHeight;
    const zoomLevel = (40 / adjustedAverageWordHeight) * 100;
    return Number.isFinite(zoomLevel) ? Math.max(zoomLevel, 75) : 100;
}

export function viewerScrollPosition(
    image: Pick<ViewerRect, 'width' | 'height'>,
    container: Pick<ViewerRect, 'width' | 'height'>,
    imageX: number,
    imageY: number,
    containerX: number,
    containerY: number,
) {
    return {
        innerScrollLeft: imageX * image.width - container.width * containerX,
        innerScrollTop: imageY * image.height - container.height * containerY,
    };
}

export function viewerPointerPosition(
    pageX: number,
    pageY: number,
    rect: ViewerRect,
    scrollX: number,
    scrollY: number,
) {
    return {x: (pageX - rect.left - scrollX) / rect.width, y: (pageY - rect.top - scrollY) / rect.height};
}
