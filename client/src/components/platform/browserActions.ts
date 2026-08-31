/** Browser-only side effects used by feature components. */
type LocationBrowser = {location: Pick<Location, 'assign' | 'href'>};

/** Retains the existing document-title updates without exposing document to features. */
export function setBrowserTitle(title: string, browser: Pick<Document, 'title'> = document): void {
    browser.title = title;
}

export function confirmBrowserAction(message: string, browser: Pick<Window, 'confirm'> = window): boolean {
    return browser.confirm(message);
}

/** Retains the existing assign-based report navigation behavior. */
export function navigateBrowserLocation(url: string, browser: LocationBrowser = window): void {
    browser.location.assign(url);
}

/** Retains callers that historically assigned directly to location.href. */
export function setBrowserLocation(url: string, browser: LocationBrowser = window): void {
    browser.location.href = url;
}
