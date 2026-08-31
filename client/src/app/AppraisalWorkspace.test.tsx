import {useAppraisalWorkspace, AppraisalWorkspaceProvider} from './AppraisalWorkspace';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {AppraisalDTO} from '@api/types';

const mocks = vi.hoisted(() => ({
    query: {
        data: undefined as Record<string, unknown> | undefined,
        dataUpdatedAt: 0,
        error: null as unknown,
        isLoading: true,
        refetch: vi.fn(),
    },
    update: vi.fn(),
}));

vi.mock('@api/hooks', () => ({
    useAppraisal: () => mocks.query,
    useUpdateAppraisal: () => ({mutateAsync: mocks.update}),
}));
function WorkspaceProbe() {
    const workspace = useAppraisalWorkspace();
    return <>
        <output data-testid="loading">{String(workspace.loading)}</output>
        <output data-testid="name">{workspace.appraisal?.name}</output>
        <output data-testid="client">{String(workspace.appraisal?.client ?? '')}</output>
        <output data-testid="save-state">{workspace.saveState}</output>
        <output data-testid="load-error">{workspace.loadError}</output>
        <output data-testid="save-error">{workspace.saveError}</output>
        <button onClick={() => workspace.appraisal && void workspace.save(workspace.appraisal)}>Save</button>
        <button onClick={() => {
            if (!workspace.appraisal) return;
            workspace.appraisal.name = 'Changed';
            void workspace.save(workspace.appraisal);
        }}>Edit and save</button>
        <button onClick={() => {
            if (!workspace.appraisal) return;
            const editable = workspace.appraisal as unknown as {incomeStatement: {customYearTitles: Record<number, string>}};
            editable.incomeStatement.customYearTitles[2025] = 'Forecast';
            void workspace.save(workspace.appraisal);
        }}>Edit statement and save</button>
        <button onClick={() => workspace.update({client: 'Typed Client'})}>Update</button>
        <button onClick={() => void workspace.retry()}>Retry</button>
        <button onClick={() => void workspace.reload()}>Reload</button>
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
    mocks.update.mockReset();
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
        mocks.update
            .mockRejectedValueOnce(new Error('offline'))
            .mockResolvedValueOnce({_id: 'a', name: 'Changed'});
        renderWorkspace();
        await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Loaded'));

        fireEvent.click(screen.getByRole('button', {name: 'Edit and save'}));
        await waitFor(() => expect(screen.getByTestId('save-state')).toHaveTextContent('error'));
        expect(screen.getByTestId('save-error')).toHaveTextContent('still available');

        fireEvent.click(screen.getByRole('button', {name: 'Retry'}));
        await waitFor(() => expect(screen.getByTestId('save-state')).toHaveTextContent('saved'));
        expect(mocks.update).toHaveBeenCalledTimes(2);
        expect(mocks.update).toHaveBeenLastCalledWith({name: 'Changed'});
    });

    it('ignores an older save response when a newer request wins', async () => {
        mocks.query.data = {_id: 'a', name: 'Loaded'};
        mocks.query.dataUpdatedAt = 1;
        mocks.query.isLoading = false;
        let resolveFirst!: (value: AppraisalDTO) => void;
        mocks.update
            .mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; }))
            .mockResolvedValueOnce({_id: 'a', name: 'Newest'});
        renderWorkspace();
        await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Loaded'));

        fireEvent.click(screen.getByRole('button', {name: 'Edit and save'}));
        fireEvent.click(screen.getByRole('button', {name: 'Edit and save'}));
        await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Newest'));
        await act(async () => resolveFirst({_id: 'a', name: 'Older'}));
        expect(screen.getByTestId('name')).toHaveTextContent('Newest');
    });

    it('does not send materialized compatibility defaults without an edit', async () => {
        mocks.query.data = {_id: 'a', name: 'Loaded'};
        mocks.query.dataUpdatedAt = 1;
        mocks.query.isLoading = false;
        renderWorkspace();
        await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Loaded'));

        fireEvent.click(screen.getByRole('button', {name: 'Save'}));
        await waitFor(() => expect(screen.getByTestId('save-state')).toHaveTextContent('idle'));
        expect(mocks.update).not.toHaveBeenCalled();
    });

    it('tracks an in-place nested edit in the workspace draft rather than through the compatibility facade', async () => {
        mocks.query.data = {_id: 'a', name: 'Loaded'};
        mocks.query.dataUpdatedAt = 1;
        mocks.query.isLoading = false;
        mocks.update.mockResolvedValue({_id: 'a', name: 'Loaded', incomeStatement: {customYearTitles: {2025: 'Forecast'}}});
        renderWorkspace();
        await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Loaded'));

        fireEvent.click(screen.getByRole('button', {name: 'Edit statement and save'}));
        await waitFor(() => expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
            incomeStatement: expect.objectContaining({customYearTitles: {2025: 'Forecast'}}),
        })));
    });

    it('applies a field update through the workspace before retaining legacy save behavior', async () => {
        mocks.query.data = {_id: 'a', name: 'Loaded', client: 'Before'};
        mocks.query.dataUpdatedAt = 1;
        mocks.query.isLoading = false;
        mocks.update.mockResolvedValue({_id: 'a', name: 'Loaded', client: 'Typed Client'});
        renderWorkspace();
        await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Loaded'));

        fireEvent.click(screen.getByRole('button', {name: 'Update'}));
        expect(screen.getByTestId('client')).toHaveTextContent('Typed Client');
        await waitFor(() => expect(mocks.update).toHaveBeenCalledWith({client: 'Typed Client'}));
    });

    it('reloads through the route query and surfaces a reload failure', async () => {
        mocks.query.data = {_id: 'a', name: 'Loaded'};
        mocks.query.dataUpdatedAt = 1;
        mocks.query.isLoading = false;
        mocks.query.refetch.mockResolvedValue({data: undefined, error: {status: 404}});
        renderWorkspace();
        await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Loaded'));

        fireEvent.click(screen.getByRole('button', {name: 'Reload'}));
        await waitFor(() => expect(screen.getByTestId('load-error')).toHaveTextContent("We couldn't find that appraisal"));
        expect(mocks.query.refetch).toHaveBeenCalledTimes(1);
    });
});
