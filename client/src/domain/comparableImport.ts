import type {ComparableSaleDTO, FileDTO, ImportComparableSalesResult} from '../api/types';

export interface ComparableImportBatch {
    comparableSales: ComparableSaleDTO[];
    file: FileDTO;
}

/** Builds the unchanged multipart envelope consumed by the comparable-sales import endpoint. */
export function comparableImportForm(file: File): FormData {
    const form = new FormData();
    form.set('fileName', file.name);
    form.set('file', file);
    return form;
}

/** Combines successful sequential import responses in the existing file order. */
export function combineComparableImports(results: readonly ImportComparableSalesResult[]): ComparableImportBatch {
    return {
        comparableSales: results.flatMap(result => result.comparableSales),
        file: results[0].file,
    };
}
