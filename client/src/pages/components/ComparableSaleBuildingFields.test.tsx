import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ComparableSaleBuildingFields from './ComparableSaleBuildingFields';

vi.mock('./comparable-sale/ComparableSaleFields', () => ({
    ComparableSaleField: ({title, field, propertyType, excludedPropertyType, onChange}: any) => <button
        type="button"
        data-field={field}
        data-property-type={propertyType}
        data-excluded-property-type={excludedPropertyType}
        onClick={() => onChange(field, `${field}-updated`)}
    >{title}</button>,
}));

vi.mock('./FieldDisplayEdit', () => ({
    default: ({placeholder, onChange}: any) => <button type="button" aria-label={placeholder} onClick={() => onChange(4)}>Edit</button>,
}));

describe('ComparableSaleBuildingFields', () => {
    it('keeps the original building-field order and industrial shipping-door editing semantics', () => {
        const onChange = vi.fn();
        render(<ComparableSaleBuildingFields
            comparableSale={{
                propertyType: 'industrial',
                shippingDoorsDoubleMan: null,
                shippingDoorsDriveIn: null,
                shippingDoorsTruckLevel: null,
            }}
            editable
            onChange={onChange}
        />);

        expect(screen.getByRole('heading', {name: 'Building Information'})).toBeInTheDocument();
        expect(screen.getAllByRole('button').map(button => button.dataset.field).filter(Boolean)).toEqual([
            'floors', 'constructionDate', 'siteArea', 'siteCoverage', 'occupancyRate', 'clearCeilingHeight',
            'finishedOfficePercent', 'zoning', 'developmentProposals', 'sizeOfLandSqft', 'sizeOfLandAcres',
            'sizeOfBuildableAreaSqft', 'buildableUnits', 'pricePerSquareFootLand', 'pricePerAcreLand',
            'pricePerSquareFootBuildableArea', 'pricePerBuildableUnit', 'floorSpaceIndex', 'tenants', 'parking',
            'additionalInfo', 'computedDescriptionText',
        ]);

        fireEvent.click(screen.getByRole('button', {name: 'Shipping Doors Drive In'}));
        expect(onChange).toHaveBeenCalledWith('shippingDoorsDriveIn', 4);
    });

    it('keeps the land-only Property Information heading and field eligibility', () => {
        render(<ComparableSaleBuildingFields
            comparableSale={{propertyType: 'land'}}
            editable={false}
            onChange={vi.fn()}
        />);

        expect(screen.getAllByRole('heading', {name: 'Property Information'})).toHaveLength(2);
        expect(screen.getByRole('button', {name: 'Zoning'})).toHaveAttribute('data-property-type', 'land');
        expect(screen.getByRole('button', {name: 'Tenants'})).toHaveAttribute('data-excluded-property-type', 'land');
        expect(screen.queryByText('Shipping Doors:')).not.toBeInTheDocument();
    });
});
