import {afterEach, describe, expect, it, vi} from 'vitest';
import {deleteComparableSaleWithConfirmation} from './comparableSaleDeletion';

describe('comparable sale deletion adapter', () => {
    afterEach(() => vi.restoreAllMocks());

    it('does nothing when the initial delete confirmation is rejected', () => {
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
        const deleteById = vi.fn();
        const onDelete = vi.fn();

        deleteComparableSaleWithConfirmation({comparableSale: {_id: 'sale-1'}, deleteById, onDelete});

        expect(confirm).toHaveBeenCalledWith('Are you sure you want to delete the comparable?');
        expect(onDelete).not.toHaveBeenCalled();
        expect(deleteById).not.toHaveBeenCalled();
    });

    it('notifies first, deletes the portfolio, then deletes confirmed child records', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        const deleteById = vi.fn().mockResolvedValue(undefined);
        const onDelete = vi.fn();
        const portfolio = {_id: 'portfolio-1', isPortfolioCompilation: true, portfolioLinkedComps: [{_id: 'child-1'}, 'child-2']};

        deleteComparableSaleWithConfirmation({comparableSale: portfolio, deleteById, onDelete});

        expect(onDelete).toHaveBeenCalledWith(portfolio);
        expect(deleteById).toHaveBeenCalledWith('portfolio-1');
        await Promise.resolve();
        expect(deleteById).toHaveBeenCalledWith('child-1');
        expect(deleteById).toHaveBeenCalledWith('child-2');
    });
});
