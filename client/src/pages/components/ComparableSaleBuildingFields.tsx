import React from 'react';
import FieldDisplayEdit from './FieldDisplayEdit';
import {ComparableSaleField} from './comparable-sale/ComparableSaleFields';
import type {ComparableSaleCardRecord} from '../../domain/comparableSaleCard';

interface ComparableSaleBuildingFieldsProps {
    comparableSale: ComparableSaleCardRecord;
    editable: boolean;
    onChange: (field: string, value: unknown) => void;
}

const buildingFields = [
    ['Floors', 'floors', 'text', {excludedPropertyType: 'land'}],
    ['Construction Date', 'constructionDate', 'text', {excludedPropertyType: 'land'}],
    ['Site Area', 'siteArea', 'acres', {excludedPropertyType: 'land'}],
    ['Site Coverage', 'siteCoverage', 'percent', {propertyType: 'industrial'}],
    ['Occupancy Rate', 'occupancyRate', 'percent', {excludedPropertyType: 'land'}],
    ['Clear Ceiling Height', 'clearCeilingHeight', 'length', {propertyType: 'industrial'}],
    ['Finished Office Percentage', 'finishedOfficePercent', 'percent', {propertyType: 'industrial'}],
] as const;

const landFields = [
    ['Zoning', 'zoning', 'zone'],
    ['Development Proposals', 'developmentProposals', 'text'],
    ['Size of Land (sqft)', 'sizeOfLandSqft', 'area'],
    ['Size of Land (acres)', 'sizeOfLandAcres', 'acres'],
    ['Buildable Area (sqft)', 'sizeOfBuildableAreaSqft', 'area'],
    ['Buildable Units', 'buildableUnits', 'number'],
] as const;

const landPricingFields = [
    ['Price per Square Foot of Land', 'pricePerSquareFootLand', 'currency'],
    ['Price per Acre of Land', 'pricePerAcreLand', 'currency'],
    ['Price per Square Foot of Buildable Area', 'pricePerSquareFootBuildableArea', 'currency'],
    ['Price per Buildable Unit', 'pricePerBuildableUnit', 'currency'],
    ['Floor Space Index', 'floorSpaceIndex', 'float'],
] as const;

const additionalFields = [
    ['Tenants', 'tenants', 'text'],
    ['Parking', 'parking', 'text'],
    ['Additional Info', 'additionalInfo', 'text'],
] as const;

/** Ordered building and land information fields, retaining the legacy presentation conditions. */
export default function ComparableSaleBuildingFields({comparableSale, editable, onChange}: ComparableSaleBuildingFieldsProps) {
    const field = (title: string, name: string, fieldType: string, extras: Record<string, unknown> = {}) => <ComparableSaleField
        title={title}
        field={name}
        fieldType={fieldType}
        edit={editable}
        comparableSale={comparableSale}
        onChange={onChange}
        {...extras}
    />;
    const isLand = comparableSale.propertyType === 'land';
    const showShippingDoors = comparableSale.propertyType === 'industrial' && (editable || comparableSale.shippingDoorsDoubleMan
        || comparableSale.shippingDoorsDriveIn || comparableSale.shippingDoorsTruckLevel);

    return <>
        <h4 className="group-heading">{isLand ? 'Property Information' : 'Building Information'}</h4>
        <span className="group-heading" />
        {buildingFields.map(([title, name, fieldType, extras]) => <React.Fragment key={name}>{field(title, name, fieldType, extras)}</React.Fragment>)}
        {showShippingDoors ? <>
            <span className="comparable-field-label">Shipping Doors:</span>
            <div className="shipping-doors">
                {editable || comparableSale.shippingDoorsDoubleMan !== null ? <ShippingDoorField
                    title="Double Man:"
                    placeholder="Shipping Doors Double Man"
                    value={comparableSale.shippingDoorsDoubleMan}
                    editable={editable}
                    onChange={(value) => onChange('shippingDoorsDoubleMan', value)}
                /> : null}
                {editable || comparableSale.shippingDoorsDriveIn !== null ? <ShippingDoorField
                    title="Drive In:"
                    placeholder="Shipping Doors Drive In"
                    value={comparableSale.shippingDoorsDriveIn}
                    editable={editable}
                    onChange={(value) => onChange('shippingDoorsDriveIn', value)}
                /> : null}
                {editable || comparableSale.shippingDoorsTruckLevel !== null ? <ShippingDoorField
                    title="Truck Level:"
                    placeholder="Shipping Doors Truck Level"
                    value={comparableSale.shippingDoorsTruckLevel}
                    editable={editable}
                    onChange={(value) => onChange('shippingDoorsTruckLevel', value)}
                /> : null}
            </div>
        </> : null}
        {landFields.map(([title, name, fieldType]) => <React.Fragment key={name}>{field(title, name, fieldType, {propertyType: 'land'})}</React.Fragment>)}
        {isLand ? <>
            <h4 className="group-heading">Property Information</h4>
            <span className="group-heading" />
        </> : null}
        {landPricingFields.map(([title, name, fieldType]) => <React.Fragment key={name}>{field(title, name, fieldType, {propertyType: 'land'})}</React.Fragment>)}
        {additionalFields.map(([title, name, fieldType]) => <React.Fragment key={name}>{field(title, name, fieldType, {excludedPropertyType: 'land'})}</React.Fragment>)}
        {field('Description', 'computedDescriptionText', 'textbox')}
    </>;
}

interface ShippingDoorFieldProps {
    title: string;
    placeholder: string;
    value: unknown;
    editable: boolean;
    onChange: (value: unknown) => void;
}

function ShippingDoorField({title, placeholder, value, editable, onChange}: ShippingDoorFieldProps) {
    return <div className="shipping-doors-line">
        <span>{title}</span>
        <FieldDisplayEdit
            type="number"
            edit={editable}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    </div>;
}
