import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {
    comparableSaleListHeaderConfigurations,
    ComparableSaleListHeaderColumn,
    defaultComparableSaleHeaderFields,
    defaultComparableSaleStatsFields,
} from './ComparableSaleListHeader';

describe('comparable-sale list header', () => {
    it('retains property-type-specific header and statistics order', () => {
        expect(defaultComparableSaleHeaderFields({propertyType: 'land'})).toEqual([
            ['saleDate'], ['address'], ['sizeOfLandAcres', 'sizeOfBuildableAreaSqft'], ['salePrice'],
            ['propertyType', 'propertyTags'], ['pricePerAcreLand', 'pricePerSquareFootBuildableArea'],
        ]);
        expect(defaultComparableSaleStatsFields({propertyType: 'residential'})).toEqual([
            'displayCapitalizationRate', 'pricePerSquareFoot', 'pricePerUnit', 'displayNOIPerUnit', 'pricePerBedroom', 'occupancyRate',
        ]);
        expect(comparableSaleListHeaderConfigurations.shippingDoorsDoubleMan).toMatchObject({title: 'Shipping Doors', size: 'middle'});
    });

    it('retains accessible sort state and the established blank continuation line break', () => {
        const changeSortColumn = vi.fn();
        render(<ComparableSaleListHeaderColumn
            size="middle"
            texts={['Shipping Doors', '']}
            fields={['shippingDoorsDoubleMan', 'shippingDoorsDriveIn']}
            sort="-shippingDoorsDoubleMan"
            changeSortColumn={changeSortColumn}
        />);

        expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'descending');
        expect(document.querySelector('.header-field-column br')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', {name: 'Shipping Doors'}));
        expect(changeSortColumn).toHaveBeenCalledWith('shippingDoorsDoubleMan');
    });
});
