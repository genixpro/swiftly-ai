import {describe, expect, it} from 'vitest';
import {browserElementById} from './browserDom';

describe('browser DOM adapter', () => {
    it('returns a typed element by id and preserves the missing-element fallback', () => {
        document.body.innerHTML = '<button id="adapter-target">Target</button>';

        expect(browserElementById<HTMLButtonElement>('adapter-target')?.textContent).toBe('Target');
        expect(browserElementById('missing-target')).toBeNull();
    });
});
