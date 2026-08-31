import {currentTenancy} from './appraisal';

export interface UnitForTotals {
    squareFootage: number;
    stabilizedRentPSF: number;
    stabilizedRent: number;
    tenancies?: Array<{yearlyRent?: number | null; startDate?: string | null; endDate?: string | null}>;
    [field: string]: unknown;
}

/** These calculations deliberately retain the current rent-roll semantics. */
export function totalUnitSize(units: ReadonlyArray<UnitForTotals>): number {
    let total = 0;
    for (const unit of units) total += unit.squareFootage;
    return total;
}

export function averageCurrentRentPSF(units: ReadonlyArray<UnitForTotals>): number {
    let total = 0;
    let count = 0;
    for (const unit of units) {
        const yearlyRent = currentTenancy(unit)?.yearlyRent ?? 0;
        if (yearlyRent !== 0) {
            total += yearlyRent / unit.squareFootage;
            count += 1;
        }
    }
    return total / count;
}

export function averageStabilizedRentPSF(units: ReadonlyArray<UnitForTotals>): number {
    let total = 0;
    let count = 0;
    for (const unit of units) {
        if (unit.stabilizedRentPSF !== 0) {
            total += unit.stabilizedRentPSF;
            count += 1;
        }
    }
    return total / count;
}

export function totalCurrentAnnualRent(units: ReadonlyArray<UnitForTotals>): number {
    let total = 0;
    for (const unit of units) {
        const yearlyRent = currentTenancy(unit)?.yearlyRent ?? 0;
        if (yearlyRent !== 0) total += yearlyRent;
    }
    return total;
}

export function totalStabilizedRent(units: ReadonlyArray<UnitForTotals>): number {
    let total = 0;
    for (const unit of units) total += unit.stabilizedRent;
    return total;
}
