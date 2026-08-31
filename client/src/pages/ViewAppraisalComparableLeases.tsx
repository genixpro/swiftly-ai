import {useEffect, useRef, useState} from 'react';
import {Col, Row} from 'reactstrap';
import type {AppraisalFieldUpdate, EditableAppraisal} from '../app/AppraisalWorkspace';
import {useComparableLeasesByIds} from '@api/hooks';
import {addComparableId, removeComparableId, sortComparables} from '../domain/comparables';
import type {ComparableLeaseCardRecord} from '../domain/comparableLeaseDraft';
import ComparableLeaseList from './components/ComparableLeaseList';
import ComparableLeasesMap from './components/ComparableLeasesMap';

type LegacyComparableLease = ComparableLeaseCardRecord & {_id: string};
interface Props {
    appraisal: EditableAppraisal;
    appraisalId: string;
    navigate?: unknown;
    search?: unknown;
    updateAppraisal(fields: AppraisalFieldUpdate): void;
}

export default function ViewAppraisalComparableLeases({appraisal, appraisalId, navigate, search, updateAppraisal}: Props) {
    const [comparableLeases, setComparableLeases] = useState<LegacyComparableLease[]>([]);
    const [sort, setSort] = useState('-leaseDate');
    const selectedLeaseIds = (appraisal.comparableLeases ?? []) as string[];

    // Mirrors the mount-only legacy fetch even when the workspace later
    // updates the selected ids in place.
    const selectedLeaseIdsForLoad = useRef(selectedLeaseIds);
    const comparableLeasesQuery = useComparableLeasesByIds(selectedLeaseIdsForLoad.current);

    useEffect(() => {
        if (!comparableLeasesQuery.data) return;
        setComparableLeases(sortComparables(comparableLeasesQuery.data, '-leaseDate') as LegacyComparableLease[]);
    }, [comparableLeasesQuery.data]);

    const addComparableToAppraisal = (lease: LegacyComparableLease) => {
        updateAppraisal({comparableLeases: addComparableId(selectedLeaseIds, lease._id)});
    };
    const removeComparableFromAppraisal = (lease: LegacyComparableLease) => {
        const index = selectedLeaseIds.indexOf(lease._id);
        updateAppraisal({comparableLeases: removeComparableId(selectedLeaseIds, lease._id)});
        // Preserve the existing positional local-row removal after an id is removed.
        if (index !== -1) setComparableLeases(current => current.filter((_, currentIndex) => currentIndex !== index));
    };
    const onSortChanged = (nextSort: string) => {
        setSort(nextSort);
        setComparableLeases(current => sortComparables(current, nextSort) as LegacyComparableLease[]);
    };

    return <div className="view-appraisal-comparable-leases">
        <Row><Col xs={10}><h3>View Comparable Leases</h3></Col></Row>
        <Row>
            <Col xs={12} md={8} className="comparables-list-column"><ComparableLeaseList
                comparableLeases={comparableLeases} statsTitle="Statistics for Selected Comps" allowNew={false} sort={sort}
                onSortChanged={onSortChanged}
                noCompMessage="There are no comparables attached to this appraisal. Please go to the comparables database and select comparables from there."
                navigate={navigate} search={search} appraisalId={appraisalId} appraisalComparables={selectedLeaseIds}
                appraisal={appraisal} onRemoveComparableClicked={removeComparableFromAppraisal}
                onChange={(leases: LegacyComparableLease[]) => setComparableLeases(leases)}
            /></Col>
            <Col xs={12} md={4} className="comparables-map-column"><ComparableLeasesMap
                appraisal={appraisal} comparableLeases={comparableLeases}
                onAddComparableToAppraisal={addComparableToAppraisal} onRemoveComparableFromAppraisal={removeComparableFromAppraisal}
            /></Col>
        </Row>
    </div>;
}
