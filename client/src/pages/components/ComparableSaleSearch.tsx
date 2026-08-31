import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import FieldDisplayEdit from './FieldDisplayEdit';
import {updateComparableSearch} from './comparable-sale/searchModel';

type SearchFields = Record<string, unknown>;
type FieldCondition = 'always' | 'land' | 'nonLand' | 'industrial';

interface SearchField {
    label: string;
    field: string;
    type: string;
    condition?: FieldCondition;
    ariaLabel?: string;
    propertyTypeFromSearch?: boolean;
}

interface ComparableSaleSearchProps {
    appraisal?: unknown;
    defaultSearch: SearchFields;
    onChange?(search: SearchFields): void;
}

const searchColumns: readonly (readonly SearchField[])[] = [
    [
        {label: 'Property Type:', field: 'propertyType', type: 'propertyType'},
        {label: 'Tenancy Is:', field: 'tenancyType', type: 'tenancyType'},
        {label: 'Sub Type:', field: 'propertyTags', type: 'tags', propertyTypeFromSearch: true},
        {label: 'Sale Date Start:', field: 'saleDateFrom', type: 'date', condition: 'land', ariaLabel: 'Sale date start'},
        {label: 'Sale Date End:', field: 'saleDateTo', type: 'date', condition: 'land', ariaLabel: 'Sale date end'},
        {label: 'Sale Price Low:', field: 'salePriceFrom', type: 'currency', condition: 'land'},
        {label: 'Sale Price High:', field: 'salePriceTo', type: 'currency', condition: 'land'},
        {label: 'Cap Rate Low:', field: 'capitalizationRateFrom', type: 'number', condition: 'nonLand'},
        {label: 'Cap Rate High:', field: 'capitalizationRateTo', type: 'number', condition: 'nonLand'},
        {label: 'Clear Ceiling Height Low:', field: 'clearCeilingHeightFrom', type: 'length', condition: 'industrial'},
        {label: 'Clear Ceiling Height High:', field: 'clearCeilingHeightTo', type: 'length', condition: 'industrial'},
    ],
    [
        {label: 'Sale Date Start:', field: 'saleDateFrom', type: 'date', condition: 'nonLand', ariaLabel: 'Sale date start'},
        {label: 'Sale Date End:', field: 'saleDateTo', type: 'date', condition: 'nonLand', ariaLabel: 'Sale date end'},
        {label: 'Sale Price Low:', field: 'salePriceFrom', type: 'currency', condition: 'nonLand'},
        {label: 'Sale Price High:', field: 'salePriceTo', type: 'currency', condition: 'nonLand'},
        {label: 'Shipping Doors Low:', field: 'shippingDoorsFrom', type: 'number', condition: 'industrial'},
        {label: 'Shipping Doors High:', field: 'shippingDoorsTo', type: 'number', condition: 'industrial'},
        {label: 'Site Area (acres) Low:', field: 'sizeOfLandAcresFrom', type: 'number', condition: 'land'},
        {label: 'Site Area (acres) High:', field: 'sizeOfLandAcresTo', type: 'number', condition: 'land'},
        {label: 'Site Area (sqft) Low:', field: 'sizeOfLandSqftFrom', type: 'number', condition: 'land'},
        {label: 'Site Area (sqft) High:', field: 'sizeOfLandSqftTo', type: 'number', condition: 'land'},
        // These rows intentionally retain the historical shipping-door bindings.
        {label: 'Buildable Units Low:', field: 'shippingDoorsFrom', type: 'number', condition: 'land'},
        {label: 'Buildable Units High:', field: 'shippingDoorsTo', type: 'number', condition: 'land'},
        {label: 'Zoning:', field: 'zoning', type: 'zone', condition: 'land'},
    ],
    [
        {label: 'Leasable Area Low:', field: 'leasableAreaFrom', type: 'number', condition: 'nonLand'},
        {label: 'Leasable Area High:', field: 'leasableAreaTo', type: 'number', condition: 'nonLand'},
        {label: 'Price Per Square Foot Low:', field: 'pricePerSquareFootFrom', type: 'number', condition: 'nonLand'},
        // The original UI labels both price-per-square-foot rows “Low”.
        {label: 'Price Per Square Foot Low:', field: 'pricePerSquareFootTo', type: 'number', condition: 'nonLand'},
        {label: 'Price Per Acre Low:', field: 'pricePerAcreLandFrom', type: 'currency', condition: 'land'},
        {label: 'Price Per Acre High:', field: 'pricePerAcreLandTo', type: 'currency', condition: 'land'},
        {label: 'Price Per Square Foot Land Low:', field: 'pricePerSquareFootLandFrom', type: 'currency', condition: 'land'},
        {label: 'Price Per Square Foot Land High:', field: 'pricePerSquareFootLandTo', type: 'currency', condition: 'land'},
        {label: 'Price Per Square Foot Buildable Low:', field: 'pricePerSquareFootBuildableAreaFrom', type: 'number', condition: 'land'},
        {label: 'Price Per Square Foot Buildable High:', field: 'pricePerSquareFootBuildableAreaTo', type: 'number', condition: 'land'},
        {label: 'Size Coverage Low:', field: 'siteCoverageFrom', type: 'number', condition: 'industrial'},
        {label: 'Site Coverage High:', field: 'siteCoverageTo', type: 'number', condition: 'industrial'},
    ],
];

function fieldIsVisible(field: SearchField, propertyType: unknown) {
    switch (field.condition ?? 'always') {
    case 'land': return propertyType === 'land';
    case 'nonLand': return propertyType !== 'land';
    case 'industrial': return propertyType === 'industrial';
    default: return true;
    }
}

/** The comparable-sale search form with its legacy three-column field order intact. */
export default function ComparableSaleSearch({defaultSearch, onChange}: ComparableSaleSearchProps) {
    const [search, setSearch] = React.useState<SearchFields>({});
    const initialDefaultSearchRef = React.useRef(defaultSearch);
    const changeSearchField = (field: string, value: unknown) => {
        const nextSearch = updateComparableSearch(search, field, value);
        setSearch(nextSearch);
        onChange?.(nextSearch);
    };

    React.useEffect(() => {
        setSearch(initialDefaultSearchRef.current);
    }, []);

    return <Row>
        <Col xs={12}>
            <Card className="card-default"><CardBody><Row>
                {searchColumns.map((column, index) => <Col xs={12} sm={6} md={4} key={index}>
                    <table><tbody>
                        {column.filter(field => fieldIsVisible(field, search.propertyType)).map((field, fieldIndex) => <tr key={`${field.field}-${fieldIndex}`}>
                            <td><strong>{field.label}</strong></td>
                            <td><FieldDisplayEdit
                                isSearch
                                type={field.type}
                                {...(field.ariaLabel ? {ariaLabel: field.ariaLabel} : {})}
                                value={search[field.field]}
                                onChange={(newValue) => changeSearchField(field.field, newValue)}
                                hideInput={false}
                                hideIcon
                                {...(field.propertyTypeFromSearch ? {propertyType: search.propertyType as string | null | undefined} : {})}
                            /></td>
                        </tr>)}
                    </tbody></table>
                </Col>)}
            </Row></CardBody></Card>
        </Col>
    </Row>;
}
