import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('./FieldDisplayEdit', () => ({
    default: ({onChange, placeholder, value}) => (
        <button aria-label={placeholder || String(value)} onClick={() => onChange?.('Entered value')}>
            {placeholder || String(value)}
        </button>
    ),
}));

vi.mock('./CurrencyFormat', () => ({default: ({value}) => <span>{value}</span>}));

import ComparableAdjustmentChart from './ComparableAdjustmentChart';

describe('ComparableAdjustmentChart characterization', () => {
    const comparableSales = [{_id: 'sale-1', salePrice: 100, sizeSquareFootage: 10}];

    it('preserves amount and percentage adjusted totals', () => {
        const appraisal = {
            adjustmentChart: {
                adjustments: [
                    {adjustmentType: 'amount', adjustmentAmounts: {'sale-1': 10}, adjustmentPercentages: {}},
                    {adjustmentType: 'percentage', adjustmentAmounts: {}, adjustmentPercentages: {'sale-1': 5}},
                ],
            },
        };

        render(<ComparableAdjustmentChart appraisal={appraisal} comparableSales={comparableSales}/>);

        expect(screen.getByText('115')).toBeInTheDocument();
        expect(screen.getByText('11.5')).toBeInTheDocument();
    });

    it('preserves new-adjustment initialization, mutation, and change notification', () => {
        const onChange = vi.fn();
        const appraisal = {adjustmentChart: {adjustments: []}};
        render(<ComparableAdjustmentChart appraisal={appraisal} comparableSales={comparableSales} onChange={onChange}/>);

        fireEvent.click(screen.getByRole('button', {name: 'New Adjustment...'}));

        expect(appraisal.adjustmentChart.adjustments).toEqual([{
            name: 'Entered value',
            adjustmentType: null,
            adjustmentPercentages: {},
            adjustmentAmounts: {},
            adjustmentTexts: {},
        }]);
        expect(onChange).toHaveBeenCalledWith(appraisal.adjustmentChart);
    });
});
