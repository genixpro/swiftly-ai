import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import ViewDirectComparisonValuation from './ViewDirectComparisonValuation';

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
    default: ({onChange, placeholder}) => <button aria-label={placeholder} onClick={() => onChange(placeholder === 'NOI Multiple' ? 12 : placeholder === 'Amount ($)' ? null : 'Edited value')}>{placeholder}</button>,
}));

function appraisalFixture() {
    return {
        _id: 'appraisal-1',
        address: '10 Main Street',
        sizeOfBuilding: 1_000,
        comparableSalesDCA: ['first', 'second'],
        comparableSales: [],
        adjustmentChart: {showAdjustmentChart: false},
        directComparisonInputs: {directComparisonMetric: 'psf', pricePerSquareFoot: 200, modifiers: []},
        directComparisonValuation: {
            comparativeValue: 200_000, valuation: 200_000, valuationRounded: 200_000,
        },
        stabilizedStatement: {netOperatingIncome: 100},
        stabilizedStatementInputs: {},
    };
}

describe('direct comparison valuation workflow characterization', () => {
    beforeEach(() => {
        comparableSalesQuery.useComparableSalesByIds.mockReset();
        comparableSalesQuery.useComparableSalesByIds.mockReturnValue({data: [
            {_id: 'first', saleDate: new Date('2024-01-01')},
            {_id: 'second', saleDate: new Date('2025-01-01')},
        ]});
    });

    it('loads selected comparables and preserves the legacy bare-field sorting interaction', async () => {
        const appraisal = appraisalFixture();
        render(<ViewDirectComparisonValuation appraisal={appraisal} saveAppraisal={vi.fn()}/>);

        await waitFor(() => expect(comparableSalesQuery.useComparableSalesByIds).toHaveBeenCalledWith(['first', 'second']));
        await waitFor(() => expect(screen.getByTestId('comparable-order')).toHaveTextContent('second,first'));

        fireEvent.click(screen.getByRole('button', {name: 'Sort sales'}));
        expect(screen.getByTestId('comparable-order')).toHaveTextContent('second,first');
    });

    it('immediately saves edits to the current direct-comparison metric input', () => {
        const appraisal = appraisalFixture();
        const saveAppraisal = vi.fn();
        render(<ViewDirectComparisonValuation appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Price Per Square Foot'}));

        expect(appraisal.directComparisonInputs.pricePerSquareFoot).toBe('Edited value');
        expect(saveAppraisal).toHaveBeenCalledWith(appraisal);
    });

    it('keeps the NOI-multiple calculation and its immediate save behavior', () => {
        const appraisal = appraisalFixture();
        appraisal.directComparisonInputs.directComparisonMetric = 'noi_multiple';
        const saveAppraisal = vi.fn();
        render(<ViewDirectComparisonValuation appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'NOI Multiple'}));

        expect(appraisal.directComparisonInputs.noiPSFMultiple).toBe(12);
        expect(appraisal.directComparisonInputs.noiPSFPricePerSquareFoot).toBeCloseTo(1.2);
        expect(saveAppraisal).toHaveBeenCalledWith(appraisal);
    });

    it('preserves modifier removal, new modifier creation, and adjustment input saves', () => {
        const appraisal = appraisalFixture();
        appraisal.directComparisonInputs.modifiers = [{name: 'Existing adjustment', amount: 50}];
        appraisal.directComparisonValuation.marketRentDifferential = 10;
        const saveAppraisal = vi.fn();
        render(<ViewDirectComparisonValuation appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getAllByRole('button', {name: 'Amount ($)'})[0]);
        expect(appraisal.directComparisonInputs.modifiers).toEqual([]);

        fireEvent.click(screen.getAllByRole('button', {name: 'Add/Remove'}).at(-1));
        expect(appraisal.directComparisonInputs.modifiers).toEqual([{name: 'Edited value', amount: 0}]);

        fireEvent.click(screen.getByRole('button', {name: 'Apply Market Rent Differential'}));
        expect(appraisal.directComparisonInputs.applyMarketRentDifferential).toBe('Edited value');
        expect(saveAppraisal).toHaveBeenCalledWith(appraisal);
    });

    it('keeps the adjustment-chart toggle in the input panel on its immediate save path', () => {
        const appraisal = appraisalFixture();
        const saveAppraisal = vi.fn();
        render(<ViewDirectComparisonValuation appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Whether or not to show the adjustment chart'}));

        expect(appraisal.adjustmentChart.showAdjustmentChart).toBe('Edited value');
        expect(saveAppraisal).toHaveBeenCalledWith(appraisal);
    });
});
