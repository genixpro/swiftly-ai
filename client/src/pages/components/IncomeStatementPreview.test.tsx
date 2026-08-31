import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import IncomeStatementPreview from './IncomeStatementPreview';

vi.mock('./FileSelector', () => ({
    default: ({ariaLabel, defaultFile, value}: {ariaLabel: string; defaultFile: string | null; value: string | null}) => (
        <output aria-label={ariaLabel}>{`${defaultFile}:${value}`}</output>
    ),
}));

describe('IncomeStatementPreview', () => {
    it('keeps the selected source, default page, and highlighted document preview wiring', () => {
        render(<IncomeStatementPreview
            appraisalId="appraisal-1"
            defaultFile={{fileId: 'file-1', page: 2}}
            file={{_id: 'file-1', appraisalId: 'appraisal-1', pages: 2, words: []}}
            hoverReference={{wordIndexes: [0]}}
            pinnedYearActive={false}
            selectedFileId="file-1"
            onFileChanged={vi.fn()}
            onFileViewerRef={vi.fn()}
        />);

        expect(screen.getByLabelText('Preview source file')).toHaveTextContent('file-1:file-1');
        expect(screen.getByRole('img', {name: 'Document preview, page 2'})).toHaveAttribute(
            'src', expect.stringContaining('/files/file-1/rendered-pages/2'),
        );
    });
});
