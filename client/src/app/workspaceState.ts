import type {EditableAppraisal, SaveState} from './AppraisalWorkspace';

export interface WorkspaceState {
    appraisal?: EditableAppraisal;
    loadError: string | null;
    saveState: SaveState;
    saveError: string | null;
    savedAt: Date | null;
}

export const initialWorkspaceState: WorkspaceState = {
    appraisal: undefined, loadError: null, saveState: 'idle', saveError: null, savedAt: null,
};

export type WorkspaceAction =
    | {type: 'reset'}
    | {type: 'loaded'; appraisal: EditableAppraisal}
    | {type: 'clear-load-error'}
    | {type: 'load-error'; error: string}
    | {type: 'saving'; appraisal: EditableAppraisal}
    | {type: 'idle'}
    | {type: 'saved'; appraisal: EditableAppraisal; savedAt: Date}
    | {type: 'save-error'; error: string};

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
    switch (action.type) {
        case 'reset': return initialWorkspaceState;
        case 'loaded': return {...state, appraisal: action.appraisal, loadError: null};
        case 'clear-load-error': return {...state, loadError: null};
        case 'load-error': return {...state, loadError: action.error};
        case 'saving': return {...state, appraisal: action.appraisal, saveState: 'saving', saveError: null};
        case 'idle': return {...state, saveState: 'idle'};
        case 'saved': return {...state, appraisal: action.appraisal, saveState: 'saved', saveError: null, savedAt: action.savedAt};
        case 'save-error': return {...state, saveState: 'error', saveError: action.error};
    }
}
