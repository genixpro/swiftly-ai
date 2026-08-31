import {Col} from 'reactstrap';

import SortDirection from '../SortDirection';

export interface ComparableLeaseHeaderColumnProps {
    size: number | string;
    texts: string[];
    fields: string[];
    sort: string;
    sortField: string;
    changeSortColumn(field: string): void;
}

export interface ComparableLeaseHeaderConfiguration {
    title: string;
    size: number;
    sortField?: string;
}

export const defaultComparableLeaseHeaderFields = [
    ['leaseDate'],
    ['address'],
    ['sizeOfUnit'],
    ['rentEscalations'],
    ['taxesMaintenanceInsurance', 'tenantInducements', 'freeRentMonths'],
];

export const defaultComparableLeaseStatsFields = ['sizeOfUnit', 'startingYearlyRent', 'taxesMaintenanceInsurance'];

export const comparableLeaseHeaderConfigurations: Record<string, ComparableLeaseHeaderConfiguration> = {
    leaseDate: {title: 'Date', size: 1},
    address: {title: 'Address', size: 4},
    sizeOfUnit: {title: 'Size (sqft)', size: 2},
    rentEscalations: {title: 'Rent ($)', sortField: 'rentEscalations[0].yearlyRent', size: 2},
    taxesMaintenanceInsurance: {title: 'TMI ($)', size: 3},
    tenantInducements: {title: 'Inducements', size: 3},
    freeRentMonths: {title: 'Free Rent', size: 3},
};

/** Presentation-only header retained verbatim from the lease list. */
export function ComparableLeaseListHeaderColumn(props: ComparableLeaseHeaderColumnProps) {
    const colProps: {xs?: number} = {};
    let colClass = '';
    if (typeof props.size === 'number') colProps.xs = props.size;
    else if (props.size === 'middle') colClass = 'middle-col';

    const sortDirection = props.sort === `+${props.sortField}` ? 'ascending' : props.sort === `-${props.sortField}` ? 'descending' : 'none';
    return <Col className={`header-field-column ${colClass}`} {...colProps} role="columnheader" aria-sort={sortDirection}>
        <button type="button" className="comparable-sort-button" onClick={() => props.changeSortColumn(props.sortField)}>
            {props.fields.map((_field, fieldIndex) => <span key={fieldIndex}>
                {props.texts[fieldIndex]}
                {fieldIndex === 0 ? <SortDirection field={props.sortField} sort={props.sort}/> : null}
                {fieldIndex !== props.fields.length - 1 ? <br/> : null}
            </span>)}
        </button>
    </Col>;
}
