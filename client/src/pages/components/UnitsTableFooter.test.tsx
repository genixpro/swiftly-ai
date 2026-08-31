import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import UnitsTableFooter from './UnitsTableFooter';

vi.mock('./CurrencyFormat', () => ({default: ({value}: {value: number}) => <span>${value}</span>}));
vi.mock('./IntegerFormat', () => ({default: ({value}: {value: number}) => <span>{value} sqft</span>}));

describe('UnitsTableFooter', () => {
    it('keeps total columns, selection spacing, and the new-unit control', () => {
        const onCreateUnit = vi.fn();
        const {container} = render(<table><UnitsTableFooter
            allowNewUnit
            allowSelection
            averageRentPSF={24}
            onCreateUnit={onCreateUnit}
            statsMode="all"
            totalSize={12_000}
            totalStabilizedRent={288_000}
        /></table>);

        expect(screen.getByText('Total')).toBeInTheDocument();
        expect(screen.getByText('12000 sqft')).toBeInTheDocument();
        expect(container.querySelector('.first-total-row')).not.toHaveClass('last-total-row');
        fireEvent.click(screen.getByTitle('New Unit'));
        expect(onCreateUnit).toHaveBeenCalledOnce();
    });

    it('retains total-only styling and can hide the create row', () => {
        const {container} = render(<table><UnitsTableFooter
            allowNewUnit={false}
            allowSelection={false}
            averageRentPSF={0}
            onCreateUnit={vi.fn()}
            statsMode="total"
            totalSize={0}
            totalStabilizedRent={0}
        /></table>);

        expect(container.querySelector('.first-total-row')).toHaveClass('last-total-row');
        expect(screen.queryByTitle('New Unit')).not.toBeInTheDocument();
    });
});
