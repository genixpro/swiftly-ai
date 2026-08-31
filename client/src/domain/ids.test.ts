import {describe, expect, it} from 'vitest';
import {regularizeId} from './ids';

describe('regularizeId', () => {
    it('preserves both legacy API identifier representations', () => {
        expect(regularizeId('zone-1')).toBe('zone-1');
        expect(regularizeId({$oid: 'zone-2'})).toBe('zone-2');
    });

    it('retains the legacy null and malformed-object behavior', () => {
        expect(regularizeId(null)).toBeNull();
        expect(regularizeId('')).toBeNull();
        expect(regularizeId({})).toBeUndefined();
    });
});
