import React from 'react';
import {ComparableSaleField} from './comparable-sale/ComparableSaleFields';
import type {ComparableSaleCardRecord} from '../../domain/comparableSaleCard';

interface ComparableSaleIdentityFieldsProps {
    comparableSale: ComparableSaleCardRecord;
    appraisalLocation: ComparableSaleCardRecord['location'];
    editable: boolean;
    selectedPortfolioComp: number;
    mapPicker?: React.ReactNode;
    onChange: (field: string, value: unknown) => void;
}

/** Ordered identity fields retained verbatim ahead of sales information. */
export default function ComparableSaleIdentityFields({
    comparableSale,
    appraisalLocation,
    editable,
    selectedPortfolioComp,
    mapPicker,
    onChange,
}: ComparableSaleIdentityFieldsProps) {
    return <>
        {selectedPortfolioComp > -1 ? <ComparableSaleField
            title="Make Portfolio Property Searchable Independently"
            field="allowSubCompSearch"
            fieldType="boolean"
            edit={editable}
            comparableSale={comparableSale}
            onChange={onChange}
        /> : null}
        <ComparableSaleField
            title="Address"
            field="address"
            fieldType="address"
            edit={editable}
            comparableSale={comparableSale}
            location={comparableSale.location || appraisalLocation}
            onChange={onChange}
        />
        {editable ? <span /> : null}
        {mapPicker}
        <ComparableSaleField title="Property Type" field="propertyType" fieldType="propertyType" edit={editable} comparableSale={comparableSale} onChange={onChange}/>
        <ComparableSaleField title="Sub Type" field="propertyTags" fieldType="tags" edit={editable} comparableSale={comparableSale} onChange={onChange}/>
        <ComparableSaleField title="Tenancy Type" field="tenancyType" fieldType="tenancyType" edit={editable} comparableSale={comparableSale} onChange={onChange}/>
        <ComparableSaleField title="Building Size" field="sizeSquareFootage" fieldType="area" excludedPropertyType={"land"} edit={editable} comparableSale={comparableSale} onChange={onChange}/>
        <h4 className={"group-heading"}>Sales Information</h4>
        <span className={"group-heading"}/>
    </>;
}
