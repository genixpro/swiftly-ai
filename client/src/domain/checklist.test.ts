import {describe, expect, it} from 'vitest';
import {checklistFileNames} from './checklist';

describe('checklistFileNames', () => {
    it('keeps data-type and reference order while de-duplicating matching names', () => {
        expect(checklistFileNames({
            RENT_ROLL: [{fileId: 'two'}, {fileId: 'one'}],
            INCOME_STATEMENT: [{fileId: 'three'}],
        }, [
            {_id: 'one', fileName: 'Shared.pdf'},
            {_id: 'two', fileName: 'Rent roll.pdf'},
            {_id: 'three', fileName: 'Shared.pdf'},
        ], ['RENT_ROLL', 'INCOME_STATEMENT'])).toEqual(['Rent roll.pdf', 'Shared.pdf']);
    });

    it('returns no names when references or files are unavailable', () => {
        expect(checklistFileNames({}, [], ['RENT_ROLL'])).toEqual([]);
        expect(checklistFileNames({RENT_ROLL: [{fileId: 'one'}]}, undefined, ['RENT_ROLL'])).toEqual([]);
    });
});
