import React from 'react';
import {ComparableSaleField} from './comparable-sale/ComparableSaleFields';
import type {ComparableSaleCardRecord} from '../../domain/comparableSaleCard';

interface ComparableSaleSalesFieldsProps {
    comparableSale: ComparableSaleCardRecord;
    editable: boolean;
    stabilizedNoiCalculator: React.ReactNode;
    onChange: (field: string, value: unknown) => void;
}

const residentialFields = [
    ['Price Per Unit', 'pricePerUnit', 'currency'],
    ['Avg Monthly Rent Per Unit', 'averageMonthlyRentPerUnit', 'currency'],
    ['Price Per Bedroom', 'pricePerBedroom', 'currency'],
    ['Number Of Units', 'numberOfUnits', 'number'],
    ['NOI Per Unit', 'noiPerUnit', 'currency'],
    ['NOI Per Bedroom', 'noiPerBedroom', 'currency'],
    ['Bachelors', 'numberOfBachelors', 'number'],
    ['One Bedrooms', 'numberOfOneBedrooms', 'number'],
    ['Two Bedrooms', 'numberOfTwoBedrooms', 'number'],
    ['Three+ Bedrooms', 'numberOfThreePlusBedrooms', 'number'],
    ['Total Bedrooms', 'totalBedrooms', 'number'],
] as const;

/** Ordered sales-information fields; all change behavior remains in the parent. */
export default function ComparableSaleSalesFields({comparableSale, editable, stabilizedNoiCalculator, onChange}: ComparableSaleSalesFieldsProps) {
    const field = (title: string, name: string, fieldType: string, extras: Record<string, unknown> = {}) => <ComparableSaleField
        title={title}
        field={name}
        fieldType={fieldType}
        edit={editable}
        comparableSale={comparableSale}
        onChange={onChange}
        {...extras}
    />;

    return <>
        {field('Sale Price', 'salePrice', 'currency', {cents: false})}
        {!comparableSale.useStabilizedNoi ? field('Cap Rate', 'capitalizationRate', 'percent', {excludedPropertyType: 'land'}) : null}
        {comparableSale.useStabilizedNoi ? field('Stabilized Cap Rate', 'stabilizedCapitalizationRate', 'percent', {excludedPropertyType: 'land'}) : null}
        {field('Sale Date', 'saleDate', 'date')}
        {field('Vendor', 'vendor', 'text')}
        {field('Purchaser', 'purchaser', 'text')}
        {!comparableSale.useStabilizedNoi ? field('NOI', 'netOperatingIncome', 'currency', {placeholder: 'Net Operating Income', excludedPropertyType: 'land'}) : null}
        {comparableSale.useStabilizedNoi ? field('Stabilized NOI', 'stabilizedNOI', 'currency', {placeholder: 'Stabilized Net Operating Income', excludedPropertyType: 'land'}) : null}
        {editable ? <span /> : null}
        {stabilizedNoiCalculator}
        {field('NOI PSF', 'netOperatingIncomePSF', 'currency', {placeholder: 'Net Operating Income Per Square Foot', excludedPropertyType: 'land'})}
        {field('Price Per Square Foot', 'pricePerSquareFoot', 'currency', {excludedPropertyType: 'land'})}
        {residentialFields.map(([title, name, fieldType]) => <React.Fragment key={name}>{field(title, name, fieldType, {propertyType: 'residential'})}</React.Fragment>)}
        {field('Vendor Takeback Percent', 'vendorTakebackPercent', 'percent')}
    </>;
}
