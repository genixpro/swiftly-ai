import '@testing-library/jest-dom/vitest';
import {afterEach} from 'vitest';
import {cleanup} from '@testing-library/react';

if (!window.matchMedia) {
    window.matchMedia = (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
    });
}

afterEach(() => {
    cleanup();
    if (typeof window !== 'undefined') window.localStorage.clear();
    document.body.classList.remove('aside-collapsed', 'aside-toggled');
});
