import {describe, expect, it} from 'vitest';
import {
    comparableLeaseDraftReducer,
    createComparableLeaseDraft,
    preparedComparableLeaseValues,
} from './comparableLeaseDraft';

describe('comparableLeaseDraftReducer', () => {
    it('applies field edits immutably', () => {
        const initial = createComparableLeaseDraft({_id: 'lease-1', address: 'Original'});
        const edited = comparableLeaseDraftReducer(initial, {type: 'edit', field: 'address', value: 'Updated'});

        expect(edited.values).toMatchObject({_id: 'lease-1', address: 'Updated'});
        expect(initial.values.address).toBe('Original');
    });

    it('adds, updates, and removes rent escalations without mutating prior values', () => {
        const initial = createComparableLeaseDraft({rentEscalations: [{startYear: 1, yearlyRent: 20_000}]});
        const appended = comparableLeaseDraftReducer(initial, {type: 'append-escalation', escalation: {startYear: 2, yearlyRent: 22_000}});
        const edited = comparableLeaseDraftReducer(appended, {type: 'edit-escalation', index: 0, field: 'yearlyRent', value: 21_000});
        const removed = comparableLeaseDraftReducer(edited, {type: 'remove-escalation', index: 1});

        expect(initial.values.rentEscalations).toEqual([{startYear: 1, endYear: null, yearlyRent: 20_000}]);
        expect(appended.values.rentEscalations).toEqual([
            {startYear: 1, endYear: null, yearlyRent: 20_000},
            {startYear: 2, endYear: null, yearlyRent: 22_000},
        ]);
        expect(edited.values.rentEscalations).toEqual([
            {startYear: 1, endYear: null, yearlyRent: 21_000},
            {startYear: 2, endYear: null, yearlyRent: 22_000},
        ]);
        expect(removed.values.rentEscalations).toEqual([{startYear: 1, endYear: null, yearlyRent: 21_000}]);
    });

    it('preserves the legacy net-rent default only when preparing a save payload', () => {
        expect(preparedComparableLeaseValues({address: '10 Main'})).toEqual({address: '10 Main', rentType: 'net'});
        expect(preparedComparableLeaseValues({rentType: 'gross'})).toEqual({rentType: 'gross'});
    });

    it('normalizes omitted model fields and rent-escalation values like the legacy model', () => {
        expect(createComparableLeaseDraft({rentEscalations: [{}]}).values).toMatchObject({
            address: null,
            rentType: null,
            rentEscalations: [{startYear: null, endYear: null, yearlyRent: null}],
        });
    });
});
