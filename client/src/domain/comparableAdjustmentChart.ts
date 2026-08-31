export interface ComparableAdjustment {
    name?: string | null;
    adjustmentType?: string | null;
    adjustmentPercentages?: Record<string, number | null | undefined>;
    adjustmentAmounts?: Record<string, number | null | undefined>;
    adjustmentTexts?: Record<string, string | null | undefined>;
    [field: string]: unknown;
}

export interface ComparableAdjustmentComparable {
    _id: string;
    salePrice: number;
}

/** Creates the editable adjustment shape previously materialized by the proxy model. */
export function createComparableAdjustment(values: ComparableAdjustment = {}): ComparableAdjustment {
    return {
        name: null,
        adjustmentType: null,
        adjustmentPercentages: {},
        adjustmentAmounts: {},
        adjustmentTexts: {},
        ...values,
    };
}

/** Applies chart adjustments using the legacy truthy-value semantics. */
export function adjustedComparableSaleAmount(
    comparable: ComparableAdjustmentComparable,
    adjustments: readonly ComparableAdjustment[] | undefined,
): number {
    let salePrice = comparable.salePrice;
    for (const adjustment of adjustments ?? []) {
        if (adjustment.adjustmentType === 'amount') {
            const amount = adjustment.adjustmentAmounts?.[comparable._id];
            if (amount) salePrice += amount;
        }

        if (adjustment.adjustmentType === 'percentage') {
            const percentage = adjustment.adjustmentPercentages?.[comparable._id];
            if (percentage) salePrice += comparable.salePrice * percentage / 100;
        }
    }
    return salePrice;
}
