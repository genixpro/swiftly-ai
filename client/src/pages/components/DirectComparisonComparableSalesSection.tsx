import {Col, Row} from 'reactstrap';
import ComparableSaleList from './ComparableSaleList';
import type {DirectComparisonAppraisal} from '../directComparisonTypes';

interface DirectComparisonComparableSalesSectionProps {
    appraisal: DirectComparisonAppraisal;
    appraisalId?: string;
    comparableSales: readonly object[];
    headers: string[][];
    navigate?: unknown;
    search?: unknown;
    sort: string;
    stats: string[][];
    onChange(comparables: readonly object[]): void;
    onSortChanged(sort: string): void;
}

/** Existing comparable list structure and scroll affordance for direct comparison. */
function DirectComparisonComparableSalesSection({
    appraisal,
    appraisalId,
    comparableSales,
    headers,
    navigate,
    search,
    sort,
    stats,
    onChange,
    onSortChanged,
}: DirectComparisonComparableSalesSectionProps) {
    return <Row>
        <Col xs={12}>
            <div className={"stabilized-statement-centered"}>
                <h3>Direct Comparison Approach</h3>
                <h4>{appraisal.address}</h4>
                <div className="horizontal-scroll-hint">Scroll horizontally to review every comparable field.</div>
                <div className="comparable-list-scroll" role="region" tabIndex={0} aria-label="Comparable sales; scroll horizontally for more columns">
                    <ComparableSaleList
                        comparableSales={comparableSales as never}
                        statsTitle={""}
                        statsPosition={"below"}
                        allowNew={false}
                        headers={headers}
                        stats={stats}
                        noCompMessage={"There are no comparables attached to this appraisal. Please go to the comparables database and select comparables from there."}
                        sort={sort}
                        onSortChanged={onSortChanged}
                        navigate={navigate}
                        search={search as Record<string, unknown>}
                        appraisal={appraisal}
                        appraisalId={appraisalId}
                        appraisalComparables={appraisal.comparableSales}
                        onChange={onChange}
                    />
                </div>
            </div>
        </Col>
    </Row>;
}

export default DirectComparisonComparableSalesSection;
