import NumberFormat from '@components/Common/NumberFormatCompat';
import type {DirectComparisonAppraisal} from '../directComparisonTypes';
import CurrencyFormat from './CurrencyFormat';

interface DirectComparisonMetricProps {
    appraisal: DirectComparisonAppraisal;
    sizeOfBuilding: number;
}

/** The existing metric label, isolated from the valuation table layout. */
export default function DirectComparisonMetric({appraisal, sizeOfBuilding}: DirectComparisonMetricProps) {
    const inputs = appraisal.directComparisonInputs;

    return <>
        {!inputs.directComparisonMetric ? <span>No Comparison Metric Selected</span> : null}
        {inputs.directComparisonMetric === 'psf' ? <span>
            <NumberFormat value={sizeOfBuilding || 0} displayType={'text'} thousandSeparator={','} decimalScale={0} fixedDecimalScale={true} /> sqft @ <CurrencyFormat value={inputs.pricePerSquareFoot} />
        </span> : null}
        {inputs.directComparisonMetric === 'noi_multiple' ? <span>
            <NumberFormat value={sizeOfBuilding || 0} displayType={'text'} thousandSeparator={','} decimalScale={0} fixedDecimalScale={true} /> sqft @ <CurrencyFormat value={inputs.noiPSFPricePerSquareFoot}/>
        </span> : null}
        {inputs.directComparisonMetric === 'psf_land' ? <span>
            <NumberFormat value={(appraisal.sizeOfLand as number) * 43560 || 0} displayType={'text'} thousandSeparator={','} decimalScale={0} fixedDecimalScale={true} /> sqft @ <CurrencyFormat value={inputs.pricePerSquareFootLand}/>
        </span> : null}
        {inputs.directComparisonMetric === 'per_acre_land' ? <span>
            <NumberFormat value={appraisal.sizeOfLand || 0} displayType={'text'} thousandSeparator={','} decimalScale={0} fixedDecimalScale={true} /> acres @ <CurrencyFormat value={inputs.pricePerAcreLand}/>
        </span> : null}
        {inputs.directComparisonMetric === 'psf_buildable_area' ? <span>
            <NumberFormat value={appraisal.buildableArea || 0} displayType={'text'} thousandSeparator={','} decimalScale={0} fixedDecimalScale={true} /> psf @ <CurrencyFormat value={inputs.pricePerSquareFootBuildableArea}/>
        </span> : null}
        {inputs.directComparisonMetric === 'per_buildable_unit' ? <span>
            <NumberFormat value={appraisal.buildableUnits || 0} displayType={'text'} thousandSeparator={','} decimalScale={0} fixedDecimalScale={true} /> units @ <CurrencyFormat value={inputs.pricePerBuildableUnit}/>
        </span> : null}
    </>;
}
