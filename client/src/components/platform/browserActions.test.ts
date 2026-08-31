import {describe, expect, it, vi} from 'vitest';
import {confirmBrowserAction, navigateBrowserLocation, setBrowserLocation, setBrowserTitle} from './browserActions';

describe('browser actions adapter', () => {
    it('preserves confirmation prompts and both established navigation mechanisms', () => {
        const confirm = vi.fn(() => true);
        const assign = vi.fn();
        const setHref = vi.fn();
        const document = {title: ''};
        const browser = {
            confirm,
            location: {
                assign,
                set href(value: string) { setHref(value); },
            },
        };

        expect(confirmBrowserAction('Delete this record?', browser)).toBe(true);
        navigateBrowserLocation('/reports/summary.docx', browser);
        setBrowserLocation('/reports/tenants.docx', browser);
        setBrowserTitle('Appraisals – Swiftly', document);

        expect(confirm).toHaveBeenCalledWith('Delete this record?');
        expect(assign).toHaveBeenCalledWith('/reports/summary.docx');
        expect(setHref).toHaveBeenCalledWith('/reports/tenants.docx');
        expect(document.title).toBe('Appraisals – Swiftly');

    });
});
