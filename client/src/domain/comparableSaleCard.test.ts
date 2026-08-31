import {describe, expect, it} from 'vitest';
import {
    addComparableSalePortfolioEntry,
    comparableSaleMapParams,
    removeComparableSalePortfolioEntry,
    selectComparableSalePortfolioEntry,
} from './comparableSaleCard';

describe('comparable sale card state', () => {
    it('uses the legacy North American map fallback and a sale location when present', () => {
        expect(comparableSaleMapParams({})).toEqual({
            defaultCenter: {lat: 41.3625202, lng: -100.5995477},
            defaultZoom: 5,
        });
        expect(comparableSaleMapParams({location: {coordinates: [-79.4, 43.7]}})).toEqual({
            defaultCenter: {lat: 43.7, lng: -79.4},
            defaultZoom: 12,
        });
    });

    it('adds, selects, and removes portfolio entries without mutating the old state', () => {
        const initial = {portfolioComps: [], portfolioDrafts: [], selectedPortfolioComp: -1};
        const added = addComparableSalePortfolioEntry(initial);

        expect(initial).toEqual({portfolioComps: [], portfolioDrafts: [], selectedPortfolioComp: -1});
        expect(added).toMatchObject({
            portfolioComps: [expect.objectContaining({isPartOfPortfolio: true, allowSubCompSearch: false})],
            selectedPortfolioComp: 0,
        });
        expect(selectComparableSalePortfolioEntry(4)).toEqual({selectedPortfolioComp: 4});
        expect(removeComparableSalePortfolioEntry(added, 0)).toEqual({
            portfolioComps: [], portfolioDrafts: [], selectedPortfolioComp: -1,
        });
    });
});
