import type {ReactNode} from 'react';
import {Col} from 'reactstrap';

import CurrencyFormat from '../CurrencyFormat';
import IntegerFormat from '../IntegerFormat';
import AreaFormat from '../AreaFormat';
import type {ComparableLeaseCardRecord, ComparableLeaseRentEscalationDraft} from '../../../domain/comparableLeaseDraft';

type LeaseRecord = ComparableLeaseCardRecord;

export interface ComparableLeaseListItemHeaderColumnProps {
    size: number | string;
    renders: Array<(value: unknown, lease: LeaseRecord) => ReactNode>;
    fields: string[];
    comparableLease: LeaseRecord;
}

export interface ComparableLeaseListItemHeaderConfiguration {
    render(value: unknown, lease: LeaseRecord): ReactNode;
    size: number;
}

/**
 * Presentation-only header configuration extracted from the lease editor.
 * Its formatters intentionally retain every existing line break and label.
 */
export const comparableLeaseListItemHeaderConfigurations: Record<string, ComparableLeaseListItemHeaderConfiguration> = {
    leaseDate: {
        render: (value) => <span>{new Date(value as string | number | Date).toLocaleDateString('en-CA', {month: 'short', year: 'numeric', timeZone: 'UTC'})}</span>,
        size: 1,
    },
    address: {render: (value) => <span>{value as ReactNode}</span>, size: 4},
    rentEscalations: {
        render: (value) => (value as ComparableLeaseRentEscalationDraft[]).map((escalation, escalationIndex) => {
            if (escalation.startYear && escalation.endYear) {
                return <span key={escalationIndex}>Yrs. {escalation.startYear} - {escalation.endYear} @ <CurrencyFormat value={escalation.yearlyRent} cents={true}/><br/></span>;
            }
            if (escalation.startYear || escalation.endYear) {
                return <span key={escalationIndex}>Yr. {escalation.startYear || escalation.endYear} @ <CurrencyFormat value={escalation.yearlyRent} cents={true}/><br/></span>;
            }
            return <span key={escalationIndex}><CurrencyFormat value={escalation.yearlyRent} cents={true}/><br/></span>;
        }),
        size: 2,
    },
    sizeOfUnit: {render: (value) => <AreaFormat value={value as number | string | null}/>, size: 2},
    taxesMaintenanceInsurance: {render: (value) => <span>TMI @ <CurrencyFormat value={value as number | null}/></span>, size: 3},
    tenantInducements: {render: (value) => <span>{value as ReactNode}</span>, size: 3},
    freeRentMonths: {
        render: (_value, lease) => {
            const freeRentMonths = lease.freeRentMonths as number | string | null | undefined;
            return <span><IntegerFormat value={freeRentMonths}/> month{freeRentMonths !== 1 ? 's' : ''} free {lease.freeRentType as ReactNode} rent</span>;
        },
        size: 3,
    },
};

export function ComparableLeaseListItemHeaderColumn(props: ComparableLeaseListItemHeaderColumnProps) {
    const colProps: {xs?: number} = {};
    let colClass = '';
    if (typeof props.size === 'number') colProps.xs = props.size;
    else if (props.size === 'middle') colClass = 'middle-col';

    return <Col className={`header-field-column ${colClass}`} {...colProps}>
        {props.fields.map((field, fieldIndex) => {
            const value = props.comparableLease[field];
            return value && !(Array.isArray(value) && value.length === 0)
                ? <span key={fieldIndex}>
                    {props.renders[fieldIndex](value, props.comparableLease)}
                    {fieldIndex !== props.fields.length - 1 ? <br/> : null}
                </span>
                : <span className="no-data" key={fieldIndex}>
                    n/a
                    {fieldIndex !== props.fields.length - 1 ? <br/> : null}
                </span>;
        })}
    </Col>;
}
