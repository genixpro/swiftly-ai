export interface MarketRent {
    name?: string | null;
    amountPSF?: number | null;
    amount?: number | null;
    [field: string]: unknown;
}

export interface MarketRentUnit {
    marketRent?: string | null;
    calculatedManagementRecovery?: number | null;
    calculatedExpenseRecovery?: number | null;
    calculatedTaxRecovery?: number | null;
    calculatedMarketRentDifferential?: number | null;
    calculatedFreeRentLoss?: number | null;
    calculatedVacantUnitRentLoss?: number | null;
    calculatedVacantUnitLeasupCosts?: number | null;
    calculatedFreeRentMonths?: number | null;
    calculatedFreeRentNetAmount?: number | null;
    [field: string]: unknown;
}

/** Creates an editable market-rent record without proxy-backed field aliases. */
export function createMarketRent(values: MarketRent = {}): MarketRent {
    return {...values};
}

/** Retains the legacy "New Market Rent N" naming rule without mutating defaults. */
export function createNumberedMarketRent(defaults: MarketRent, count: number): MarketRent {
    return {...defaults, name: `${defaults.name} ${count + 1}`};
}

export function updateMarketRentField(marketRent: MarketRent, field: string, value: unknown): MarketRent {
    return {...marketRent, [field]: value};
}

/** Replaces one editable market-rent record without mutating the current list. */
export function replaceMarketRent(marketRents: readonly MarketRent[], index: number, marketRent: MarketRent): MarketRent[] {
    return marketRents.map((currentMarketRent, currentIndex) => currentIndex === index ? marketRent : currentMarketRent);
}

/** Maps a rename to an attached unit while preserving unrelated unit values. */
export function retargetMarketRentUnit(unit: MarketRentUnit, previousName: unknown, nextName: unknown): MarketRentUnit {
    return unit.marketRent === previousName ? {...unit, marketRent: nextName as string | null} : unit;
}

/** Matches the editor's checked/unchecked assignment and calculation reset. */
export function toggleMarketRentUnit(unit: MarketRentUnit, marketRentName: unknown): MarketRentUnit {
    const marketRent = unit.marketRent === marketRentName ? null : marketRentName as string | null;
    return {
        ...unit,
        marketRent,
        calculatedManagementRecovery: null,
        calculatedExpenseRecovery: null,
        calculatedTaxRecovery: null,
        calculatedMarketRentDifferential: null,
        calculatedFreeRentLoss: null,
        calculatedVacantUnitRentLoss: null,
        calculatedVacantUnitLeasupCosts: null,
        calculatedFreeRentMonths: null,
        calculatedFreeRentNetAmount: null,
    };
}

/** Deleting a market rent clears attached units, exactly as the legacy page does. */
export function removeMarketRent(
    marketRents: readonly MarketRent[],
    units: readonly MarketRentUnit[],
    index: number,
): {marketRents: MarketRent[]; units: MarketRentUnit[]} {
    const removed = marketRents[index];
    return {
        marketRents: marketRents.filter((_, currentIndex) => currentIndex !== index),
        units: units.map((unit) => retargetMarketRentUnit(unit, removed?.name, null)),
    };
}
