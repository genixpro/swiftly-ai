import type {ReactNode} from 'react';
import {Col} from 'reactstrap';

import FieldDisplayEdit from '../FieldDisplayEdit';
import type {ComparableSaleHeaderValue} from './headerConfigurations';

interface ComparableSaleValue {
    propertyType?: string | null;
    [field: string]: unknown;
}

interface PointLocation {
    coordinates: [number, number];
}

export interface ComparableSaleFieldProps {
    title: string;
    field: string;
    fieldType: string;
    edit: boolean;
    cents?: boolean;
    placeholder?: string;
    propertyType?: string;
    excludedPropertyType?: string;
    onChange(field: string, value: unknown): void;
    location?: PointLocation | null;
    comparableSale: ComparableSaleValue;
}

export function ComparableSaleField(props: ComparableSaleFieldProps) {
        const {comparableSale, excludedPropertyType, propertyType} = props;
        const location = props.location;
        if (propertyType && comparableSale.propertyType !== propertyType) return null;
        if (excludedPropertyType && comparableSale.propertyType === excludedPropertyType) return null;
        if (!props.edit && (comparableSale[props.field] === null || comparableSale[props.field] === '')) return null;

        return [
            <span key="label" className="comparable-field-label">{props.title}:</span>,
            <FieldDisplayEdit
                key="field"
                type={props.fieldType}
                edit={props.edit}
                cents={props.cents}
                placeholder={props.placeholder || props.title}
                value={comparableSale[props.field]}
                location={location ? {
                    lat: () => location.coordinates[1],
                    lng: () => location.coordinates[0],
                } : null}
                propertyType={comparableSale.propertyType}
                onChange={(value: unknown) => props.onChange(props.field, value)}
                onGeoChange={(value: {lat: number; lng: number}) => props.onChange('location', {
                    type: 'Point',
                    coordinates: [value.lng, value.lat],
                })}
            />,
        ];
}

export interface ComparableSaleHeaderColumnProps {
    size: number | string;
    renders: Array<(value: ComparableSaleHeaderValue) => ReactNode>;
    noValueTexts: Array<string | undefined>;
    fields: string[];
    comparableSale: ComparableSaleValue;
    spacers?: ReactNode[];
}

export function ComparableSaleHeaderColumn(props: ComparableSaleHeaderColumnProps) {
        const colProps: {xs?: number} = {};
        let colClass = '';
        if (typeof props.size === 'number') colProps.xs = props.size;
        else if (props.size === 'middle') colClass = 'middle-col';

        return <Col className={`header-field-column ${colClass}`} {...colProps}>
            {props.fields.map((field, index) => {
                const value = props.comparableSale[field];
                const hasValue = value && !(Array.isArray(value) && value.length === 0);
                const spacer = props.spacers?.[index];
                return hasValue
                    ? <span key={field}>
                        {props.renders[index](value as ComparableSaleHeaderValue)}
                        {index !== props.fields.length - 1 ? spacer ?? <br /> : null}
                    </span>
                    : <span className="no-data" key={field}>
                        <span>{props.noValueTexts[index] ?? 'n/a'}</span>
                        {index !== props.fields.length - 1 && !spacer ? <br /> : null}
                    </span>;
            })}
        </Col>;
}
