import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import ViewCapitalizationValuation from './ViewCapitalizationValuation';

const comparableSalesQuery = vi.hoisted(() => ({useComparableSalesByIds: vi.fn()}));

vi.mock('@api/hooks', () => comparableSalesQuery);
vi.mock('./components/AppraisalContentHeader', () => ({default: () => <div>Header</div>}));
vi.mock('./components/ComparableSaleList', () => ({
    default: ({comparableSales, onSortChanged}) => <>
        <output data-testid="comparable-order">{comparableSales.map((sale) => sale._id).join(',')}</output>
        <button onClick={() => onSortChanged('saleDate')}>Sort sales</button>
    </>,
}));
vi.mock('./components/FieldDisplayEdit', () => ({
    default: ({onChange, placeholder}) => <button aria-label={placeholder} onClick={() => onChange('Edited value')}>{placeholder}</button>,
}));

function appraisalFixture() {
    return {
        _id: 'appraisal-1',
        address: '10 Main Street',
        propertyType: 'office',
        appraisalType: 'simple',
        comparableSalesCapRate: ['first', 'second'],
        comparableSales: [],
        stabilizedStatementInputs: {capitalizationRate: 5, modifiers: []},
        stabilizedStatement: {
            netOperatingIncome: 100, capitalization: 2_000, valuation: 2_000,
            valuationRounded: 2_000,
        },
    };
}

describe('capitalization valuation workflow characterization', () => {
    beforeEach(() => {
        comparableSalesQuery.useComparableSalesByIds.mockReset();
        comparableSalesQuery.useComparableSalesByIds.mockReturnValue({data: [
            {_id: 'first', saleDate: new Date('2024-01-01')},
            {_id: 'second', saleDate: new Date('2025-01-01')},
        ]});
    });

    it('loads the saved comparable selection and preserves table sorting', async () => {
        const appraisal = appraisalFixture();
        render(<ViewCapitalizationValuation appraisal={appraisal} saveAppraisal={vi.fn()}/>);

        await waitFor(() => expect(comparableSalesQuery.useComparableSalesByIds).toHaveBeenCalledWith(['first', 'second']));
        await waitFor(() => expect(screen.getByTestId('comparable-order')).toHaveTextContent('second,first'));

        fireEvent.click(screen.getByRole('button', {name: 'Sort sales'}));
        // ComparableSaleList currently sends the bare field name; the legacy
        // model treats its first character as a sort direction and keeps this
        // already-descending selection in place. Preserve that interaction.
        expect(screen.getByTestId('comparable-order')).toHaveTextContent('second,first');
    });

    it('immediately saves capitalization inputs and existing modifiers', () => {
        const appraisal = appraisalFixture();
        appraisal.stabilizedStatementInputs.modifiers.push({name: 'Existing modifier', amount: 0});
        const saveAppraisal = vi.fn();
        render(<ViewCapitalizationValuation appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Capitalization Rate'}));
        expect(appraisal.stabilizedStatementInputs.capitalizationRate).toBe('Edited value');

        fireEvent.click(screen.getAllByRole('button', {name: 'Amount'})[0]);
        expect(appraisal.stabilizedStatementInputs.modifiers[0].amount).toBe('Edited value');
        expect(saveAppraisal).toHaveBeenCalledWith(appraisal);
        expect(saveAppraisal).toHaveBeenCalledTimes(2);
    });

    it('retains every optional adjustment toggle and creates a modifier in place', () => {
        const appraisal = appraisalFixture();
        Object.assign(appraisal.stabilizedStatement, {
            marketRentDifferential: 1,
            vacantUnitLeasupCosts: 1,
            vacantUnitRentLoss: 1,
            freeRentRentLoss: 1,
            amortizedCapitalInvestment: 1,
        });
        const saveAppraisal = vi.fn();
        render(<ViewCapitalizationValuation appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        for (const label of [
            'Apply Market Rent Differential', 'Apply Vacant Unit Leasing Costs', 'Apply Vacant Unit Rent Loss',
            'Apply Free Rent Loss', 'Apply Amortization Adjustment',
        ]) {
            fireEvent.click(screen.getByRole('button', {name: label}));
        }
        fireEvent.click(screen.getAllByRole('button', {name: 'Add/Remove ($)'})[0]);

        expect(appraisal.stabilizedStatementInputs).toMatchObject({
            applyMarketRentDifferential: 'Edited value',
            applyVacantUnitLeasingCosts: 'Edited value',
            applyVacantUnitRentLoss: 'Edited value',
            applyFreeRentLoss: 'Edited value',
            applyAmortization: 'Edited value',
            modifiers: [expect.objectContaining({name: 'Edited value', amount: 0})],
        });
        expect(saveAppraisal).toHaveBeenCalledTimes(6);
        expect(saveAppraisal).toHaveBeenLastCalledWith(appraisal);
    });
});
