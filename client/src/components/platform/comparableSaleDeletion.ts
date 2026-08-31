import {mapConcurrent} from '@utils/promises';
import {confirmBrowserAction} from './browserActions';

interface ComparableSaleDeletionRecord {
    _id?: string | null;
    isPortfolioCompilation?: boolean | null;
    portfolioLinkedComps?: Array<ComparableSaleDeletionRecord | string>;
}

interface DeleteComparableSaleOptions {
    comparableSale: ComparableSaleDeletionRecord;
    deleteById(id: string): Promise<unknown>;
    onDelete(comparableSale: ComparableSaleDeletionRecord): void;
}

/** Keeps the legacy confirmation sequence and portfolio-child deletion flow. */
export function deleteComparableSaleWithConfirmation({comparableSale, deleteById, onDelete}: DeleteComparableSaleOptions) {
    if (!confirmBrowserAction('Are you sure you want to delete the comparable?')) return;

    const deletePortfolio = comparableSale.isPortfolioCompilation
        ? confirmBrowserAction('Do you want to delete the portfolio sub-comps as well?')
        : false;
    onDelete(comparableSale);

    deleteById(comparableSale._id as string).then(() => {
        if (comparableSale.isPortfolioCompilation && deletePortfolio) {
            mapConcurrent(comparableSale.portfolioLinkedComps ?? [], subComp =>
                deleteById((typeof subComp === 'string' ? subComp : subComp._id) as string));
        }
    });
}
