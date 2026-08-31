import {describe, expect, it} from 'vitest';
import {groupCashFlows} from './discountedCashFlow';

describe('groupCashFlows', () => {
    it('groups rows by name and retains only the first flow type for income/expense buckets', () => {
        const rent2025 = {name: 'Rent', cashFlowType: 'income', year: 2025};
        const rent2026 = {name: 'Rent', cashFlowType: 'expense', year: 2026};
        const taxes = {name: 'Taxes', cashFlowType: 'expense', year: 2025};
        const ignored = {name: 'Metadata', cashFlowType: 'other', year: 2025};

        expect(groupCashFlows([rent2025, rent2026, taxes, ignored])).toEqual({
            rows: [[rent2025, rent2026], [taxes], [ignored]],
            incomes: [[rent2025, rent2026]],
            expenses: [[taxes]],
        });
    });

    it('keeps the legacy empty result when cash flows are unavailable', () => {
        expect(groupCashFlows(undefined)).toEqual({rows: [], incomes: [], expenses: []});
    });
});
