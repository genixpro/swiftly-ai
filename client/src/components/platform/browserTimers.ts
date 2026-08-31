export function setBrowserTimer(callback: () => void, delay?: number): number {
    return window.setTimeout(callback, delay);
}

export function clearBrowserTimer(timer: number): void {
    window.clearTimeout(timer);
}
