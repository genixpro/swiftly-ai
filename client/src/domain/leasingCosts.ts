export interface LeasingCostStructure {
    name?: string | null;
    isDefault?: boolean;
    leasingCommissionMode?: 'psf' | 'percent_of_rent' | string;
    leasingCommissionPSF?: number | null;
    leasingCommissionPercentYearOne?: number | null;
    leasingCommissionPercentRemainingYears?: number | null;
    tenantInducementsPSF?: number | null;
    renewalPeriod?: number | null;
    leasingPeriod?: number | null;
    [field: string]: unknown;
}

export interface LeasingCostUnit {
    leasingCostStructure?: string | null;
    shouldTreatAsVacant?: boolean | null;
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

export const defaultLeasingCostStructureName = 'Standard';

export function isDefaultLeasingCostStructure(structure: LeasingCostStructure): boolean {
    return structure.name === defaultLeasingCostStructureName || structure.name === 'Default';
}

/** Creates an editable leasing-cost record without mutating supplied defaults. */
export function createLeasingCostStructure(values: LeasingCostStructure = {}): LeasingCostStructure {
    return {...values};
}

/** Keeps the legacy count-based name (the first custom structure is "1"). */
export function createNumberedLeasingCostStructure(defaults: LeasingCostStructure, count: number): LeasingCostStructure {
    return {...defaults, name: `${defaults.name} ${count}`};
}

export function updateLeasingCostField(structure: LeasingCostStructure, field: string, value: unknown): LeasingCostStructure {
    return {...structure, [field]: value};
}

/** Replaces one editable structure while retaining every other list entry by reference. */
export function replaceLeasingCostStructure(
    structures: readonly LeasingCostStructure[],
    index: number,
    structure: LeasingCostStructure,
): LeasingCostStructure[] {
    return structures.map((currentStructure, currentIndex) =>
        currentIndex === index ? structure : currentStructure,
    );
}

export function retargetLeasingCostUnit(unit: LeasingCostUnit, previousName: unknown, nextName: unknown): LeasingCostUnit {
    return unit.leasingCostStructure === previousName ? {...unit, leasingCostStructure: nextName as string | null} : unit;
}

function resetUnitCalculations(unit: LeasingCostUnit): LeasingCostUnit {
    return {
        ...unit,
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

export function toggleLeasingCostUnit(unit: LeasingCostUnit, structureName: unknown): LeasingCostUnit {
    return resetUnitCalculations({
        ...unit,
        leasingCostStructure: unit.leasingCostStructure === structureName ? defaultLeasingCostStructureName : structureName as string,
    });
}

export function toggleTreatAsVacant(unit: LeasingCostUnit): LeasingCostUnit {
    return resetUnitCalculations({...unit, shouldTreatAsVacant: !isVacant(unit as UnitDTO)});
}

export function removeLeasingCostStructure(
    structures: readonly LeasingCostStructure[],
    units: readonly LeasingCostUnit[],
    index: number,
): {structures: LeasingCostStructure[]; units: LeasingCostUnit[]} {
    const removed = structures[index];
    return {
        structures: structures.filter((_, currentIndex) => currentIndex !== index),
        units: units.map((unit) => retargetLeasingCostUnit(unit, removed?.name, defaultLeasingCostStructureName)),
    };
}
import {isVacant} from './appraisal';
import type {UnitDTO} from '../api/types';
