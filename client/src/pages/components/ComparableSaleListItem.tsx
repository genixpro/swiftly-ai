import React from 'react';
import {Collapse} from 'reactstrap';
import {useComparableSalesByIds, useDeleteComparableSale, useSaveComparableSalePortfolio, useUpdateComparableSale} from '@api/hooks';
import {comparableSaleView} from '../../domain/comparableSales';
import {hasComparableSale, hasComparableSaleInCapRate, hasComparableSaleInDCA} from '../../domain/comparables';
import {comparableSaleDraftReducer, createComparableSaleDraft} from '../../domain/comparableSaleDraft';
import {addComparableSalePortfolioEntry, comparableSaleMapParams, newComparableSaleMarker, removeComparableSalePortfolioEntry, selectComparableSalePortfolioEntry} from '../../domain/comparableSaleCard';
import ComparableSaleSelectionControls from './ComparableSaleSelectionControls';
import ComparableSaleCardHeader from './ComparableSaleCardHeader';
import ComparableSaleDetailContent from './ComparableSaleDetailContent';
import {closedMapPinState, mapPinDragState, toggledMapPinState} from '../../components/platform/mapPin';
import {deleteComparableSaleWithConfirmation} from '../../components/platform/comparableSaleDeletion';
import {confirmBrowserAction} from '../../components/platform/browserActions';
import type {ComparableSaleCardRecord} from '../../domain/comparableSaleCard';
import type {ComparableSaleDraft} from '../../domain/comparableSaleDraft';
import type {ComparableSelectionAppraisal} from '../../domain/comparables';

let comparableSaleListItemInstance = 0;
type SaleRecord = ComparableSaleCardRecord;

interface ComparableSaleListItemProps {
    comparableSale: SaleRecord;
    appraisal?: unknown;
    headers: string[][];
    edit?: boolean;
    openByDefault?: boolean;
    showPropertyTypeInHeader?: boolean;
    last?: boolean;
    appraisalId?: unknown;
    navigate?: unknown;
    search?: unknown;
    appraisalComparables?: unknown;
    onChange?(comparableSale: SaleRecord): void;
    onChangePortfolio?(comparables: SaleRecord[]): void;
    onDeleteComparable?(comparableSale: SaleRecord): void;
    onAddComparableClicked?(comparableSale: SaleRecord): void;
    onRemoveComparableClicked?(comparableSale: SaleRecord): void;
    onAddCapRateClicked?(comparableSale: SaleRecord): void;
    onRemoveCapRateClicked?(comparableSale: SaleRecord): void;
    onRemoveDCAClicked?(comparableSale: SaleRecord): void;
    onAddDCAClicked?(comparableSale: SaleRecord): void;
}

interface ComparableSaleListItemState {
    comparableSale: SaleRecord;
    isDraggingPin: boolean;
    droppingPinX: number;
    droppingPinY: number;
    stabilizePopoverOpen: boolean;
    portfolioComps: SaleRecord[];
    portfolioDrafts: ComparableSaleDraft[];
    selectedPortfolioComp: number;
    openByDefault: boolean;
    detailsOpen?: boolean;
    placePinOnMapPopoverOpen?: boolean;
}

function ComparableSaleListItem(incomingProps: ComparableSaleListItemProps) {
    const props = {
        ...incomingProps,
        edit: incomingProps.edit === undefined ? true : incomingProps.edit,
        openByDefault: incomingProps.openByDefault === undefined ? false : incomingProps.openByDefault,
        showPropertyTypeInHeader: incomingProps.showPropertyTypeInHeader === undefined ? true : incomingProps.showPropertyTypeInHeader,
        last: incomingProps.last === undefined ? false : incomingProps.last,
    };
    const [state, setState] = React.useState<ComparableSaleListItemState>(() => ({
        comparableSale: {}, isDraggingPin: true, droppingPinX: 0, droppingPinY: 0, stabilizePopoverOpen: false,
        portfolioComps: [], portfolioDrafts: [], selectedPortfolioComp: -1,
        openByDefault: Boolean(!props.comparableSale._id || props.openByDefault || (props.comparableSale as Record<PropertyKey, unknown>)[newComparableSaleMarker]),
    }));
    const comparableSaleSourceRef = React.useRef<SaleRecord>(props.comparableSale);
    const [comparableSaleDraft, dispatchComparableSaleDraft] = React.useReducer(comparableSaleDraftReducer, props.comparableSale, createComparableSaleDraft);
    const popoverIdRef = React.useRef(`comparable-sale-list-item-${comparableSaleListItemInstance++}`);
    const initialPropsRef = React.useRef(props);
    const portfolioComparableIdsRef = React.useRef(props.comparableSale.isPortfolioCompilation ? (props.comparableSale.portfolioLinkedComps ?? []) : []);
    const portfolioCompsQuery = useComparableSalesByIds(portfolioComparableIdsRef.current);
    const updateComparableSale = useUpdateComparableSale();
    const deleteComparableSale = useDeleteComparableSale();
    const saveComparableSalePortfolio = useSaveComparableSalePortfolio();
    const updateState = (updates: Partial<ComparableSaleListItemState>) => setState((currentState) => ({...currentState, ...updates}));
    const saveComparable = (updatedComparable: SaleRecord) => updateComparableSale.mutate({id: updatedComparable._id as string, payload: updatedComparable});
    const getSelectedComparable = () => state.selectedPortfolioComp === -1
        ? comparableSaleDraft.values
        : state.portfolioDrafts[state.selectedPortfolioComp]?.values ?? state.portfolioComps[state.selectedPortfolioComp];
    const getSelectedComparableSource = () => state.selectedPortfolioComp === -1
        ? comparableSaleSourceRef.current
        : state.portfolioComps[state.selectedPortfolioComp];
    const updateSelectedComparable = (newComparable: SaleRecord, nextDraft?: ComparableSaleDraft) => {
        if (state.selectedPortfolioComp === -1) {
            if (newComparable._id) saveComparable(newComparable);
            props.onChange!(newComparable);
            return;
        }
        const portfolioComps = [...state.portfolioComps];
        portfolioComps[state.selectedPortfolioComp] = newComparable;
        const portfolioDrafts = nextDraft
            ? state.portfolioDrafts.map((draft, index) => index === state.selectedPortfolioComp ? nextDraft : draft)
            : state.portfolioDrafts;
        updateState({portfolioComps, portfolioDrafts});
        if (props.onChangePortfolio) props.onChangePortfolio(portfolioComps);
        if (newComparable._id) saveComparable(newComparable);
        saveComparableSalePortfolio.mutateAsync({portfolio: props.comparableSale, subComps: portfolioComps}).then((newPortfolioComp) => {
            newPortfolioComp._id = props.comparableSale._id as string;
            if (newComparable._id) saveComparable(newPortfolioComp);
            props.onChange!(newPortfolioComp);
        });
    };
    const changeComparableField = (field: string, newValue: unknown) => {
        const comparable = getSelectedComparableSource();
        const currentDraft = state.selectedPortfolioComp === -1
            ? comparableSaleDraft
            : state.portfolioDrafts[state.selectedPortfolioComp] ?? createComparableSaleDraft(comparable);
        const nextDraft = comparableSaleDraftReducer(currentDraft, {
            type: newValue ? 'edit' : 'edit-without-recalculate', field, value: newValue,
        });
        if (state.selectedPortfolioComp === -1) dispatchComparableSaleDraft({type: 'commit', draft: nextDraft});
        Object.assign(comparable, nextDraft.values);
        updateSelectedComparable(comparable, state.selectedPortfolioComp === -1 ? undefined : nextDraft);
    };
    const deleteComparable = () => deleteComparableSaleWithConfirmation({
        comparableSale: props.comparableSale,
        deleteById: (id) => deleteComparableSale.mutateAsync(id),
        onDelete: (comparableSale) => props.onDeleteComparable!(comparableSale as SaleRecord),
    });
    const toggleDetails = () => updateState({detailsOpen: !state.detailsOpen});
    const onPinMapMouseMove = (event: React.MouseEvent<HTMLElement>) => updateState(mapPinDragState(event));
    const onPinMapMouseOff = () => updateState(closedMapPinState());
    const onPinMapMouseClicked = (event: {lng: number; lat: number}) => changeComparableField('location', {type: 'Point', coordinates: [event.lng, event.lat]});
    const togglePlacePinView = () => updateState(toggledMapPinState(Boolean(state.placePinOnMapPopoverOpen)));
    const toggleStabilizeNOIPopover = () => updateState({stabilizePopoverOpen: !state.stabilizePopoverOpen});
    const addEntryToPortfolio = () => updateState(addComparableSalePortfolioEntry(state));
    const changeSelectedComp = (newSelectionIndex: number) => updateState(selectComparableSalePortfolioEntry(newSelectionIndex));
    const deleteEntryFromPortfolio = (portfolioCompIndex: number, event: React.SyntheticEvent) => {
        event.stopPropagation();
        if (confirmBrowserAction('Are you sure you want to delete the comparable from this portfolio?')) {
            const comp = state.portfolioComps[portfolioCompIndex];
            if (comp._id) deleteComparableSale.mutate(comp._id);
            updateState(removeComparableSalePortfolioEntry(state, portfolioCompIndex));
        }
    };

    React.useEffect(() => {
        if (comparableSaleSourceRef.current !== props.comparableSale) {
            comparableSaleSourceRef.current = props.comparableSale;
            dispatchComparableSaleDraft({type: 'replace', values: props.comparableSale});
        }
    }, [props.comparableSale]);
    React.useEffect(() => {
        const initialProps = initialPropsRef.current;
        if (initialProps.comparableSale.isPortfolioCompilation && portfolioCompsQuery.data) {
            const drafts = portfolioCompsQuery.data.map(createComparableSaleDraft);
            setState((currentState) => ({...currentState, portfolioComps: drafts.map(draft => draft.values), portfolioDrafts: drafts}));
        }
    }, [portfolioCompsQuery.data]);

    const expandedClass = state.detailsOpen ? 'expanded' : '';
    const lastClass = props.last ? 'last' : '';
    let comparableSale = getSelectedComparable();
    const detailsOpen = state.detailsOpen === undefined ? state.openByDefault : state.detailsOpen;
    let allowEdit = props.edit;
    if (comparableSale.isPortfolioCompilation) {
        if (state.selectedPortfolioComp !== -1) comparableSale = state.portfolioComps[state.selectedPortfolioComp];
        else allowEdit = false;
    }
    const comparableSaleSource = getSelectedComparableSource();
    const includedInAppraisal = hasComparableSale(props.appraisal as ComparableSelectionAppraisal, comparableSaleSource);
    const includedInDCA = hasComparableSaleInDCA(props.appraisal as ComparableSelectionAppraisal, comparableSaleSource);
    const includedInCapRate = hasComparableSaleInCapRate(props.appraisal as ComparableSelectionAppraisal, comparableSaleSource);
    comparableSale = comparableSaleView(comparableSale);

    return <div className={`card b comparable-sale-list-item ${expandedClass} ${lastClass}`}>
        <div className="comparable-sale-list-item-button-column">
            <ComparableSaleSelectionControls props={props} comparableSale={comparableSaleSource} detailsOpen={detailsOpen} includedInAppraisal={includedInAppraisal} onDelete={deleteComparable}/>
        </div>
        <div className="comparable-sale-item-content">
            <ComparableSaleCardHeader comparableSale={comparableSale} headers={props.headers} openByDefault={props.openByDefault} detailsOpen={detailsOpen} onToggle={toggleDetails}/>
            <Collapse id={comparableSale._id ? `comparable-details-${String(comparableSale._id).replace(/[^a-z0-9_-]/gi, '-')}` : undefined} isOpen={detailsOpen}>
                <ComparableSaleDetailContent
                    comparableSale={comparableSale}
                    comparableSaleSource={comparableSaleSource}
                    editable={allowEdit}
                    includedInCapRate={includedInCapRate}
                    includedInDCA={includedInDCA}
                    itemProps={props}
                    mapParams={comparableSaleMapParams(getSelectedComparable())}
                    onAddPortfolioEntry={addEntryToPortfolio}
                    onChange={changeComparableField}
                    onDeletePortfolioEntry={deleteEntryFromPortfolio}
                    onMapClick={onPinMapMouseClicked}
                    onMapMouseLeave={onPinMapMouseOff}
                    onMapMouseMove={onPinMapMouseMove}
                    onSelectPortfolioEntry={changeSelectedComp}
                    onToggleMap={togglePlacePinView}
                    onToggleStabilizedNoi={toggleStabilizeNOIPopover}
                    pin={{popoverId: popoverIdRef.current, open: state.placePinOnMapPopoverOpen ?? false, isDraggingPin: state.isDraggingPin, droppingPinX: state.droppingPinX, droppingPinY: state.droppingPinY}}
                    portfolio={{comps: state.portfolioComps, selected: state.selectedPortfolioComp}}
                    stabilizedNoi={{open: state.stabilizePopoverOpen, popoverId: popoverIdRef.current}}
                />
            </Collapse>
        </div>
    </div>;
}

export default ComparableSaleListItem;
