/**
 * Immutable list transitions used by the rent-roll screen. The view assigns
 * the result to its editable draft and saves immediately, preserving the
 * established editor timing while removing in-place array edits.
 */
export function appendRentRollUnit<T>(units: readonly T[], unit: T): T[] {
    return [...units, unit];
}

export function removeRentRollUnit<T>(units: readonly T[], index: number): T[] {
    return units.filter((_, currentIndex) => currentIndex !== index);
}

export function replaceRentRollUnit<T>(units: readonly T[], index: number, unit: T): T[] {
    return units.map((currentUnit, currentIndex) => currentIndex === index ? unit : currentUnit);
}

export function reorderRentRollUnits<T>(units: readonly T[]): T[] {
    return [...units];
}

export interface RentRollReference {
    fileId?: string;
    pageNumbers?: number[];
}

/** Preserves legacy query decoding without a render-time browser dependency. */
export function rentRollQueryValue(search: string, variable: string): string | undefined {
    const query = search.substring(1);
    for (const value of query.split('&')) {
        const pair = value.split('=');
        if (decodeURIComponent(pair[0]) === variable) return decodeURIComponent(pair[1]);
    }
}

/** Finds the first recorded rent-roll source using the existing priority and page selection. */
export function defaultRentRollSource(references: Record<string, RentRollReference[]>): {fileId: string | null | undefined; page: number | null | undefined} {
    const rentRollReferences = references.RENT_ROLL;
    if (!rentRollReferences?.length) return {fileId: null, page: null};
    return {
        fileId: rentRollReferences[0].fileId,
        page: rentRollReferences[0].pageNumbers?.[0],
    };
}
