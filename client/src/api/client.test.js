import {afterEach, describe, expect, it, vi} from 'vitest';

afterEach(() => {
    delete globalThis.window;
    vi.resetModules();
});

describe('central API URL construction', () => {
    it('uses the runtime base URL override and canonical resource paths', async () => {
        globalThis.window = {__SWIFTLY_API_BASE_URL__: 'https://swiftly.example.test/internal/'};
        const {apiBaseUrl, fileContentUrl, renderedPageUrl, reportUrl} = await import('./client');

        expect(apiBaseUrl).toBe('https://swiftly.example.test/internal');
        expect(fileContentUrl('appraisal id', 'file/id')).toBe(
            'https://swiftly.example.test/internal/appraisals/appraisal%20id/files/file%2Fid/content',
        );
        expect(renderedPageUrl('appraisal id', 'file/id', 3)).toBe(
            'https://swiftly.example.test/internal/appraisals/appraisal%20id/files/file%2Fid/rendered-pages/3',
        );
        expect(reportUrl('appraisal id', 'rent_roll', 'excel')).toBe(
            'https://swiftly.example.test/internal/appraisals/appraisal%20id/reports/rent_roll?format=xlsx',
        );
    });
});
