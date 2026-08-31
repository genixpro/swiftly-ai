import type {PropsWithChildren} from 'react';
import {createContext, useCallback, useContext, useEffect, useReducer, useRef} from 'react';
import {useAppraisal, useUpdateAppraisal} from '@api/hooks';
import type {AppraisalDTO} from '@api/types';
import {buildAppraisalPatch, normalizeAppraisal, prepareEditableAppraisal} from '../domain/appraisal';
import {initialWorkspaceState, workspaceReducer} from './workspaceState';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export type EditableAppraisal = AppraisalDTO;

export type AppraisalFieldUpdate = Record<string, unknown>;

function snapshot(value: unknown): string { return JSON.stringify(value); }

function changedTopLevelFields(previousSnapshot: string, appraisal: EditableAppraisal): Record<string, unknown> {
    const previous = JSON.parse(previousSnapshot) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(appraisal).filter(([field, value]) => snapshot(previous[field]) !== snapshot(value)));
}

interface AppraisalWorkspaceValue {
    appraisal?: EditableAppraisal;
    loading: boolean;
    loadError: string | null;
    saveState: SaveState;
    saveError: string | null;
    savedAt: Date | null;
    save(appraisal: EditableAppraisal): Promise<void>;
    update(fields: AppraisalFieldUpdate): void;
    retry(): Promise<void>;
    reload(): Promise<void>;
}

const AppraisalWorkspaceContext = createContext<AppraisalWorkspaceValue | null>(null);

function loadMessage(error: unknown): string {
    const status = typeof error === 'object' && error && 'status' in error ? error.status : undefined;
    return status === 404
        ? "We couldn't find that appraisal. It may have been removed."
        : "We couldn't load this appraisal. Check that the local API is running and try again.";
}

export function AppraisalWorkspaceProvider({appraisalId, children}: PropsWithChildren<{appraisalId: string}>) {
    const query = useAppraisal(appraisalId);
    const updateAppraisal = useUpdateAppraisal(appraisalId, {updateCache: false});
    const [state, dispatch] = useReducer(workspaceReducer, initialWorkspaceState);
    const appliedQueryAt = useRef(0);
    const saveRequestId = useRef(0);
    const persistedAppraisal = useRef<AppraisalDTO | null>(null);
    const pendingFieldValues = useRef<Record<string, unknown>>({});
    const draftSnapshot = useRef('{}');

    useEffect(() => {
        dispatch({type: 'reset'});
        appliedQueryAt.current = 0;
        persistedAppraisal.current = null;
        pendingFieldValues.current = {};
        draftSnapshot.current = '{}';
    }, [appraisalId]);

    useEffect(() => {
        if (!query.data || query.dataUpdatedAt <= appliedQueryAt.current) return;
        try {
            const normalized = normalizeAppraisal(query.data);
            const editable = prepareEditableAppraisal(normalized);
            persistedAppraisal.current = normalized;
            pendingFieldValues.current = {};
            draftSnapshot.current = snapshot(editable);
            dispatch({type: 'loaded', appraisal: editable});
            appliedQueryAt.current = query.dataUpdatedAt;
        } catch {
            dispatch({type: 'load-error', error: 'This appraisal could not be opened because its saved data is invalid.'});
        }
    }, [query.data, query.dataUpdatedAt]);

    useEffect(() => {
        if (query.error) dispatch({type: 'load-error', error: loadMessage(query.error)});
    }, [query.error]);

    const save = useCallback(async (nextAppraisal: EditableAppraisal) => {
        dispatch({type: 'saving', appraisal: nextAppraisal});
        const persisted = persistedAppraisal.current;
        if (!persisted) {
            dispatch({type: 'idle'});
            return;
        }

        // Existing feature views still mutate the editable draft in place.
        // Compare it with the last server value instead of relying on dirty
        // tracking, so every top-level editable change uses the typed PATCH
        // contract.
        const typedPatch = buildAppraisalPatch(persisted, nextAppraisal as AppraisalDTO);
        const dirtyFields = changedTopLevelFields(draftSnapshot.current, nextAppraisal);
        const editedFields = new Set([...Object.keys(dirtyFields), ...Object.keys(pendingFieldValues.current)]);
        // Editable preparation materializes defaults for omitted fields. Only
        // send one when it existed in the persisted DTO or an editor changed
        // it, preserving the established top-level PATCH shape.
        const updates = {
            ...Object.fromEntries(Object.entries(typedPatch)
                .filter(([field]) => field in persisted || editedFields.has(field))),
            ...pendingFieldValues.current,
        };
        if (Object.keys(updates).length === 0) {
            dispatch({type: 'idle'});
            return;
        }

        const requestId = ++saveRequestId.current;
        try {
            const data = await updateAppraisal.mutateAsync(updates);
            if (requestId !== saveRequestId.current) return;
            const normalized = normalizeAppraisal(data);
            const editable = prepareEditableAppraisal(normalized);
            persistedAppraisal.current = normalized;
            pendingFieldValues.current = {};
            draftSnapshot.current = snapshot(editable);
            dispatch({type: 'saved', appraisal: editable, savedAt: new Date()});
        } catch {
            if (requestId !== saveRequestId.current) return;
            dispatch({type: 'save-error', error: 'Your changes could not be saved. They are still available on this page.'});
        }
    }, [appraisalId, updateAppraisal]);

    const update = useCallback((fields: AppraisalFieldUpdate) => {
        if (!state.appraisal) return;
        pendingFieldValues.current = {...pendingFieldValues.current, ...fields};
        Object.assign(state.appraisal, fields);
        void save(state.appraisal);
    }, [state.appraisal, save]);

    const reload = useCallback(async () => {
        dispatch({type: 'clear-load-error'});
        const result = await query.refetch();
        if (result.error) dispatch({type: 'load-error', error: loadMessage(result.error)});
    }, [query]);

    const retry = useCallback(async () => {
        if (state.appraisal) await save(state.appraisal);
    }, [state.appraisal, save]);

    return <AppraisalWorkspaceContext.Provider value={{
        appraisal: state.appraisal,
        loading: query.isLoading && !state.appraisal,
        loadError: state.loadError,
        saveState: state.saveState,
        saveError: state.saveError,
        savedAt: state.savedAt,
        save,
        update,
        retry,
        reload,
    }}>
        {children}
    </AppraisalWorkspaceContext.Provider>;
}

export function useAppraisalWorkspace(): AppraisalWorkspaceValue {
    const value = useContext(AppraisalWorkspaceContext);
    if (!value) throw new Error('useAppraisalWorkspace must be used inside AppraisalWorkspaceProvider.');
    return value;
}
