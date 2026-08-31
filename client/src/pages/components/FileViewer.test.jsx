import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import FileViewer from './FileViewer';

const documentFile = {
    _id: 'file-1',
    appraisalId: 'appraisal-1',
    pages: 2,
    words: [],
    pageTypes: [],
};

describe('FileViewer characterization', () => {
    it('keeps document page controls, image URLs, and page switching', () => {
        render(<FileViewer document={documentFile} />);

        const selector = screen.getByRole('combobox', {name: 'Preview page'});
        expect(selector).toHaveValue('1');
        expect(screen.getByRole('img', {name: 'Document preview, page 1'})).toHaveAttribute('src', expect.stringContaining('/files/file-1/rendered-pages/1'));
        fireEvent.change(selector, {target: {value: '2'}});
        expect(screen.getByRole('img', {name: 'Document preview, page 2'})).toHaveAttribute('src', expect.stringContaining('/files/file-1/rendered-pages/2'));
    });

    it('keeps unavailable and image-error preview recovery states', () => {
        const view = render(<FileViewer document={{...documentFile, pages: 0}} />);
        expect(screen.getByRole('status')).toHaveTextContent('Document preview unavailable. This file has not been rendered yet.');

        view.rerender(<FileViewer document={documentFile} />);
        fireEvent.error(screen.getByRole('img', {name: 'Document preview, page 1'}));
        expect(screen.getByRole('status')).toHaveTextContent('Document preview unavailable. This file has not been rendered yet.');
    });

    it('retains the toolbar zoom increments without changing the active page', () => {
        render(<FileViewer document={documentFile} />);

        fireEvent.click(screen.getByRole('button', {name: 'Zoom document preview in'}));
        expect(document.querySelector('#file-viewer-image-inner-container')).toHaveStyle({width: '125%'});
        expect(screen.getByRole('img', {name: 'Document preview, page 1'})).toBeVisible();

        fireEvent.click(screen.getByRole('button', {name: 'Zoom document preview out'}));
        expect(document.querySelector('#file-viewer-image-inner-container')).toHaveStyle({width: '100%'});
        expect(screen.getByRole('combobox', {name: 'Preview page'})).toHaveValue('1');
    });

    it('retains the legacy default zoom floor and no-OCR fallback', () => {
        expect(FileViewer.computeDefaultZoom({words: []})).toBe(100);
        expect(FileViewer.computeDefaultZoom({words: [{top: 0.1, bottom: 0.12, left: 0.1, right: 0.2}]})).toBeGreaterThanOrEqual(75);
    });
});
