import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ComparableSalePortfolioSelector from './ComparableSalePortfolioSelector';

describe('ComparableSalePortfolioSelector', () => {
    it('delegates compilation/child selection plus add and delete actions without owning portfolio state', () => {
        const onSelect = vi.fn();
        const onDelete = vi.fn();
        const onAdd = vi.fn();
        render(<ComparableSalePortfolioSelector
            isPortfolioCompilation
            portfolioComps={[{address: '40 Main Street'}]}
            selectedPortfolioComp={-1}
            edit
            onSelect={onSelect}
            onDelete={onDelete}
            onAdd={onAdd}
        />);

        fireEvent.click(screen.getByText('Compilation'));
        fireEvent.click(screen.getByText('40 Main Street'));
        fireEvent.click(screen.getByRole('button', {name: 'Add Entry In Portfolio'}));
        fireEvent.click(screen.getByRole('button', {name: ''}));

        expect(onSelect).toHaveBeenNthCalledWith(1, -1);
        expect(onSelect).toHaveBeenNthCalledWith(2, 0);
        expect(onAdd).toHaveBeenCalledTimes(1);
        expect(onDelete).toHaveBeenCalledWith(0, expect.anything());
    });
});
