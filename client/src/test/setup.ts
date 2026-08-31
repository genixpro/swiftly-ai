import '@testing-library/jest-dom/vitest';
import '../i18n';
import {afterEach, beforeEach, vi} from 'vitest';
import {cleanup} from '@testing-library/react';

let unexpectedConsoleMessages: string[] = [];

function recordUnexpectedConsoleMessage(level: 'error' | 'warn', values: unknown[]) {
    unexpectedConsoleMessages.push(`${level}: ${values.map((value) => {
        if (value instanceof Error) return value.stack ?? value.message;
        if (typeof value === 'string') return value;
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }).join(' ')}`);
}

beforeEach(() => {
    unexpectedConsoleMessages = [];
    vi.spyOn(console, 'error').mockImplementation((...values) => recordUnexpectedConsoleMessage('error', values));
    vi.spyOn(console, 'warn').mockImplementation((...values) => recordUnexpectedConsoleMessage('warn', values));
});

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
    vi.restoreAllMocks();
    if (unexpectedConsoleMessages.length > 0) {
        throw new Error(`Unexpected console output:\n${unexpectedConsoleMessages.join('\n')}`);
    }
});
