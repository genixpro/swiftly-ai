export interface TenancyPeriod {
    startDate?: unknown;
    endDate?: unknown;
}

export interface VacancyScheduleUnit {
    tenancies: ReadonlyArray<TenancyPeriod>;
}

export interface OccupancySequence {
    start: number;
    end: number;
    occupied: boolean;
    period: number;
}

export function vacancyScheduleYears(startYear = new Date().getFullYear()): number[] {
    return Array.from({length: 10}, (_, index) => startYear + index);
}

function tenancyDate(value: unknown): Date {
    if (value instanceof Date) return value;
    if (value && typeof value === 'object' && '$date' in value) {
        return new Date((value as {$date?: string | number | Date}).$date || value as unknown as string);
    }
    return new Date(value as string);
}

export function isUnitOccupiedInYear(unit: VacancyScheduleUnit, year: number): boolean {
    for (const tenancy of unit.tenancies) {
        if (tenancy.startDate && tenancy.endDate) {
            const start = tenancyDate(tenancy.startDate);
            const end = tenancyDate(tenancy.endDate);
            if (year >= start.getFullYear() && year <= end.getFullYear()) return true;
        }
    }
    return false;
}

export function sequentialOccupancyYears(unit: VacancyScheduleUnit, years: ReadonlyArray<number>): OccupancySequence[] {
    const sequences: OccupancySequence[] = [];
    let currentOccupied: OccupancySequence | null = null;
    let currentVacant: OccupancySequence | null = null;
    let lastYear: number | null = null;

    for (const year of years) {
        if (isUnitOccupiedInYear(unit, year)) {
            if (currentVacant !== null) {
                currentVacant.end = lastYear as number;
                sequences.push(currentVacant);
                currentVacant = null;
            }
            if (currentOccupied === null) currentOccupied = {start: year, occupied: true, period: 1, end: year};
            else currentOccupied.period += 1;
        } else {
            if (currentOccupied !== null) {
                currentOccupied.end = lastYear as number;
                sequences.push(currentOccupied);
                currentOccupied = null;
            }
            if (currentVacant === null) currentVacant = {start: year, occupied: false, period: 1, end: year};
            else currentVacant.period += 1;
        }
        lastYear = year;
    }

    if (currentVacant !== null) {
        currentVacant.end = lastYear as number;
        sequences.push(currentVacant);
    }
    if (currentOccupied !== null) {
        currentOccupied.end = lastYear as number;
        sequences.push(currentOccupied);
    }
    return sequences;
}
