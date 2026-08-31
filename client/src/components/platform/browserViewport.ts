/** Browser reads kept outside feature components so viewer calculations stay pure. */
export function viewportHeight(): number {
    return window.innerHeight;
}

export function viewportScrollPosition(): {x: number; y: number} {
    return {x: window.scrollX, y: window.scrollY};
}
