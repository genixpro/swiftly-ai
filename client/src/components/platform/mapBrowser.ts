/** Returns the configured maps key while keeping map components browser-global free. */
export function googleMapsApiKey(): string {
    return window.__SWIFTLY_GOOGLE_MAPS_API_KEY__ || '';
}

/** Preserves the existing fire-and-forget fullscreen request behavior. */
export function requestBrowserFullscreen(element: Pick<HTMLElement, 'requestFullscreen'> | null): void {
    element?.requestFullscreen();
}

/** Preserves the existing fire-and-forget fullscreen exit behavior. */
export function exitBrowserFullscreen(): void {
    document.exitFullscreen();
}
