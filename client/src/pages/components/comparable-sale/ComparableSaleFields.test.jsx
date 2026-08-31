import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {ComparableSaleField, ComparableSaleHeaderColumn} from './ComparableSaleFields';

vi.mock('../FieldDisplayEdit', () => ({
    default: ({placeholder, onChange, onGeoChange}) => <>
        <button aria-label={`${placeholder} value`} onClick={() => onChange('Updated value')}>Change</button>
        <button aria-label={`${placeholder} location`} onClick={() => onGeoChange({lat: 43.7, lng: -79.4})}>Locate</button>
    </>,
}));

describe('ComparableSaleField', () => {
    it('preserves property-type visibility and display-only empty-value rules', () => {
        const {container, rerender} = render(<ComparableSaleField
            title="Office-only field" field="floorNumber" fieldType="number" edit={true}
            propertyType="office" comparableSale={{propertyType: 'retail', floorNumber: 5}} onChange={vi.fn()}
        />);
        expect(container).toBeEmptyDOMElement();

        rerender(<ComparableSaleField
            title="Optional field" field="floorNumber" fieldType="number" edit={false}
            comparableSale={{propertyType: 'office', floorNumber: null}} onChange={vi.fn()}
        />);
        expect(container).toBeEmptyDOMElement();
    });

    it('sends field and geographic edits through the existing callback contract', () => {
        const onChange = vi.fn();
        render(<ComparableSaleField
            title="Address" field="address" fieldType="address" edit={true}
            comparableSale={{propertyType: 'office', address: '10 Main Street'}}
            location={{coordinates: [-79.4, 43.7]}}
            onChange={onChange}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Address value'}));
        fireEvent.click(screen.getByRole('button', {name: 'Address location'}));
        expect(onChange).toHaveBeenNthCalledWith(1, 'address', 'Updated value');
        expect(onChange).toHaveBeenNthCalledWith(2, 'location', {type: 'Point', coordinates: [-79.4, 43.7]});
    });
});

describe('ComparableSaleHeaderColumn', () => {
    it('renders values, spacers, and the existing no-data labels', () => {
        render(<ComparableSaleHeaderColumn
            size="middle"
            fields={['address', 'propertyTags']}
            renders={[(value) => <span>{value}</span>, (value) => <span>{value.join(',')}</span>]}
            noValueTexts={['No address', 'No tags']}
            spacers={[<span key="separator"> / </span>]}
            comparableSale={{address: '10 Main Street', propertyTags: []}}
        />);

        expect(screen.getByText('10 Main Street')).toBeInTheDocument();
        expect(screen.getByText('/')).toBeInTheDocument();
        expect(screen.getByText('No tags')).toBeInTheDocument();
    });
});
