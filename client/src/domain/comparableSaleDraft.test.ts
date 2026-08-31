import {describe, expect, it} from 'vitest';
import {comparableSaleDraftReducer, createComparableSaleDraft} from './comparableSaleDraft';

describe('comparableSaleDraftReducer', () => {
    it('updates the draft immediately and refreshes linked derived values', () => {
        const initial = createComparableSaleDraft({netOperatingIncome: 100_000, capitalizationRate: 5});
        expect(initial.values.salePrice).toBe(2_000_000);

        const updated = comparableSaleDraftReducer(initial, {type: 'edit', field: 'capitalizationRate', value: 10});
        expect(updated.values).toMatchObject({netOperatingIncome: 100_000, capitalizationRate: 10, salePrice: 1_000_000});
        expect(initial.values.salePrice).toBe(2_000_000);
    });

    it('does not overwrite a manually supplied derived value', () => {
        const initial = createComparableSaleDraft({netOperatingIncome: 100_000, capitalizationRate: 5});
        const manualSalePrice = comparableSaleDraftReducer(initial, {type: 'edit', field: 'salePrice', value: 1_100_000});
        const changedRate = comparableSaleDraftReducer(manualSalePrice, {type: 'edit', field: 'capitalizationRate', value: 8});

        expect(changedRate.values.salePrice).toBe(1_100_000);
    });

    it('replaces the draft from persisted data without carrying dirty calculation markers', () => {
        const draft = createComparableSaleDraft({netOperatingIncome: 100_000, capitalizationRate: 5});
        const replaced = comparableSaleDraftReducer(draft, {type: 'replace', values: {salePrice: 500_000, capitalizationRate: 6}});

        expect(replaced.values.netOperatingIncome).toBe(30_000);
        expect(replaced.calculatedValues.netOperatingIncome).toBe(30_000);
    });

    it('writes stabilized display edits back through the legacy persisted fields', () => {
        const initial = createComparableSaleDraft({
            netOperatingIncome: 100_000,
            capitalizationRate: 5,
            stabilizedNoiVacancyRate: 10,
        });

        const changedNoi = comparableSaleDraftReducer(initial, {type: 'edit', field: 'stabilizedNOI', value: 180_000});
        expect(changedNoi.values.netOperatingIncome).toBe(200_000);
        expect(changedNoi.values.salePrice).toBe(4_000_000);

        const changedCapRate = comparableSaleDraftReducer(initial, {type: 'edit', field: 'stabilizedCapitalizationRate', value: 10});
        expect(changedCapRate.values.capitalizationRate).toBe(9);
        expect(changedCapRate.values.salePrice).toBeCloseTo(1_111_111.111111111);
    });

    it('writes the generated-description editor through the persisted description field', () => {
        const updated = comparableSaleDraftReducer(
            createComparableSaleDraft({description: null}),
            {type: 'edit', field: 'computedDescriptionText', value: 'Edited description'},
        );

        expect(updated.values.description).toBe('Edited description');
        expect(updated.values.computedDescriptionText).toBeUndefined();
    });
});
