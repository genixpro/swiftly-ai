import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {forwardRef, useImperativeHandle} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import UploadFiles from './UploadFiles';

const hooks = vi.hoisted(() => ({
    filesQuery: {data: [], refetch: vi.fn()},
    upload: {mutateAsync: vi.fn()},
}));
const dropzoneOpen = vi.hoisted(() => vi.fn());

vi.mock('@api/hooks', () => ({
    useFiles: () => hooks.filesQuery,
    useUploadFile: () => hooks.upload,
}));
vi.mock('../components/Common/DropzoneCompat', () => ({
    default: forwardRef(({children, onDrop, onKeyDown, ...props}, ref) => {
        useImperativeHandle(ref, () => ({open: dropzoneOpen}));
        return <div {...props} onKeyDown={onKeyDown}>{children}<button type="button" onClick={() => onDrop([new File(['one'], 'one.pdf')])}>Mock file drop</button></div>;
    }),
}));
vi.mock('./components/AppraisalContentHeader', () => ({default: ({title}) => <h1>{title}</h1>}));
vi.mock('./components/Checklist', () => ({default: ({files}) => <div data-testid="checklist">{files.length} files</div>}));
vi.mock('./components/UploadedFileList', () => ({default: ({files}) => <div data-testid="file-list">{files.length} files</div>}));

afterEach(() => {
    hooks.filesQuery.data = [];
    hooks.filesQuery.refetch.mockReset().mockResolvedValue({data: []});
    hooks.upload.mutateAsync.mockReset();
    dropzoneOpen.mockReset();
});

function renderPage(overrides = {}) {
    const props = {appraisalId: 'appraisal-1', appraisal: {_id: 'appraisal-1'}, reloadAppraisal: vi.fn(), ...overrides};
    return {props, ...render(<UploadFiles {...props} />)};
}

describe('UploadFiles characterization', () => {
    it('loads files on mount and retains keyboard access to the upload control', async () => {
        hooks.filesQuery.data = [{_id: 'file-1', fileName: 'Rent roll.pdf'}];
        renderPage();

        expect(await screen.findByTestId('checklist')).toHaveTextContent('1 files');
        const uploadControl = screen.getByRole('button', {name: 'Upload appraisal files'});
        fireEvent.keyDown(uploadControl, {key: 'Enter'});
        expect(dropzoneOpen).toHaveBeenCalledOnce();
    });

    it('preserves upload progress, refresh, and appraisal reload on success', async () => {
        hooks.upload.mutateAsync.mockResolvedValue(undefined);
        const {props} = renderPage();
        await screen.findByTestId('file-list');

        fireEvent.click(screen.getByRole('button', {name: 'Mock file drop'}));
        expect(screen.getByRole('status', {name: 'Uploading files'})).toBeInTheDocument();
        await waitFor(() => expect(hooks.upload.mutateAsync).toHaveBeenCalledOnce());
        await waitFor(() => expect(props.reloadAppraisal).toHaveBeenCalledOnce());
        expect(hooks.upload.mutateAsync.mock.calls[0][0]).toBeInstanceOf(FormData);
        expect(hooks.filesQuery.refetch).toHaveBeenCalledOnce();
    });

    it('keeps upload failures visible and refreshes the file list', async () => {
        hooks.upload.mutateAsync.mockRejectedValue(new Error('offline'));
        renderPage();
        await screen.findByTestId('file-list');

        fireEvent.click(screen.getByRole('button', {name: 'Mock file drop'}));
        expect(await screen.findByRole('alert')).toHaveTextContent('One or more files could not be uploaded. Please try again.');
        expect(hooks.filesQuery.refetch).toHaveBeenCalledOnce();
    });
});
