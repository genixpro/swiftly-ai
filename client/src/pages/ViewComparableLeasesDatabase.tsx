import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Col, Row} from 'reactstrap';
import type {AppraisalFieldUpdate, EditableAppraisal} from '../app/AppraisalWorkspace';
import {useComparableLeases} from '@api/hooks';
import ComparableLeaseList from './components/ComparableLeaseList';
import ComparableLeaseSearch from './components/ComparableLeaseSearch';
import ComparableLeasesMap from './components/ComparableLeasesMap';
import {
    addComparableId,
    comparableSearchRequest,
    defaultComparableSearch,
    removeComparableId,
    type ComparableSearch,
} from '../domain/comparables';
import type {ComparableLeaseCardRecord} from '../domain/comparableLeaseDraft';

type ComparableLease = ComparableLeaseCardRecord & {_id: string};

interface ViewComparableLeasesDatabaseProps {
    appraisal: EditableAppraisal;
    appraisalId: string;
    navigate?: unknown;
    search?: unknown;
    updateAppraisal(fields: AppraisalFieldUpdate): void;
}

export default function ViewComparableLeasesDatabase({
    appraisal,
    appraisalId,
    navigate,
    search,
    updateAppraisal,
}: ViewComparableLeasesDatabaseProps) {
    const [comparableLeases, setComparableLeases] = useState<ComparableLease[]>([]);
    const [sort, setSort] = useState('-leaseDate');
    const [queryFilters, setQueryFilters] = useState<Record<string, unknown> | null>(null);
    const searchRef = useRef<ComparableSearch>({});
    const mapSearchRef = useRef<ComparableSearch>({});
    const defaultSearch = useMemo(
        () => defaultComparableSearch('leaseDateFrom', appraisal.propertyType),
        [appraisal.propertyType],
    );

    useEffect(() => {
        searchRef.current = defaultSearch;
    }, [defaultSearch]);

    const comparableLeasesQuery = useComparableLeases(queryFilters ?? {}, {enabled: queryFilters !== null});

    const loadData = useCallback((nextSort = sort) => {
        setQueryFilters(comparableSearchRequest(searchRef.current, mapSearchRef.current, nextSort));
    }, [sort]);

    useEffect(() => {
        if (!comparableLeasesQuery.data) return;
        setComparableLeases(comparableLeasesQuery.data as ComparableLease[]);
    }, [comparableLeasesQuery.data]);

    const selectedLeaseIds = (appraisal.comparableLeases ?? []) as string[];
    const addComparableToAppraisal = (lease: ComparableLease) => {
        updateAppraisal({comparableLeases: addComparableId(selectedLeaseIds, lease._id)});
    };
    const removeComparableFromAppraisal = (lease: ComparableLease) => {
        updateAppraisal({comparableLeases: removeComparableId(selectedLeaseIds, lease._id)});
    };
    const onSearchChanged = (nextSearch: ComparableSearch) => {
        searchRef.current = nextSearch;
        void loadData();
    };
    const onMapSearchChanged = (nextMapSearch: ComparableSearch) => {
        mapSearchRef.current = nextMapSearch;
        void loadData();
    };
    const onSortChanged = (nextSort: string) => {
        setSort(nextSort);
        void loadData(nextSort);
    };

    return <div className="view-comparables-database">
        <Row><Col xs={12}><h3>Search for Comparables</h3></Col></Row>
        <ComparableLeaseSearch onChange={onSearchChanged} defaultSearch={defaultSearch}/>
        <Row>
            <Col xs={8}>
                <ComparableLeaseList
                    comparableLeases={comparableLeases}
                    statsTitle="Region Statistics"
                    allowNew
                    sort={sort}
                    onSortChanged={onSortChanged}
                    navigate={navigate}
                    search={search}
                    appraisal={appraisal}
                    appraisalId={appraisalId}
                    appraisalComparables={selectedLeaseIds}
                    onAddComparableClicked={addComparableToAppraisal}
                    onRemoveComparableClicked={removeComparableFromAppraisal}
                    onNewComparable={(lease: ComparableLease) => setComparableLeases(current => [lease, ...current])}
                    onChange={(leases: ComparableLease[]) => setComparableLeases(leases)}
                />
            </Col>
            <Col xs={4}>
                <ComparableLeasesMap
                    appraisal={appraisal}
                    comparableLeases={comparableLeases}
                    onMapSearchChanged={onMapSearchChanged}
                    onAddComparableToAppraisal={addComparableToAppraisal}
                    onRemoveComparableFromAppraisal={removeComparableFromAppraisal}
                />
            </Col>
        </Row>
    </div>;
}
