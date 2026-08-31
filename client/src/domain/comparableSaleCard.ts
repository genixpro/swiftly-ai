import {createComparableSaleDraft, type ComparableSaleDraft} from './comparableSaleDraft';
import type {ComparableSaleCalculationInput, ComparableSaleDescriptionInput, ComparableSaleMetrics} from './comparableSales';
import type {ComparableSaleEquationValues} from './comparableSaleEquations';

export const newComparableSaleMarker = Symbol('newSale');

/** Persisted and draft fields shared by comparable-sale cards and portfolios. */
export type ComparableSaleCardRecord = ComparableSaleEquationValues
    & ComparableSaleCalculationInput
    & ComparableSaleDescriptionInput
    & Partial<ComparableSaleMetrics>
    & {
        _id?: string | null;
        allowSubCompSearch?: boolean | null;
        captions?: string[] | null;
        imageUrls?: string[] | null;
        isPartOfPortfolio?: boolean | null;
        isPortfolioCompilation?: boolean | null;
        location?: {coordinates: [number, number]; type?: 'Point'} | null;
        portfolioLinkedComps?: string[];
        propertyTags?: string[] | null;
        shippingDoorsDoubleMan?: number | null;
        shippingDoorsDriveIn?: number | null;
        shippingDoorsTruckLevel?: number | null;
        stabilizedNoiCustomName?: string | null;
        tenancyType?: string | null;
    };

export interface ComparableSalePortfolioState {
    portfolioComps: ComparableSaleCardRecord[];
    portfolioDrafts: ComparableSaleDraft[];
    selectedPortfolioComp: number;
}

/** Keeps the established fallback map viewport for a comparable sale. */
export function comparableSaleMapParams(comparableSale: ComparableSaleCardRecord) {
    const mapParams = {
        defaultCenter: {lat: 41.3625202, lng: -100.5995477},
        defaultZoom: 5,
    };
    if (comparableSale.location) {
        mapParams.defaultCenter.lng = comparableSale.location.coordinates[0];
        mapParams.defaultCenter.lat = comparableSale.location.coordinates[1];
        mapParams.defaultZoom = 12;
    }
    return mapParams;
}

/** Creates and selects a new unsaved portfolio entry without mutating state. */
export function addComparableSalePortfolioEntry(state: ComparableSalePortfolioState): ComparableSalePortfolioState {
    const draft = createComparableSaleDraft({isPartOfPortfolio: true, allowSubCompSearch: false});
    const portfolioComps = [...state.portfolioComps, draft.values as ComparableSaleCardRecord];
    return {
        portfolioComps,
        portfolioDrafts: [...state.portfolioDrafts, draft],
        selectedPortfolioComp: portfolioComps.length - 1,
    };
}

export function selectComparableSalePortfolioEntry(selectedPortfolioComp: number): Pick<ComparableSalePortfolioState, 'selectedPortfolioComp'> {
    return {selectedPortfolioComp};
}

/** Removes one entry and preserves the legacy final-entry selection behavior. */
export function removeComparableSalePortfolioEntry(
    state: ComparableSalePortfolioState,
    portfolioCompIndex: number,
): ComparableSalePortfolioState {
    const portfolioComps = state.portfolioComps.filter((_, index) => index !== portfolioCompIndex);
    return {
        portfolioComps,
        portfolioDrafts: state.portfolioDrafts.filter((_, index) => index !== portfolioCompIndex),
        selectedPortfolioComp: portfolioComps.length > 0 ? portfolioComps.length - 1 : -1,
    };
}
