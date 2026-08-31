import {Card, CardBody, Table} from 'reactstrap';
import FieldDisplayEdit from './FieldDisplayEdit';
import type {DirectComparisonAppraisal} from '../directComparisonTypes';

interface DirectComparisonInputsPanelProps {
    appraisal: DirectComparisonAppraisal;
    onChangeShowAdjustmentChart(value: unknown): void;
    onChangeInput(field: string, value: unknown): void;
    onChangeNoiMultiple(value: unknown): void;
    onChangePricePerSquareFootMultiple(value: unknown): void;
}

const metricFields = [
    ['psf', 'Price Per Square Foot', 'currency', 'Price Per Square Foot', 'pricePerSquareFoot', 'input'],
    ['noi_multiple', 'NOI Multiple', 'float', 'NOI Multiple', 'noiPSFMultiple', 'noiMultiple'],
    ['noi_multiple', 'Price Per Square Foot', 'currency', 'Price Per Square Foot', 'noiPSFPricePerSquareFoot', 'pricePerSquareFootMultiple'],
    ['psf_land', 'Price Per Square Foot of Land', 'currency', 'Price Per Square Foot of Land', 'pricePerSquareFootLand', 'input'],
    ['per_acre_land', 'Price Per Acre of Land', 'currency', 'Price Per Acre of Land', 'pricePerAcreLand', 'input'],
    ['psf_buildable_area', 'Price Per Square Foot of Buildable Area', 'currency', 'Price Per Square Foot of Buildable Area', 'pricePerSquareFootBuildableArea', 'input'],
    ['per_buildable_unit', 'Price Per Buildable Unit', 'currency', 'Price Per Buildable Unit', 'pricePerBuildableUnit', 'input'],
] as const;

const adjustmentFields = [
    ['marketRentDifferential', 'Market Rent Differential', 'Apply Market Rent Differential', 'applyMarketRentDifferential'],
    ['vacantUnitLeasupCosts', 'Vacant Unit Leasing Costs', 'Apply Vacant Unit Leasing Costs', 'applyVacantUnitLeasingCosts'],
    ['vacantUnitRentLoss', 'Vacant Unit Rent Loss', 'Apply Vacant Unit Rent Loss', 'applyVacantUnitRentLoss'],
    ['freeRentRentLoss', 'Free Rent Loss', 'Apply Free Rent Loss', 'applyFreeRentLoss'],
    ['amortizedCapitalInvestment', 'Amortization Adjustment', 'Apply Amortization Adjustment', 'applyAmortization'],
] as const;

/** Direct-comparison input rows in the legacy rendering and interaction order. */
export default function DirectComparisonInputsPanel({
    appraisal,
    onChangeShowAdjustmentChart,
    onChangeInput,
    onChangeNoiMultiple,
    onChangePricePerSquareFootMultiple,
}: DirectComparisonInputsPanelProps) {
    const inputs = appraisal.directComparisonInputs;
    const valuation = appraisal.directComparisonValuation;
    const metric = inputs.directComparisonMetric;
    const changeMetricField = (field: string, mode: string, value: unknown) => {
        if (mode === 'noiMultiple') onChangeNoiMultiple(value);
        else if (mode === 'pricePerSquareFootMultiple') onChangePricePerSquareFootMultiple(value);
        else onChangeInput(field, value);
    };

    return <Card className="direct-comparison-valuation-inputs" outline><CardBody>
        <h3>Inputs</h3>
        <Table><tbody>
            <tr>
                <td>Show Adjustment Chart</td>
                <td><FieldDisplayEdit
                    type="boolean"
                    placeholder="Whether or not to show the adjustment chart"
                    value={appraisal.adjustmentChart.showAdjustmentChart}
                    onChange={onChangeShowAdjustmentChart}
                /></td>
            </tr>
            <tr>
                <td>Comparison Metric</td>
                <td><FieldDisplayEdit
                    type="directComparisonMetric"
                    placeholder="The metric used for comparing the building."
                    value={inputs ? inputs.directComparisonMetric : 'psf'}
                    onChange={(value) => onChangeInput('directComparisonMetric', value)}
                /></td>
            </tr>
            {metricFields.filter(([expectedMetric]) => metric === expectedMetric).map(([, label, type, placeholder, field, mode], index) => <tr key={`${field}-${index}`}>
                <td>{label}</td>
                <td><FieldDisplayEdit
                    type={type}
                    placeholder={placeholder}
                    value={inputs ? inputs[field] : null}
                    onChange={(value) => changeMetricField(field, mode, value)}
                /></td>
            </tr>)}
            {adjustmentFields.filter(([valuationField]) => valuation[valuationField]).map(([, label, placeholder, inputField]) => <tr key={inputField}>
                <td>{label}</td>
                <td className="apply-adjustment-column"><FieldDisplayEdit
                    type="boolean"
                    placeholder={placeholder}
                    hideIcon
                    value={inputs ? inputs[inputField] : null}
                    onChange={(value) => onChangeInput(inputField, value)}
                /></td>
            </tr>)}
        </tbody></Table>
    </CardBody></Card>;
}
