import {describe, expect, it} from 'vitest';
import {initialWorkspaceState, workspaceReducer} from './workspaceState';

describe('workspace state reducer', () => {
    const appraisal = {_id: 'a'};

    it('preserves the loading, saving, success, failure, and reset transitions', () => {
        const loaded = workspaceReducer(initialWorkspaceState, {type: 'loaded', appraisal});
        const saving = workspaceReducer(loaded, {type: 'saving', appraisal});
        const failed = workspaceReducer(saving, {type: 'save-error', error: 'offline'});
        const savedAt = new Date('2026-08-30');
        const saved = workspaceReducer(failed, {type: 'saved', appraisal, savedAt});
        expect(failed).toMatchObject({appraisal, saveState: 'error', saveError: 'offline'});
        expect(saved).toMatchObject({appraisal, saveState: 'saved', saveError: null, savedAt});
        expect(workspaceReducer(saved, {type: 'reset'})).toEqual(initialWorkspaceState);
    });
});
