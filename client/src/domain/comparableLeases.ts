export interface ComparableLeaseRentEscalation {
    yearlyRent?: number | null;
}

export interface ComparableLeaseCalculationInput {
    rentEscalations?: readonly ComparableLeaseRentEscalation[] | null;
}

/** Matches the legacy first-escalation display value, including its zero-as-empty rule. */
export function startingComparableLeaseYearlyRent(lease: ComparableLeaseCalculationInput): number | null | undefined {
    if (lease.rentEscalations && lease.rentEscalations.length > 0 && lease.rentEscalations[0].yearlyRent) {
        return lease.rentEscalations[0].yearlyRent;
    }
    return null;
}

export type ComparableLeaseView<T extends Record<string, unknown>> = T & {
    startingYearlyRent: number | null | undefined;
};

/** Materializes the legacy read-only rent getter for plain draft rendering. */
export function comparableLeaseView<T extends Record<string, unknown>>(lease: T): ComparableLeaseView<T> {
    return {
        ...lease,
        startingYearlyRent: startingComparableLeaseYearlyRent(lease as T & ComparableLeaseCalculationInput),
    };
}
