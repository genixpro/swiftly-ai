import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import UploadedFileListItem from './UploadedFileListItem';

const mutations = vi.hoisted(() => ({remove: {mutateAsync: vi.fn()}, update: {mutateAsync: vi.fn()}}));

vi.mock('@api/hooks', () => ({
    useDeleteFile: () => mutations.remove,
    useUpdateFile: () => mutations.update,
}));

afterEach(() => {
    vi.restoreAllMocks();
    mutations.remove.mutateAsync.mockReset();
    mutations.update.mutateAsync.mockReset();
});

function renderItem(file = {_id: 'file-1', fileName: 'Statement.pdf', reviewStatus: 'reviewed'}) {
    const handleDeletion = vi.fn();
    const view = render(<table><tbody><UploadedFileListItem
        appraisalId="appraisal-1"
        file={file}
        handleDeletion={handleDeletion}
    /></tbody></table>);
    return {handleDeletion, ...view};
}

describe('UploadedFileListItem', () => {
    it('keeps the established file status and confirmation-driven deletion workflow', async () => {
        mutations.remove.mutateAsync.mockResolvedValue(undefined);
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const file = {_id: 'file-1', fileName: 'Statement.pdf', reviewStatus: 'reviewed'};
        const {handleDeletion} = renderItem(file);

        expect(await screen.findByText('Statement.pdf')).toBeInTheDocument();
        expect(screen.getByText('reviewed')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', {name: 'Remove'}));

        expect(confirm).toHaveBeenCalledWith('Are you sure you want to remove “Statement.pdf”?');
        expect(screen.getByRole('button', {name: 'Removing…'})).toBeDisabled();
        await waitFor(() => expect(mutations.remove.mutateAsync).toHaveBeenCalledWith('file-1'));
        await waitFor(() => expect(handleDeletion).toHaveBeenCalledWith(file));
    });

    it('retains the row and retryable failure message when deletion fails', async () => {
        mutations.remove.mutateAsync.mockRejectedValue(new Error('network unavailable'));
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        renderItem({_id: 'file-2', fileName: 'Lease.pdf', extractionError: 'Could not extract pages'});

        expect(await screen.findByText('Could not extract pages')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', {name: 'Remove'}));

        expect(await screen.findByRole('alert')).toHaveTextContent('The file could not be removed. Please try again.');
        expect(screen.getByRole('button', {name: 'Remove'})).toBeEnabled();
        expect(screen.getByText('Lease.pdf')).toBeInTheDocument();
    });
});
