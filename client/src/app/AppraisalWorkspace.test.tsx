import {useAppraisalWorkspace, AppraisalWorkspaceProvider} from './AppraisalWorkspace';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {appraisalsApi} from '@api/resources';
import type {AppraisalDTO} from '@api/types';

const mocks = vi.hoisted(() => ({
    query: {
        data: undefined as Record<string, unknown> | undefined,
        dataUpdatedAt: 0,
        error: null as unknown,
        isLoading: true,
        refetch: vi.fn(),
    },
    updates: {name: 'Changed'} as Record<string, unknown>,
    clearUpdates: vi.fn(),
}));

vi.mock('@api/hooks', () => ({useAppraisal: () => mocks.query}));
vi.mock('@api/resources', () => ({appraisalsApi: {update: vi.fn()}}));
vi.mock('../models/AppraisalModel', () => ({
    default: {
        create: vi.fn((data: Record<string, unknown>) => ({
            ...data,
            getUpdates: () => mocks.updates,
            clearUpdates: mocks.clearUpdates,
        })),
    },
}));

function WorkspaceProbe() {
    const workspace = useAppraisalWorkspace();
    return <>
        <output data-testid="loading">{String(workspace.loading)}</output>
        <output data-testid="name">{workspace.appraisal?.name}</output>
        <output data-testid="save-state">{workspace.saveState}</output>
        <output data-testid="load-error">{workspace.loadError}</output>
        <output data-testid="save-error">{workspace.saveError}</output>
        <button onClick={() => workspace.appraisal && void workspace.save(workspace.appraisal)}>Save</button>
        <button onClick={() => void workspace.retry()}>Retry</button>
    </>;
}

function renderWorkspace() {
    return render(<AppraisalWorkspaceProvider appraisalId="a"><WorkspaceProbe /></AppraisalWorkspaceProvider>);
}

beforeEach(() => {
    mocks.query.data = undefined;
    mocks.query.dataUpdatedAt = 0;
    mocks.query.error = null;
    mocks.query.isLoading = true;
    mocks.query.refetch.mockReset().mockResolvedValue({data: undefined, error: null});
    mocks.updates = {name: 'Changed'};
    mocks.clearUpdates.mockReset();
    vi.mocked(appraisalsApi.update).mockReset();
});

describe('appraisal workspace compatibility facade', () => {
    it('exposes the existing loading and loaded states', async () => {
        const view = renderWorkspace();
        expect(screen.getByTestId('loading')).toHaveTextContent('true');

        mocks.query.data = {_id: 'a', name: 'Loaded'};
        mocks.query.dataUpdatedAt = 1;
        mocks.query.isLoading = false;
        view.rerender(<AppraisalWorkspaceProvider appraisalId="a"><WorkspaceProbe /></AppraisalWorkspaceProvider>);

        await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Loaded'));
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    it('preserves edits on save failure and retries the same draft', async () => {
        mocks.query.data = {_id: 'a', name: 'Loaded'};
        mocks.query.dataUpdatedAt = 1;
        mocks.query.isLoading = false;
        vi.mocked(appraisalsApi.update)
            .mockRejectedValueOnce(new Error('offline'))
            .mockResolvedValueOnce({_id: 'a', name: 'Changed'});
        renderWorkspace();
        await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Loaded'));

        fireEvent.click(screen.getByRole('button', {name: 'Save'}));
        await waitFor(() => expect(screen.getByTestId('save-state')).toHaveTextContent('error'));
        expect(screen.getByTestId('save-error')).toHaveTextContent('still available');

        fireEvent.click(screen.getByRole('button', {name: 'Retry'}));
        await waitFor(() => expect(screen.getByTestId('save-state')).toHaveTextContent('saved'));
        expect(appraisalsApi.update).toHaveBeenCalledTimes(2);
        expect(appraisalsApi.update).toHaveBeenLastCalledWith('a', {name: 'Changed'});
    });

    it('ignores an older save response when a newer request wins', async () => {
        mocks.query.data = {_id: 'a', name: 'Loaded'};
        mocks.query.dataUpdatedAt = 1;
        mocks.query.isLoading = false;
        let resolveFirst!: (value: AppraisalDTO) => void;
        vi.mocked(appraisalsApi.update)
            .mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; }))
            .mockResolvedValueOnce({_id: 'a', name: 'Newest'});
        renderWorkspace();
        await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Loaded'));

        fireEvent.click(screen.getByRole('button', {name: 'Save'}));
        fireEvent.click(screen.getByRole('button', {name: 'Save'}));
        await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Newest'));
        await act(async () => resolveFirst({_id: 'a', name: 'Older'}));
        expect(screen.getByTestId('name')).toHaveTextContent('Newest');
    });
});
