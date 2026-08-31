export type ComparableSearch = Record<string, unknown>;

export interface ComparableSelectionAppraisal {
    comparableSalesCapRate?: readonly string[] | null;
    comparableSalesDCA?: readonly string[] | null;
}

export interface ComparableSelection {
    _id?: string | null;
}

const twoYearsInMilliseconds = 1000 * 3600 * 24 * 365 * 2;

/** Mirrors the database screens' initial search values without model state. */
export function defaultComparableSearch(dateField: string, propertyType: unknown, now = Date.now()): ComparableSearch {
    const search: ComparableSearch = {[dateField]: new Date(now - twoYearsInMilliseconds)};
    if (propertyType) search.propertyType = propertyType;
    return search;
}

/** Preserves the request precedence: map bounds override form values and sort is last. */
export function comparableSearchRequest(search: ComparableSearch, mapSearch: ComparableSearch, sort: string): ComparableSearch {
    return {...search, ...mapSearch, sort};
}

/**
 * Matches the legacy comparable-model sorter, including its stable treatment
 * of null and undefined values. Screens keep their established +/- sort token.
 */
export function sortComparables<T extends object>(comparables: readonly T[], sort?: string): T[] | readonly T[] {
    if (!sort) return comparables;

    const field = sort.slice(1);
    const sorted = comparables.map((value, index) => ({value, index, criterion: (value as Record<string, unknown>)[field]}))
        .sort((left, right) => {
            // JavaScript's relational operators deliberately retain the legacy
            // mixed-type ordering here; the runtime data can include dates,
            // numbers, nulls, and strings.
            const first = left.criterion as string;
            const second = right.criterion as string;
            if (first !== second) {
                if (first > second || first === undefined) return 1;
                if (first < second || second === undefined) return -1;
            }
            return left.index - right.index;
        })
        .map(({value}) => value);

    return sort.charAt(0) === '-' ? sorted.reverse() : sorted;
}

/** The legacy screens intentionally allow a selected comparable to occur more than once. */
export function addComparableId(ids: readonly string[], id: string): string[] {
    return [...ids, id];
}

/** Removes only the first matching occurrence, matching the existing list mutation. */
export function removeComparableId(ids: readonly string[], id: string): string[] {
    const index = ids.indexOf(id);
    return index === -1 ? [...ids] : [...ids.slice(0, index), ...ids.slice(index + 1)];
}

/** Matches the legacy appraisal membership checks without requiring model methods. */
export function hasComparableSaleInCapRate(appraisal: ComparableSelectionAppraisal, comparable: ComparableSelection): boolean {
    return Boolean(comparable._id && appraisal.comparableSalesCapRate?.includes(comparable._id));
}

/** Matches the legacy appraisal membership checks without requiring model methods. */
export function hasComparableSaleInDCA(appraisal: ComparableSelectionAppraisal, comparable: ComparableSelection): boolean {
    return Boolean(comparable._id && appraisal.comparableSalesDCA?.includes(comparable._id));
}

/** A sale is included when either of the legacy valuation lists contains its id. */
export function hasComparableSale(appraisal: ComparableSelectionAppraisal, comparable: ComparableSelection): boolean {
    return hasComparableSaleInCapRate(appraisal, comparable) || hasComparableSaleInDCA(appraisal, comparable);
}
