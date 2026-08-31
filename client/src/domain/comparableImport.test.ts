import {describe, expect, it} from 'vitest';
import {combineComparableImports, comparableImportForm} from './comparableImport';

describe('comparable import domain helpers', () => {
    it('uses the exact multipart fields expected by the existing import API', () => {
        const file = new File(['sale'], 'comparables.pdf', {type: 'application/pdf'});
        const form = comparableImportForm(file);
        expect(form.get('fileName')).toBe('comparables.pdf');
        expect(form.get('file')).toBe(file);
    });

    it('combines sequential import responses in source-file order', () => {
        const first = {file: {_id: 'file-1', fileName: 'one.pdf'}, comparableSales: [{_id: 'sale-1'}]};
        const second = {file: {_id: 'file-2', fileName: 'two.pdf'}, comparableSales: [{_id: 'sale-2'}]};
        expect(combineComparableImports([first, second])).toEqual({
            file: first.file,
            comparableSales: [{_id: 'sale-1'}, {_id: 'sale-2'}],
        });
    });
});
