import {render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ClientDropBox from './ClientDropbox';

const hooks = vi.hoisted(() => ({upload: {mutateAsync: vi.fn()}, useUploadFile: vi.fn()}));
vi.mock('@api/hooks', () => ({useUploadFile: hooks.useUploadFile}));
vi.mock('../components/Common/DropzoneCompat', () => ({
    default: ({onDrop, children}) => <button onClick={() => onDrop([new File(['document'], 'lease.pdf')])}>{children}</button>,
}));

describe('client Dropbox workflow characterization', () => {
    it('starts an upload for each selected file and shows the pending indicator', async () => {
        hooks.useUploadFile.mockReturnValue(hooks.upload);
        hooks.upload.mutateAsync.mockReturnValue(new Promise(() => {}));
        const reloadAppraisal = vi.fn();
        render(<ClientDropBox appraisalId="appraisal-1" reloadAppraisal={reloadAppraisal}/>);

        screen.getByRole('button', {name: /drop files here/i}).click();
        await waitFor(() => expect(hooks.useUploadFile).toHaveBeenCalledWith('appraisal-1'));
        expect(hooks.upload.mutateAsync).toHaveBeenCalledWith(expect.any(FormData));
        expect(reloadAppraisal).not.toHaveBeenCalled();
        expect(document.querySelector('.upload-files-loader')).toBeVisible();
    });
});
