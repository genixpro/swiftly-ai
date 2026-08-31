import React from 'react';
import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import {Row, Col} from 'reactstrap';
import {renderedPageUrl} from '@api/client';
import type {FileViewerDocument, FileViewerWord} from './FileViewer';

function DraggableWord({word, wordIndex, hilightWords}: {word: FileViewerWord; wordIndex: number; hilightWords: number[]}) {
    const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
        id: `document-word-${word.page}-${word.index ?? wordIndex}`,
        data: {type: 'Word', word},
    });
    return <div ref={setNodeRef} {...attributes} {...listeners} role="button"
        aria-label={`Extracted text ${word.word || wordIndex + 1}`}
        className={`file-viewer-word ${hilightWords.indexOf(wordIndex) !== -1 ? 'classified' : 'null'} ${isDragging ? 'dragging' : 'null'}`}
        style={{top: `${word.top * 100}%`, left: `${word.left * 100}%`, width: `${word.right * 100 - word.left * 100}%`, height: `${word.bottom * 100 - word.top * 100}%`, transform: CSS.Translate.toString(transform)}}
    />;
}

interface FileViewerPreviewSurfaceProps {
    currentPage: number;
    document: FileViewerDocument;
    hilightWords: number[];
    imageContainerRef: React.RefObject<HTMLDivElement | null>;
    imageRef: React.RefObject<HTMLImageElement | null>;
    pageSelectRef: React.RefObject<HTMLSelectElement | null>;
    imageZoom: number;
    innerScrollLeft: number;
    innerScrollTop: number;
    onChangePage(event: React.ChangeEvent<HTMLSelectElement>): void;
    onImageError(): void;
    onImageMouseDown(event: React.MouseEvent<HTMLImageElement>): void;
    onWheel(event: React.WheelEvent<HTMLDivElement>): void;
    onZoomIn(): void;
    onZoomOut(): void;
    previewAvailable: boolean;
    slowTransition?: boolean;
}

/** Toolbar and document surface, with viewer state and interactions owned by FileViewer. */
export default function FileViewerPreviewSurface({
    currentPage, document, hilightWords, imageContainerRef, imageRef, pageSelectRef, imageZoom, innerScrollLeft, innerScrollTop,
    onChangePage, onImageError, onImageMouseDown, onWheel, onZoomIn, onZoomOut, previewAvailable, slowTransition,
}: FileViewerPreviewSurfaceProps) {
    const pageCount = Number(document.pages || 0);
    return <Row><Col xs={12}>
        {pageCount > 0 ? <div className="extractions-toolbar">
            <div><select value={currentPage} ref={pageSelectRef} onChange={onChangePage} aria-label="Preview page" className="form-select">
                {Array.from({length: pageCount}, (_, index) => index + 1).map(page => <option key={page} value={page}>Page {page}</option>)}
            </select></div>
            <button type="button" className="viewer-toolbar-button icon-button" onClick={onZoomIn} aria-label="Zoom document preview in"><em className="fa-2x fas fa-search-plus" aria-hidden="true" /></button>
            <button type="button" className="viewer-toolbar-button icon-button" onClick={onZoomOut} aria-label="Zoom document preview out"><em className="fa-2x fas fa-search-minus" aria-hidden="true" /></button>
        </div> : null}
        <div className="file-viewer-image-outer-container" id="file-viewer-image-outer-container" ref={imageContainerRef} onWheel={onWheel}>
            {previewAvailable ? <div className={`file-viewer-image-inner-container ${slowTransition ? ' slow-transition' : ''}`} id="file-viewer-image-inner-container" style={{width: `${imageZoom}%`, left: -innerScrollLeft, top: -innerScrollTop}}>
                <img alt={`Document preview, page ${currentPage}`} id="file-viewer-image" ref={imageRef}
                    src={renderedPageUrl(document.appraisalId!, document._id, currentPage)}
                    className={`file-viewer-image frame active ${slowTransition ? 'slow-transition' : ''}`}
                    onError={onImageError} onMouseDown={onImageMouseDown}
                />
                {(document.words ?? []).map((word, wordIndex) => word.page === currentPage ? <DraggableWord key={wordIndex} word={word} wordIndex={wordIndex} hilightWords={hilightWords} /> : null)}
            </div> : <div className="file-viewer-empty" role="status">Document preview unavailable. This file has not been rendered yet.</div>}
        </div>
    </Col></Row>;
}
