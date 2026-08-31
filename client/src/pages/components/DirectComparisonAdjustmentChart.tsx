import {Col, Row} from 'reactstrap';
import ComparableAdjustmentChart from './ComparableAdjustmentChart';
import type {DirectComparisonAppraisal} from '../directComparisonTypes';

interface DirectComparisonAdjustmentChartProps {
    appraisal: DirectComparisonAppraisal;
    comparableSales: readonly object[];
    onChange(): void;
}

/** Preserves the optional adjustment-chart section and its surrounding spacing. */
function DirectComparisonAdjustmentChart({appraisal, comparableSales, onChange}: DirectComparisonAdjustmentChartProps) {
    return <Row className={"adjustment-chart-row"}>
        <Col xs={12}>
            <br/>
            <h3>Adjustment Chart</h3>
            <ComparableAdjustmentChart appraisal={appraisal} comparableSales={comparableSales as never} onChange={onChange}/>
            <br/>
            <br/>
        </Col>
    </Row>;
}

export default DirectComparisonAdjustmentChart;
