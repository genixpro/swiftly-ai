export interface ComparableStatistics {
    min: number | null;
    max: number | null;
    average: number;
}

/**
 * Mirrors the comparable-card calculation exactly. In particular, zero is a
 * value here; presentation continues to decide whether a zero is shown as
 * `n/a`, as the legacy cards do today.
 */
export function computeComparableStatistics(comparables: ReadonlyArray<Record<string, unknown>>, field: string): ComparableStatistics {
    let min = null as number | null;
    let max = null as number | null;
    let total = 0;
    let count = 0;

    comparables.forEach((comparable) => {
        const value = comparable[field];
        // API payloads are JSON, so the legacy _.isNumber check reduces to
        // primitive numeric values at this boundary.
        if (typeof value === 'number') {
            const numericValue = value as number;
            if (min === null || numericValue < min) min = numericValue;
            if (max === null || numericValue > max) max = numericValue;
            total += numericValue;
            count += 1;
        }
    });

    return {min, max, average: count > 0 ? total / count : 0};
}
