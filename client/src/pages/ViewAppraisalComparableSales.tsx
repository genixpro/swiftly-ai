import {useEffect, useRef, useState} from 'react';
import {Col, Row} from 'reactstrap';
import type {AppraisalFieldUpdate, EditableAppraisal} from '../app/AppraisalWorkspace';
import {useComparableSalesByIds} from '@api/hooks';
import {addComparableId, removeComparableId, sortComparables} from '../domain/comparables';
import ComparableSaleList from './components/ComparableSaleList';
import ComparableSalesMap from './components/ComparableSalesMap';
import type {ComparableSaleCardRecord} from '../domain/comparableSaleCard';

type SalesField = 'comparableSalesCapRate' | 'comparableSalesDCA';
type LegacyComparableSale = ComparableSaleCardRecord & {_id: string};
interface Props {
    appraisal: EditableAppraisal;
    appraisalId: string;
    compsField?: SalesField;
    navigate?: unknown;
    search?: unknown;
    updateAppraisal(fields: AppraisalFieldUpdate): void;
}

export default function ViewAppraisalComparableSales({
    appraisal,
    appraisalId,
    compsField = 'comparableSalesCapRate',
    navigate,
    search,
    updateAppraisal,
}: Props) {
    const [comparableSales, setComparableSales] = useState<LegacyComparableSale[]>([]);
    const [sort, setSort] = useState('-saleDate');
    const selectedIds = (appraisal[compsField] ?? []) as string[];
    const capRateIds = (appraisal.comparableSalesCapRate ?? []) as string[];
    const dcaIds = (appraisal.comparableSalesDCA ?? []) as string[];

    // The legacy page refetched only when the route selection field changed,
    // not after an in-place add/remove. Keep that load cadence while query
    // state owns the network request and cache.
    const selectedIdsForLoad = useRef<{field: SalesField; ids: string[]} | null>(null);
    let selectionSnapshot = selectedIdsForLoad.current;
    if (!selectionSnapshot || selectionSnapshot.field !== compsField) {
        selectionSnapshot = {field: compsField, ids: selectedIds};
        selectedIdsForLoad.current = selectionSnapshot;
    }
    const comparableSalesQuery = useComparableSalesByIds(selectionSnapshot.ids);

    useEffect(() => {
        if (!comparableSalesQuery.data) return;
        setComparableSales(sortComparables(comparableSalesQuery.data, '-saleDate') as LegacyComparableSale[]);
    }, [comparableSalesQuery.data]);

    const addComparableToAppraisal = (sale: LegacyComparableSale) => {
        updateAppraisal({[compsField]: addComparableId(selectedIds, sale._id)});
    };
    const removeComparableFromAppraisal = (sale: LegacyComparableSale) => {
        const index = selectedIds.indexOf(sale._id);
        updateAppraisal({[compsField]: removeComparableId(selectedIds, sale._id)});
        // Preserve the original positional local-row removal after an id is removed.
        if (index !== -1) setComparableSales(current => current.filter((_, currentIndex) => currentIndex !== index));
    };
    const addComparableToDca = (sale: LegacyComparableSale) => updateAppraisal({comparableSalesDCA: addComparableId(dcaIds, sale._id)});
    const removeComparableFromDca = (sale: LegacyComparableSale) => updateAppraisal({comparableSalesDCA: removeComparableId(dcaIds, sale._id)});
    const addComparableToCapRate = (sale: LegacyComparableSale) => updateAppraisal({comparableSalesCapRate: addComparableId(capRateIds, sale._id)});
    const removeComparableFromCapRate = (sale: LegacyComparableSale) => updateAppraisal({comparableSalesCapRate: removeComparableId(capRateIds, sale._id)});
    const onSortChanged = (nextSort: string) => {
        setSort(nextSort);
        setComparableSales(current => sortComparables(current, nextSort) as LegacyComparableSale[]);
    };

    return <div className="view-appraisal-comparable-sales">
        <Row><Col xs={10}><h3>View Comparable Sales</h3></Col></Row>
        <Row>
            <Col xs={12} md={8} className="comparables-list-column"><ComparableSaleList
                comparableSales={comparableSales} statsTitle="Statistics for Selected Comps" allowNew={false} sort={sort}
                onSortChanged={onSortChanged}
                noCompMessage="There are no comparables attached to this appraisal. Please go to the comparables database and select comparables from there."
                navigate={navigate} search={search as Record<string, unknown>} appraisal={appraisal} appraisalId={appraisalId} appraisalComparables={selectedIds}
                onRemoveComparableClicked={removeComparableFromAppraisal} onChange={(sales: LegacyComparableSale[]) => setComparableSales(sales)}
                onRemoveDCAClicked={removeComparableFromDca} onRemoveCapRateClicked={removeComparableFromCapRate}
                onAddDCAClicked={addComparableToDca} onAddCapRateClicked={addComparableToCapRate}
            /></Col>
            <Col xs={12} md={4} className="comparables-map-column"><ComparableSalesMap
                appraisal={appraisal} comparableSales={comparableSales}
                onAddComparableToAppraisal={addComparableToAppraisal} onRemoveComparableFromAppraisal={removeComparableFromAppraisal}
            /></Col>
        </Row>
    </div>;
}
