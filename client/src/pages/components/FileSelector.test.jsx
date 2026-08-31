import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import FileSelector from './FileSelector';

const hooks = vi.hoisted(() => ({filesQuery: {data: undefined}, useFiles: vi.fn()}));

vi.mock('@api/hooks', () => ({useFiles: hooks.useFiles}));

beforeEach(() => {
    hooks.filesQuery.data = undefined;
    hooks.useFiles.mockReset().mockImplementation(() => hooks.filesQuery);
});

describe('FileSelector', () => {
    it('selects the first previewable file after loading, while retaining source file labels', async () => {
        hooks.filesQuery.data = [
            {_id: 'scan-only', fileName: 'Scan only.pdf', pages: 0},
            {_id: 'preview', fileName: 'Preview.pdf', pages: 2},
        ];
        const onChange = vi.fn();
        render(<FileSelector appraisalId="appraisal-1" value="" onChange={onChange} />);

        expect(screen.getByRole('option', {name: 'Preview.pdf'})).toBeInTheDocument();
        expect(hooks.useFiles).toHaveBeenCalledWith('appraisal-1');
        expect(onChange).toHaveBeenCalledWith('preview');
    });

    it('uses the matching default file even when it is not previewable', async () => {
        hooks.filesQuery.data = [
            {_id: 'scan-only', fileName: 'Scan only.pdf', pages: 0},
            {_id: 'preview', fileName: 'Preview.pdf', pages: 2},
        ];
        const onChange = vi.fn();
        render(<FileSelector appraisalId="appraisal-1" value="" defaultFile="scan-only" onChange={onChange} />);

        await waitFor(() => expect(onChange).toHaveBeenCalledWith('scan-only'));
    });

    it('retains the existing change and blur guards', async () => {
        hooks.filesQuery.data = [{_id: 'preview', fileName: 'Preview.pdf', pages: 2}];
        const onChange = vi.fn();
        const onBlur = vi.fn();
        render(<FileSelector appraisalId="appraisal-1" value="preview" onChange={onChange} onBlur={onBlur} ariaLabel="Income statement source" />);

        const selector = await screen.findByRole('combobox', {name: 'Income statement source'});
        expect(onChange).not.toHaveBeenCalled();
        fireEvent.change(selector, {target: {value: ''}});
        fireEvent.change(selector, {target: {value: 'preview'}});
        fireEvent.blur(selector);
        expect(onChange).not.toHaveBeenCalled();
        expect(onBlur).toHaveBeenCalledOnce();
    });
});
