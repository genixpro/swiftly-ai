import {
    type ComparableSaleEquationValues,
    deriveComparableSaleFields,
} from './comparableSaleEquations';
import {comparableSaleMetrics, type ComparableSaleCalculationInput} from './comparableSales';

/** Immutable editable state for the future non-proxy comparable-sale editor. */
export interface ComparableSaleDraft {
    values: ComparableSaleEquationValues;
    calculatedValues: ComparableSaleEquationValues;
}

export type ComparableSaleDraftAction =
    | {type: 'replace'; values: ComparableSaleEquationValues}
    | {type: 'commit'; draft: ComparableSaleDraft}
    | {type: 'edit'; field: string; value: unknown}
    | {type: 'edit-without-recalculate'; field: string; value: unknown};

/**
 * Maps the editable stabilized display fields back to the persisted source
 * fields, matching the legacy model setters. The calculated display values
 * themselves never belong in a PATCH payload.
 */
function persistedSaleEdit(
    values: ComparableSaleEquationValues,
    field: string,
    value: unknown,
): ComparableSaleEquationValues {
    const stabilizationRate = comparableSaleMetrics(values as ComparableSaleCalculationInput).overallStabilizationRate;

    if (field === 'computedDescriptionText') {
        return {description: value};
    }
    if (field === 'stabilizedNOI') {
        return {netOperatingIncome: value === null ? null : (value as number) / stabilizationRate!};
    }
    if (field === 'stabilizedCapitalizationRate') {
        return {capitalizationRate: value === null ? null : (value as number) * stabilizationRate!};
    }
    if (field === 'stabilizedNOIPSFMultiple') {
        return {noiPSFMultiple: value === null ? null : (value as number) / stabilizationRate!};
    }
    if (field === 'stabilizedNetOperatingIncomePSF') {
        return {netOperatingIncomePSF: value === null ? null : (value as number) / stabilizationRate!};
    }
    if (field === 'stabilizedNOIPerUnit') {
        return {noiPerUnit: value === null ? null : (value as number) / stabilizationRate!};
    }
    if (field === 'stabilizedNOIPerBedroom') {
        return {noiPerBedroom: value === null ? null : (value as number) / stabilizationRate!};
    }
    return {[field]: value};
}

export function createComparableSaleDraft(values: ComparableSaleEquationValues): ComparableSaleDraft {
    return refreshComparableSaleDraft({values, calculatedValues: {}});
}

/** Recalculates a draft without turning an existing field into a user edit. */
export function refreshComparableSaleDraft(draft: ComparableSaleDraft): ComparableSaleDraft {
    return deriveComparableSaleFields(draft.values, draft.calculatedValues);
}

/**
 * Applies one field interaction immediately, then refreshes only values that
 * were previously derived. Manual values remain authoritative by design.
 */
export function comparableSaleDraftReducer(
    draft: ComparableSaleDraft,
    action: ComparableSaleDraftAction,
): ComparableSaleDraft {
    if (action.type === 'replace') return createComparableSaleDraft(action.values);
    if (action.type === 'commit') return action.draft;

    const editedValues = {...draft.values, ...persistedSaleEdit(draft.values, action.field, action.value)};
    if (action.type === 'edit-without-recalculate') {
        return {values: editedValues, calculatedValues: draft.calculatedValues};
    }

    return refreshComparableSaleDraft({
        values: editedValues,
        calculatedValues: draft.calculatedValues,
    });
}
