import {describe, expect, it} from 'vitest';

import {prepareEditableAppraisal} from '../domain/appraisal';

describe('editable appraisal preparation', () => {
    it('retains legacy defaults without owning dirty tracking', () => {
        const appraisal = prepareEditableAppraisal({_id: 'appraisal-1', name: 'Original'});

        expect(appraisal.appraisalType).toBe('detailed');
        appraisal.name = 'Changed';
        expect(appraisal.name).toBe('Changed');
        expect('getUpdates' in appraisal).toBe(false);
        expect('clearUpdates' in appraisal).toBe(false);
    });

    it('hydrates mutable nested defaults without recreating derived accessors', () => {
        const source = {
            _id: 'appraisal-1',
            effectiveDate: '2025-01-15T00:00:00.000Z',
            marketRents: [{name: 'Retail', amountPSF: 20}],
            units: [{
                squareFootage: 100,
                marketRent: 'Retail',
                tenancies: [{
                    name: 'Current tenant',
                    yearlyRent: 1_000,
                    startDate: '2024-01-01T00:00:00.000Z',
                    endDate: '2026-01-01T00:00:00.000Z',
                }],
            }],
            incomeStatement: {
                years: [2024, 2025],
                items: [{name: 'Rent.$', yearlyAmounts: {2024: 1_000, 2025: 2_000}}],
                expenses: [{name: 'Taxes', incomeStatementItemType: 'taxes', yearlyAmounts: {2024: 25, 2025: 30}}],
            },
            recoveryStructures: [{name: 'Standard'}],
            leasingCosts: [{name: 'Default'}],
        };
        const appraisal = prepareEditableAppraisal(source);
        const editable = appraisal as unknown as {
            units: Array<Record<string, unknown>>;
            incomeStatement: Record<string, unknown>;
            recoveryStructures: Array<Record<string, unknown>>;
            leasingCosts: Array<Record<string, unknown>>;
        };
        const unit = editable.units[0];
        const statement = editable.incomeStatement;
        const item = (statement.items as Array<Record<string, unknown>>)[0];

        expect(appraisal.effectiveDate).toBeInstanceOf(Date);
        expect('getEffectiveDate' in appraisal).toBe(false);
        expect('sizeOfBuilding' in appraisal).toBe(false);
        expect(unit.tenancies).toMatchObject([{name: 'Current tenant'}]);
        expect('marketRentAmount' in unit).toBe(false);
        expect('isVacantForStabilizedStatement' in unit).toBe(false);
        expect('resetCalculations' in unit).toBe(false);

        expect(statement.customYearTitles).toEqual({});
        expect(statement.yearlySourceTypes).toEqual({});
        expect('latestYear' in statement).toBe(false);
        expect('machineName' in item).toBe(false);
        expect('latestAmount' in item).toBe(false);

        expect(source.effectiveDate).toBe('2025-01-15T00:00:00.000Z');
        expect(source.units[0].tenancies![0].startDate).toBe('2024-01-01T00:00:00.000Z');
    });

    it('preserves absent lists and invalid dates while nested records remain editable', () => {
        const appraisal = prepareEditableAppraisal({_id: 'appraisal-1', effectiveDate: 'not-a-date'});
        const editable = appraisal as unknown as {incomeStatement: {customYearTitles: Record<number, string>}};

        expect(appraisal.units).toBeUndefined();
        expect(appraisal.effectiveDate).toBe('not-a-date');
        editable.incomeStatement.customYearTitles[2025] = 'Forecast';
        expect(editable.incomeStatement.customYearTitles).toEqual({2025: 'Forecast'});
    });

    it('can hydrate a response whose nested records were already used by a compatibility draft', () => {
        const response = {
            _id: 'appraisal-1',
            incomeStatement: {years: [2025], items: [{name: 'Rent', yearlyAmounts: {2025: 1_000}}]},
        };

        prepareEditableAppraisal(response);
        const rehydrated = prepareEditableAppraisal(response);

        expect((rehydrated.incomeStatement as {items: Array<{yearlyAmounts: Record<number, number>}>}).items[0].yearlyAmounts).toEqual({2025: 1_000});
    });
});
