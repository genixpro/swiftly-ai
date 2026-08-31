import React from 'react';
import {Col, Row} from 'reactstrap';
import FileSelector from './FileSelector';
import FileViewer, {type FileViewerDocument} from './FileViewer';

interface HoverReference {
    wordIndexes?: number[];
}

interface IncomeStatementPreviewProps {
    appraisalId: string;
    defaultFile: {fileId: string | null; page: number};
    file: FileViewerDocument | null | undefined;
    hoverReference?: HoverReference | null;
    pinnedYearActive: boolean;
    selectedFileId?: string;
    onFileChanged: (fileId: string) => void;
    onFileViewerRef: (ref: unknown) => void;
}

/** Presentation-only preview pane; editing state remains in IncomeStatementEditor. */
export default function IncomeStatementPreview({
    appraisalId,
    defaultFile,
    file,
    hoverReference,
    pinnedYearActive,
    selectedFileId,
    onFileChanged,
    onFileViewerRef,
}: IncomeStatementPreviewProps) {
    return <Col xs={12} md={pinnedYearActive ? 7 : 5} lg={pinnedYearActive ? 8 : 5} xl={pinnedYearActive ? 9 : 5} className="income-statement-preview-column">
        <Row className={"file-selector-row"}>
            <Col xs={12}>
                <FileSelector
                    appraisalId={appraisalId}
                    ariaLabel="Preview source file"
                    onChange={onFileChanged}
                    defaultFile={defaultFile.fileId}
                    value={selectedFileId ?? null}
                />
            </Col>
        </Row>
        <Row>
            {file ? <Col xs={12}>
                {React.createElement(FileViewer as never, {
                    ref: onFileViewerRef,
                    document: file,
                    defaultPage: file._id === defaultFile.fileId ? defaultFile.page : 0,
                    hilightWords: hoverReference ? hoverReference.wordIndexes : [],
                })}
            </Col> : null}
        </Row>
    </Col>;
}
