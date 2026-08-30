import {describe, expect, it} from 'vitest';
import {cleanFieldValue, formatFieldValue} from './values';

describe('field value behavior', () => {
    it.each([
        ['currency', 1234.5, true, '$1,234.50'], ['currency', -1234.5, true, '($1,234.50)'],
        ['currency', 1234.5, false, '$1,235'], ['percent', -5, true, '(5.00%)'],
        ['number', 1234.9, true, '1,235'], ['float', 1234.5, true, '1,234.50'],
        ['length', 12.8, true, '13 ft'], ['area', 1200, true, '1,200 sqft'],
        ['acres', 1.25, true, '1.25 ac'], ['months', 3.6, true, '4 months'],
    ])('formats %s without changing display behavior', (type, value, cents, expected) => {
        expect(formatFieldValue(type, value, cents)).toBe(expected);
    });

    it.each([
        ['currency', '($1,234.50)', -1234.5], ['percent', '-5.25%', -5.25],
        ['number', '1,234.99', 1234], ['length', '12.8 ft', 12], ['area', '', null],
        ['tags', null, []], ['text', 'same', 'same'],
    ])('cleans %s edit values into the existing business value', (type, value, expected) => {
        expect(cleanFieldValue(type, value)).toEqual(expected);
    });
});
