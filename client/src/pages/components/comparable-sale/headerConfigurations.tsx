import type {ReactNode} from 'react';

import NumberFormat from '@components/Common/NumberFormatCompat';
import CurrencyFormat from '../CurrencyFormat';
import PercentFormat from '../PercentFormat';
import FloatFormat from '../FloatFormat';
import IntegerFormat from '../IntegerFormat';

export type ComparableSaleHeaderValue = number | string | readonly string[];

function numericHeaderValue(value: ComparableSaleHeaderValue): number {
    return value as number;
}

function scalarHeaderValue(value: ComparableSaleHeaderValue): string | number {
    return value as string | number;
}

function textHeaderValue(value: ComparableSaleHeaderValue): ReactNode {
    return value as ReactNode;
}

export interface ComparableSaleHeaderConfiguration {
    render(value: ComparableSaleHeaderValue): ReactNode;
    noValueText?: string;
    spacer?: ReactNode;
    size: number | 'middle';
}

/**
 * The header schema is deliberately presentation-only. Keeping it outside the
 * editor preserves every column's formatter and CSS class while letting the
 * stateful sale editor focus on edit/save behaviour.
 */
export const comparableSaleHeaderConfigurations: Record<string, ComparableSaleHeaderConfiguration> = {
    saleDate: {
        render: (value) => <span>{new Date(value as string | number).toLocaleDateString('en-CA', {month: 'short', year: 'numeric', timeZone: 'UTC'})}</span>,
        noValueText: "No Sale Date",
        size: 1,
    },
    address: {
        render: (value) => <span>{textHeaderValue(value)}</span>,
        noValueText: "No Address",
        size: 3,
    },
    sizeSquareFootage: {
        render: (value) => <NumberFormat value={scalarHeaderValue(value)} displayType={'text'} thousandSeparator={','} decimalScale={0} fixedDecimalScale={true}/>,
        size: 'middle',
    },
    sizeOfLandSqft: {
        render: (value) => <NumberFormat value={scalarHeaderValue(value)} displayType={'text'} thousandSeparator={','} decimalScale={0} fixedDecimalScale={true}/>,
        size: 'middle',
    },
    sizeOfLandAcres: {
        render: (value) => <NumberFormat value={scalarHeaderValue(value)} displayType={'text'} thousandSeparator={','} decimalScale={1} fixedDecimalScale={true}/>,
        size: 'middle',
    },
    sizeOfBuildableAreaSqft: {
        render: (value) => <NumberFormat value={scalarHeaderValue(value)} displayType={'text'} thousandSeparator={','} decimalScale={0} fixedDecimalScale={true}/>,
        size: 'middle',
    },
    salePrice: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={false}/>, size: 'middle'},
    capitalizationRate: {render: (value) => <PercentFormat value={scalarHeaderValue(value)}/>, size: 'middle'},
    displayCapitalizationRate: {render: (value) => <PercentFormat value={scalarHeaderValue(value)}/>, size: 'middle'},
    propertyType: {render: (value) => <span>{textHeaderValue(value)}</span>, size: 'middle'},
    propertyTags: {
        render: (value) => (value as readonly string[]).map((tag, tagIndex, tags) => <span key={tag}>{tag}{tagIndex !== tags.length - 1 ? ', ' : ''}</span>),
        size: 'middle',
    },
    pricePerSquareFoot: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)}/>, size: 'middle'},
    pricePerAcreLand: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={false}/>, size: 'middle'},
    pricePerSquareFootLand: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={false}/>, size: 'middle'},
    pricePerSquareFootBuildableArea: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)}/>, size: 'middle'},
    pricePerBuildableUnit: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={false}/>, size: 'middle'},
    netOperatingIncome: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={false}/>, size: 'middle'},
    displayNetOperatingIncome: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={false}/>, size: 'middle'},
    netOperatingIncomePSF: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={true}/>, size: 'middle'},
    displayNetOperatingIncomePSF: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={true}/>, size: 'middle'},
    noiPSFMultiple: {render: (value) => <FloatFormat value={scalarHeaderValue(value)}/>, size: 'middle'},
    displayNOIPSFMultiple: {render: (value) => <FloatFormat value={scalarHeaderValue(value)}/>, size: 'middle'},
    buildableUnits: {render: (value) => <IntegerFormat value={scalarHeaderValue(value)}/>, size: 'middle'},
    siteCoverage: {render: (value) => <span>(<PercentFormat value={value as string | number} digits={0}/>)</span>, size: 'middle'},
    occupancyRate: {render: (value) => <span>(<PercentFormat value={value as string | number} digits={0}/>)</span>, size: 'middle'},
    zoning: {render: (value) => <span>{textHeaderValue(value)}</span>, size: 'middle'},
    floorSpaceIndex: {render: (value) => <FloatFormat value={scalarHeaderValue(value)}/>, size: 'middle'},
    noiPerBedroom: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={false}/>, size: 'middle'},
    displayNOIPerBedroom: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={false}/>, size: 'middle'},
    noiPerUnit: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={false}/>, size: 'middle'},
    displayNOIPerUnit: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={false}/>, size: 'middle'},
    averageMonthlyRentPerUnit: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={false}/>, size: 'middle'},
    numberOfUnits: {render: (value) => <IntegerFormat value={scalarHeaderValue(value)}/>, size: 'middle'},
    totalBedrooms: {render: (value) => <IntegerFormat value={scalarHeaderValue(value)}/>, size: 'middle'},
    pricePerUnit: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={false}/>, size: 'middle'},
    pricePerBedroom: {render: (value) => <CurrencyFormat value={numericHeaderValue(value)} cents={false}/>, size: 'middle'},
    shippingDoorsTruckLevel: {
        render: (value) => <span><IntegerFormat value={scalarHeaderValue(value)}/> T/L</span>,
        noValueText: '',
        spacer: <span>, </span>,
        size: 'middle',
    },
    shippingDoorsDoubleMan: {
        render: (value) => <span><IntegerFormat value={scalarHeaderValue(value)}/> D/M</span>,
        noValueText: '',
        spacer: <span>, </span>,
        size: 'middle',
    },
    shippingDoorsDriveIn: {
        render: (value) => <span><IntegerFormat value={scalarHeaderValue(value)}/> D/I</span>,
        noValueText: '',
        spacer: <span>, </span>,
        size: 'middle',
    },
};
