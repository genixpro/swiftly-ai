export interface RecoveryStructure {
    name?: string | null;
    managementRecoveryMode?: string | null;
    managementRecoveries?: Record<string, number> | null;
    expenseRecoveries?: Record<string, number> | null;
    taxRecoveries?: Record<string, number> | null;
    managementRecoveryOperatingPercentage?: number | null;
    calculatedManagementRecoveryBaseValue?: number | null;
    calculatedManagementRecoveryTotal?: number | null;
    calculatedExpenseRecoveries?: Record<string, number | null | undefined> | null;
    calculatedManagementRecoveries?: Record<string, number | null | undefined> | null;
    calculatedTaxRecoveries?: Record<string, number | null | undefined> | null;
    [field: string]: unknown;
}

export interface RecoveryStructureUnit {
    tenancies?: Array<{recoveryStructure?: string | null; [field: string]: unknown}>;
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

export const defaultRecoveryStructureName = 'Standard';

export function isDefaultRecoveryStructure(recovery: RecoveryStructure): boolean {
    return recovery.name === defaultRecoveryStructureName || recovery.name === 'Default';
}

/** Resolves a unit's recovery structure from plain records with the legacy default fallback. */
export function findRecoveryStructure(
    appraisal: {recoveryStructures?: readonly RecoveryStructure[] | null},
    unit: RecoveryStructureUnit,
): RecoveryStructure | undefined {
    const structures = appraisal.recoveryStructures ?? [];
    const assignedName = currentTenancy(unit as UnitDTO)?.recoveryStructure;
    return structures.find(recovery => recovery.name === assignedName)
        ?? structures.find(isDefaultRecoveryStructure);
}

/** Mirrors the legacy recovery model's unrounded total calculation. */
export function calculatedRecoveryTotal(recovery: RecoveryStructure): number {
    let total = typeof recovery.calculatedManagementRecoveryTotal === 'number'
        ? recovery.calculatedManagementRecoveryTotal
        : 0;
    for (const amount of Object.values(recovery.calculatedExpenseRecoveries ?? {})) {
        total += amount as number;
    }
    for (const amount of Object.values(recovery.calculatedTaxRecoveries ?? {})) {
        total += amount as number;
    }
    return total;
}

/** Creates an editable recovery structure without mutating its source defaults. */
export function createRecoveryStructure(values: RecoveryStructure = {}): RecoveryStructure {
    return {...values};
}

/** Keeps the legacy count-based name (the first custom structure is "1"). */
export function createNumberedRecoveryStructure(defaults: RecoveryStructure, count: number): RecoveryStructure {
    return {...defaults, name: `${defaults.name} ${count}`};
}

export function updateRecoveryStructureField(recovery: RecoveryStructure, field: string, value: unknown): RecoveryStructure {
    return {...recovery, [field]: value};
}

/** Replaces one editable recovery structure without mutating the current list. */
export function replaceRecoveryStructure(
    structures: readonly RecoveryStructure[],
    index: number,
    recovery: RecoveryStructure | undefined,
): Array<RecoveryStructure | undefined> {
    return structures.map((currentRecovery, currentIndex) => currentIndex === index ? recovery : currentRecovery);
}

export function retargetRecoveryStructureUnit(
    unit: RecoveryStructureUnit,
    previousName: unknown,
    nextName: unknown,
): RecoveryStructureUnit {
    const tenancy = currentTenancy(unit as UnitDTO);
    if (!tenancy || tenancy.recoveryStructure !== previousName) return unit;
    return {
        ...unit,
        tenancies: (unit.tenancies ?? []).map(candidate => candidate === tenancy
            ? {...candidate, recoveryStructure: nextName as string | null}
            : candidate),
    };
}

function resetUnitCalculations(unit: RecoveryStructureUnit): RecoveryStructureUnit {
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

export function toggleRecoveryStructureUnit(unit: RecoveryStructureUnit, structureName: unknown): RecoveryStructureUnit {
    const tenancy = currentTenancy(unit as UnitDTO);
    if (!tenancy) return resetUnitCalculations(unit);
    return resetUnitCalculations({
        ...unit,
        tenancies: (unit.tenancies ?? []).map(candidate => candidate === tenancy
            ? {...candidate, recoveryStructure: tenancy.recoveryStructure === structureName
                ? defaultRecoveryStructureName
                : structureName as string}
            : candidate),
    });
}

export function removeRecoveryStructure(
    structures: readonly RecoveryStructure[],
    units: readonly RecoveryStructureUnit[],
    index: number,
): {structures: RecoveryStructure[]; units: RecoveryStructureUnit[]} {
    const removed = structures[index];
    return {
        structures: structures.filter((_, currentIndex) => currentIndex !== index),
        units: units.map((unit) => retargetRecoveryStructureUnit(unit, removed?.name, defaultRecoveryStructureName)),
    };
}
import type {UnitDTO} from '../api/types';
import {currentTenancy} from './appraisal';
