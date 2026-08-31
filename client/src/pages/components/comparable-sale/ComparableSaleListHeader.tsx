import {Col} from 'reactstrap';

import SortDirection from '../SortDirection';

export interface ComparableSaleListHeaderColumnProps {
    size: number | string;
    texts: string[];
    fields: string[];
    sort: string;
    changeSortColumn(field: string): void;
}

export interface ComparableSaleListHeaderConfiguration {
    title: string;
    size: number | 'middle';
}

type Search = Record<string, unknown>;

export function defaultComparableSaleHeaderFields(search: Search) {
    const headerFields = [['saleDate'], ['address']];
    if (search.propertyType !== 'land') headerFields.push(['sizeSquareFootage']);
    if (search.propertyType === 'land') headerFields.push(['sizeOfLandAcres', 'sizeOfBuildableAreaSqft']);
    headerFields.push(['salePrice'], ['propertyType', 'propertyTags']);
    if (search.propertyType !== 'land') headerFields.push(['displayCapitalizationRate', 'pricePerSquareFoot']);
    if (search.propertyType === 'land') headerFields.push(['pricePerAcreLand', 'pricePerSquareFootBuildableArea']);
    return headerFields;
}

export function defaultComparableSaleStatsFields(search: Search) {
    const statFields: string[] = [];
    if (search.propertyType !== 'land' && search.propertyType !== 'residential') {
        statFields.push('displayCapitalizationRate', 'pricePerSquareFoot', 'sizeSquareFootage');
    }
    if (search.propertyType === 'industrial') statFields.push('clearCeilingHeight');
    if (search.propertyType === 'residential') {
        statFields.push('displayCapitalizationRate', 'pricePerSquareFoot', 'pricePerUnit', 'displayNOIPerUnit', 'pricePerBedroom');
    }
    if (search.propertyType !== 'land') statFields.push('occupancyRate');
    if (search.propertyType === 'land') {
        statFields.push('sizeOfLandAcres', 'floorSpaceIndex', 'pricePerSquareFootLand', 'pricePerSquareFootBuildableArea', 'pricePerAcreLand');
    }
    return statFields;
}

export const comparableSaleListHeaderConfigurations: Record<string, ComparableSaleListHeaderConfiguration> = {
    saleDate: {title: 'Date', size: 1},
    address: {title: 'Address', size: 3},
    sizeSquareFootage: {title: 'Building Size (sf)', size: 'middle'},
    sizeOfLandSqft: {title: 'Site Area (sqft)', size: 'middle'},
    sizeOfLandAcres: {title: 'Site Area (acres)', size: 'middle'},
    sizeOfBuildableAreaSqft: {title: 'Buildable Area (sqft)', size: 'middle'},
    salePrice: {title: 'Sale Price', size: 'middle'},
    capitalizationRate: {title: 'Cap Rate (%)', size: 'middle'},
    displayCapitalizationRate: {title: 'Cap Rate (%)', size: 'middle'},
    propertyType: {title: 'Property Type', size: 'middle'},
    propertyTags: {title: 'Sub Type', size: 'middle'},
    pricePerSquareFoot: {title: 'PSF Building Size ($)', size: 'middle'},
    pricePerAcreLand: {title: 'Price Per Acre ($)', size: 'middle'},
    pricePerSquareFootLand: {title: 'PSF Land ($)', size: 'middle'},
    pricePerSquareFootBuildableArea: {title: 'PSF Buildable Area ($)', size: 'middle'},
    pricePerBuildableUnit: {title: 'Price Per Buildable Unit ($)', size: 'middle'},
    netOperatingIncome: {title: 'NOI ($)', size: 'middle'},
    displayNetOperatingIncome: {title: 'NOI ($)', size: 'middle'},
    netOperatingIncomePSF: {title: 'NOI PSF', size: 'middle'},
    displayNetOperatingIncomePSF: {title: 'NOI PSF', size: 'middle'},
    noiPSFMultiple: {title: 'Multiple', size: 'middle'},
    displayNOIPSFMultiple: {title: 'Multiple', size: 'middle'},
    buildableUnits: {title: 'Buildable Units', size: 'middle'},
    siteCoverage: {title: '(Site Coverage)', size: 'middle'},
    occupancyRate: {title: '(Occupancy Rate)', size: 'middle'},
    zoning: {title: 'Zoning', size: 'middle'},
    floorSpaceIndex: {title: 'Floor Space Index', size: 'middle'},
    noiPerBedroom: {title: 'NOI / Bedroom', size: 'middle'},
    displayNOIPerBedroom: {title: 'NOI / Bedroom', size: 'middle'},
    noiPerUnit: {title: 'NOI / Unit', size: 'middle'},
    displayNOIPerUnit: {title: 'NOI / Unit', size: 'middle'},
    averageMonthlyRentPerUnit: {title: 'Avg Mthly Rent', size: 'middle'},
    numberOfUnits: {title: 'Number Of Units', size: 'middle'},
    totalBedrooms: {title: 'Total Bedrooms', size: 'middle'},
    pricePerUnit: {title: 'Price / Unit', size: 'middle'},
    pricePerBedroom: {title: 'Price / Bedroom', size: 'middle'},
    shippingDoorsTruckLevel: {title: '', size: 'middle'},
    shippingDoorsDoubleMan: {title: 'Shipping Doors', size: 'middle'},
    shippingDoorsDriveIn: {title: '', size: 'middle'},
};

export function ComparableSaleListHeaderColumn(props: ComparableSaleListHeaderColumnProps) {
    const colProps: {xs?: number} = {};
    let colClass = '';
    if (typeof props.size === 'number') colProps.xs = props.size;
    else if (props.size === 'middle') colClass = 'middle-col';

    const sortField = props.fields[0];
    const sortDirection = props.sort === `+${sortField}` ? 'ascending' : props.sort === `-${sortField}` ? 'descending' : 'none';
    return <Col className={`header-field-column ${colClass}`} {...colProps} role="columnheader" aria-sort={sortDirection}>
        <button type="button" className="comparable-sort-button" onClick={() => props.changeSortColumn(sortField)}>
            {props.fields.map((_field, fieldIndex) => <span key={fieldIndex}>
                {props.texts[fieldIndex]}
                {fieldIndex === 0 ? <SortDirection field={props.fields[0]} sort={props.sort}/> : null}
                {fieldIndex !== props.fields.length - 1 && props.texts[fieldIndex] ? <br/> : null}
            </span>)}
        </button>
    </Col>;
}
