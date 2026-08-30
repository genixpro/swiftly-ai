import { afterEach, describe, expect, it, vi } from 'vitest';

import BaseModel from './BaseModel';
import StringField from './StringField';


class CompatibilityModel extends BaseModel {
    static label = new StringField();
}


afterEach(() => {
    vi.restoreAllMocks();
});


describe('BaseModel compatibility loading', () => {
    it('keeps unexpected legacy fields non-blocking', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const alert = vi.fn();
        globalThis.alert = alert;

        const model = CompatibilityModel.create({ label: 'Demo', retiredField: 'retained data' });

        expect(model.label).toBe('Demo');
        expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('retiredField'));
        expect(alert).not.toHaveBeenCalled();
    });
});
