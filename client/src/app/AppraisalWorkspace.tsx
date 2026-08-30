import type {PropsWithChildren} from 'react';
import {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {appraisalsApi} from '@api/resources';
import {useAppraisal} from '@api/hooks';
import type {AppraisalDTO} from '@api/types';
import AppraisalModel from '../models/AppraisalModel';
import {normalizeAppraisal} from '../domain/appraisal';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface EditableAppraisal {
    _id: string;
    name?: string;
    appraisalType?: string;
    getUpdates(): Record<string, unknown>;
    clearUpdates(): void;
    [field: string]: unknown;
}

interface AppraisalWorkspaceValue {
    appraisal?: EditableAppraisal;
    loading: boolean;
    loadError: string | null;
    saveState: SaveState;
    saveError: string | null;
    savedAt: Date | null;
    save(appraisal: EditableAppraisal): Promise<void>;
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

function createEditableAppraisal(data: AppraisalDTO): EditableAppraisal {
    return AppraisalModel.create(normalizeAppraisal(data)) as unknown as EditableAppraisal;
}

export function AppraisalWorkspaceProvider({appraisalId, children}: PropsWithChildren<{appraisalId: string}>) {
    const query = useAppraisal(appraisalId);
    const [appraisal, setAppraisal] = useState<EditableAppraisal>();
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [saveError, setSaveError] = useState<string | null>(null);
    const [savedAt, setSavedAt] = useState<Date | null>(null);
    const appliedQueryAt = useRef(0);
    const saveRequestId = useRef(0);

    useEffect(() => {
        setAppraisal(undefined);
        setLoadError(null);
        setSaveState('idle');
        setSaveError(null);
        setSavedAt(null);
        appliedQueryAt.current = 0;
    }, [appraisalId]);

    useEffect(() => {
        if (!query.data || query.dataUpdatedAt <= appliedQueryAt.current) return;
        try {
            setAppraisal(createEditableAppraisal(query.data));
            setLoadError(null);
            appliedQueryAt.current = query.dataUpdatedAt;
        } catch {
            setLoadError('This appraisal could not be opened because its saved data is invalid.');
        }
    }, [query.data, query.dataUpdatedAt]);

    useEffect(() => {
        if (query.error) setLoadError(loadMessage(query.error));
    }, [query.error]);

    const save = useCallback(async (nextAppraisal: EditableAppraisal) => {
        setAppraisal(nextAppraisal);
        setSaveState('saving');
        setSaveError(null);
        const updates = nextAppraisal.getUpdates();
        if (Object.keys(updates).length === 0) {
            setSaveState('idle');
            return;
        }

        const requestId = ++saveRequestId.current;
        try {
            const data = await appraisalsApi.update(appraisalId, updates);
            if (requestId !== saveRequestId.current) return;
            nextAppraisal.clearUpdates();
            setAppraisal(createEditableAppraisal(data));
            setSaveState('saved');
            setSavedAt(new Date());
        } catch {
            if (requestId !== saveRequestId.current) return;
            setSaveState('error');
            setSaveError('Your changes could not be saved. They are still available on this page.');
        }
    }, [appraisalId]);

    const reload = useCallback(async () => {
        setLoadError(null);
        const result = await query.refetch();
        if (result.error) setLoadError(loadMessage(result.error));
    }, [query]);

    const retry = useCallback(async () => {
        if (appraisal) await save(appraisal);
    }, [appraisal, save]);

    return <AppraisalWorkspaceContext.Provider value={{
        appraisal,
        loading: query.isLoading && !appraisal,
        loadError,
        saveState,
        saveError,
        savedAt,
        save,
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
