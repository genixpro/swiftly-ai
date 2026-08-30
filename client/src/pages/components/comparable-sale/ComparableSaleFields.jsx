import React from 'react';
import {Col} from 'reactstrap';
import PropTypes from 'prop-types';
import _ from 'underscore';

import ComparableSaleModel from '../../../models/ComparableSaleModel';
import FieldDisplayEdit from '../FieldDisplayEdit';


export class ComparableSaleField extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        field: PropTypes.string.isRequired,
        fieldType: PropTypes.string.isRequired,
        edit: PropTypes.bool.isRequired,
        cents: PropTypes.bool,
        propertyType: PropTypes.string,
        excludedPropertyType: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        location: PropTypes.object,
        comparableSale: PropTypes.instanceOf(ComparableSaleModel).isRequired,
    };

    render() {
        const {comparableSale, excludedPropertyType, propertyType} = this.props;
        if (propertyType && comparableSale.propertyType !== propertyType) return null;
        if (excludedPropertyType && comparableSale.propertyType === excludedPropertyType) return null;
        if (!this.props.edit && (comparableSale[this.props.field] === null || comparableSale[this.props.field] === '')) return null;

        return [
            <span key="label" className="comparable-field-label">{this.props.title}:</span>,
            <FieldDisplayEdit
                key="field"
                type={this.props.fieldType}
                edit={this.props.edit}
                cents={this.props.cents}
                placeholder={this.props.placeholder || this.props.title}
                value={comparableSale[this.props.field]}
                location={this.props.location ? {
                    lat: () => this.props.location.coordinates[1],
                    lng: () => this.props.location.coordinates[0],
                } : null}
                propertyType={comparableSale.propertyType}
                onChange={(value) => this.props.onChange(this.props.field, value)}
                onGeoChange={(value) => this.props.onChange('location', {
                    type: 'Point',
                    coordinates: [value.lng, value.lat],
                })}
            />,
        ];
    }
}


export class ComparableSaleHeaderColumn extends React.Component {
    static propTypes = {
        size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        renders: PropTypes.arrayOf(PropTypes.func).isRequired,
        noValueTexts: PropTypes.arrayOf(PropTypes.string).isRequired,
        fields: PropTypes.arrayOf(PropTypes.string).isRequired,
        comparableSale: PropTypes.instanceOf(ComparableSaleModel).isRequired,
        spacers: PropTypes.arrayOf(PropTypes.object),
    };

    render() {
        const colProps = {};
        let colClass = '';
        if (_.isNumber(this.props.size)) colProps.xs = this.props.size;
        else if (this.props.size === 'middle') colClass = 'middle-col';

        return <Col className={`header-field-column ${colClass}`} {...colProps}>
            {this.props.fields.map((field, index) => {
                const value = this.props.comparableSale[field];
                const hasValue = value && !(_.isArray(value) && value.length === 0);
                const spacer = this.props.spacers?.[index];
                return hasValue
                    ? <span key={field}>
                        {this.props.renders[index](value)}
                        {index !== this.props.fields.length - 1 ? spacer ?? <br /> : null}
                    </span>
                    : <span className="no-data" key={field}>
                        <span>{this.props.noValueTexts[index] ?? 'n/a'}</span>
                        {index !== this.props.fields.length - 1 && !spacer ? <br /> : null}
                    </span>;
            })}
        </Col>;
    }
}
