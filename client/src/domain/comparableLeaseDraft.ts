export const newComparableLeaseMarker = Symbol('newLease');

export interface ComparableLeaseRentEscalationDraft {
    startYear?: number | null;
    endYear?: number | null;
    yearlyRent?: number | null;
    [field: string]: unknown;
}

export interface ComparableLeaseValues {
    _id?: string | null;
    rentType?: string | null;
    rentEscalations?: ComparableLeaseRentEscalationDraft[] | null;
    [field: string]: unknown;
}

/** Shared persisted and draft fields used by comparable-lease cards, lists, and maps. */
export type ComparableLeaseCardRecord = ComparableLeaseValues & {
    location?: {coordinates: [number, number]; type?: 'Point'} | null;
    visible?: boolean;
};

export interface ComparableLeaseDraft {
    values: ComparableLeaseValues;
}

const defaultComparableLeaseValues: ComparableLeaseValues = {
    owner: null,
    address: null,
    imageUrl: null,
    imageUrls: null,
    captions: null,
    propertyType: null,
    sizeOfUnit: null,
    rentEscalations: null,
    description: null,
    leaseDate: null,
    rentType: null,
    tenantName: null,
    propertyTags: null,
    taxesMaintenanceInsurance: null,
    tenantInducements: null,
    freeRent: null,
    freeRentMonths: null,
    freeRentType: null,
    floorNumber: null,
    retailLocationType: null,
    clearCeilingHeight: null,
    finishedOfficePercentage: null,
    shippingDoors: null,
    shippingDoorsTruckLevel: null,
    shippingDoorsDoubleMan: null,
    shippingDoorsDriveIn: null,
    remarks: null,
    tenancyType: null,
};

export type ComparableLeaseDraftAction =
    | {type: 'replace'; values: ComparableLeaseValues}
    | {type: 'edit'; field: string; value: unknown}
    | {type: 'append-escalation'; escalation: ComparableLeaseRentEscalationDraft}
    | {type: 'edit-escalation'; index: number; field: string; value: unknown}
    | {type: 'remove-escalation'; index: number};

export function createComparableLeaseDraft(values: ComparableLeaseValues): ComparableLeaseDraft {
    const rentEscalations = values.rentEscalations
        ? values.rentEscalations.map(escalation => ({startYear: null, endYear: null, yearlyRent: null, ...escalation}))
        : values.rentEscalations;
    return {values: {...defaultComparableLeaseValues, ...values, rentEscalations}};
}

/** Immutable equivalent of the legacy lease card's field and escalation edits. */
export function comparableLeaseDraftReducer(
    draft: ComparableLeaseDraft,
    action: ComparableLeaseDraftAction,
): ComparableLeaseDraft {
    if (action.type === 'replace') return createComparableLeaseDraft(action.values);
    if (action.type === 'edit') return {values: {...draft.values, [action.field]: action.value}};

    const escalations = [...(draft.values.rentEscalations ?? [])];
    if (action.type === 'append-escalation') {
        return {
            values: {
                ...draft.values,
                rentEscalations: [...escalations, {startYear: null, endYear: null, yearlyRent: null, ...action.escalation}],
            },
        };
    }
    if (action.type === 'edit-escalation') {
        if (!escalations[action.index]) return draft;
        escalations[action.index] = {...escalations[action.index], [action.field]: action.value};
        return {values: {...draft.values, rentEscalations: escalations}};
    }

    return {values: {...draft.values, rentEscalations: escalations.filter((_, index) => index !== action.index)}};
}

/** Matches the legacy save-time default without mutating a caller-owned draft. */
export function preparedComparableLeaseValues(values: ComparableLeaseValues): ComparableLeaseValues {
    return values.rentType ? values : {...values, rentType: 'net'};
}
