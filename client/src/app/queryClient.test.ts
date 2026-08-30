import {describe, expect, it} from 'vitest';
import {createAppQueryClient} from './queryClient';

describe('application query client', () => {
    it('preserves the existing explicit loading and retry behavior', () => {
        const options = createAppQueryClient().getDefaultOptions();
        expect(options.queries).toMatchObject({
            staleTime: 0,
            refetchOnMount: 'always',
            refetchOnWindowFocus: false,
            retry: false,
        });
        expect(options.mutations).toMatchObject({retry: false});
    });
});
