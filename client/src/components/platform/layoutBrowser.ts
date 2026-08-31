const mobileNavigationQuery = '(max-width: 767.98px)';
const collapsedAsideStorageKey = 'swiftly-aside-collapsed';

export function mobileNavigationMediaQuery(): MediaQueryList {
    return window.matchMedia(mobileNavigationQuery);
}

export function setLayoutBodyClass(className: string, active: boolean): void {
    document.body.classList.toggle(className, active);
}

export function clearLayoutBodyClass(className: string): void {
    document.body.classList.remove(className);
}

export function focusSidebarNavigation(): void {
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('#app-sidebar a, #app-sidebar button')?.focus());
}

export function restoreCollapsedAside(): void {
    if (window.localStorage.getItem(collapsedAsideStorageKey) === 'true') {
        document.body.classList.add('aside-collapsed');
    }
}

export function toggleCollapsedAside(): boolean {
    const collapsed = document.body.classList.toggle('aside-collapsed');
    window.localStorage.setItem(collapsedAsideStorageKey, String(collapsed));
    window.dispatchEvent(new Event('resize'));
    return collapsed;
}

export function focusElement(element: {focus(): void} | null): void {
    window.requestAnimationFrame(() => element?.focus());
}

export function onEscape(callback: () => void): () => void {
    const listener = (event: KeyboardEvent) => {
        if (event.key === 'Escape') callback();
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
}
