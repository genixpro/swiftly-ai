import React from 'react';
import { mapConcurrent } from '@utils/promises';
import ComparableSaleListItem from './ComparableSaleListItem';
import {Row, CardHeader, CardTitle} from 'reactstrap';
import ComparableSalesStatistics from "./ComparableSalesStatistics"
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {useCreateComparableSale} from '@api/hooks';
import {createComparableSaleDraft} from '../../domain/comparableSaleDraft';
import {
    comparableSaleListHeaderConfigurations,
    ComparableSaleListHeaderColumn,
    defaultComparableSaleHeaderFields,
    defaultComparableSaleStatsFields,
} from './comparable-sale/ComparableSaleListHeader';
import {newComparableSaleMarker, type ComparableSaleCardRecord} from '../../domain/comparableSaleCard';

type SaleRecord = ComparableSaleCardRecord;

interface ComparableSaleListProps {
    comparableSales?: readonly SaleRecord[];
    comparableSale?: unknown;
    excludeIds?: string[];
    headers?: string[][];
    stats?: unknown;
    statsPosition?: string;
    statsTitle?: string;
    sort?: string;
    noCompMessage?: string;
    search?: Record<string, unknown>;
    appraisal?: unknown;
    appraisalId?: unknown;
    appraisalComparables?: unknown;
    navigate?: unknown;
    allowNew?: boolean;
    showPropertyTypeInHeader?: boolean;
    onChange?(comparables: SaleRecord[]): void;
    onNewComparable?(comparable: SaleRecord): void;
    onSortChanged?(sort: string): void;
    onAddComparableClicked?(comparable: SaleRecord): void;
    onRemoveComparableClicked?(comparable: SaleRecord): void;
    onRemoveDCAClicked?(comparable: SaleRecord): void;
    onRemoveCapRateClicked?(comparable: SaleRecord): void;
    onAddDCAClicked?(comparable: SaleRecord): void;
    onAddCapRateClicked?(comparable: SaleRecord): void;
}

interface ComparableSaleListState {
    comparableSales: SaleRecord[];
    newComparableSale: SaleRecord;
    isCreatingNewItem: boolean;
    portfolioComps?: SaleRecord[];
    sort?: string;
}

function ComparableSaleList(incomingProps: ComparableSaleListProps) {
    const props = {
        ...incomingProps,
        sort: incomingProps.sort === undefined ? '-date' : incomingProps.sort as string,
        statsPosition: incomingProps.statsPosition === undefined ? 'above' : incomingProps.statsPosition,
        showPropertyTypeInHeader: incomingProps.showPropertyTypeInHeader === undefined ? true : incomingProps.showPropertyTypeInHeader,
        noCompMessage: incomingProps.noCompMessage === undefined ? 'There are no comparables. Please add a new one or change your search settings.' : incomingProps.noCompMessage,
        search: incomingProps.search === undefined ? {} : incomingProps.search,
    };
    const [state, setState] = React.useState<ComparableSaleListState>(() => ({
        comparableSales: [],
        newComparableSale: createComparableSaleDraft({}).values as SaleRecord,
        isCreatingNewItem: false,
    }));
    const lastNewCompRef = React.useRef<SaleRecord | null>(null);
    const createComparableSale = useCreateComparableSale();
    const setListState = (updates: Partial<ComparableSaleListState>) => {
        setState((currentState) => ({...currentState, ...updates}));
    };
    const updateComparables = () => {
        if (props.comparableSales !== state.comparableSales)
        {
            // Keep the parent-owned list references exactly as the legacy screen did.
            setListState({comparableSales: props.comparableSales as SaleRecord[]});
        }
    };
    const addNewComparable = (newComparable: SaleRecord) => {
        if (newComparable === lastNewCompRef.current)
        {
            return;
        }
        lastNewCompRef.current = newComparable;

        mapConcurrent(state.portfolioComps as SaleRecord[], (newPortfolioComp: SaleRecord) =>
            createComparableSale.mutateAsync(newPortfolioComp),
        ).then((portfolioResponses) =>
        {
            newComparable.portfolioLinkedComps = portfolioResponses;
            createComparableSale.mutateAsync(newComparable).then((comparableId) =>
            {
                newComparable["_id"] = comparableId;
                Reflect.set(newComparable, newComparableSaleMarker, true);
                lastNewCompRef.current = null;
                props.onNewComparable!(newComparable);
                setListState({isCreatingNewItem: false, newComparableSale: createComparableSaleDraft({}).values as SaleRecord});
            }, () =>
            {
                lastNewCompRef.current = null;
            });
        }, () =>
        {
            lastNewCompRef.current = null;
        });
    };
    const updateComparable = (changedComp: SaleRecord, index: number) => {
        const comparables = state.comparableSales;
        comparables[index] = changedComp;
        props.onChange?.(comparables);
    };
    const onRemoveComparableClicked = (comparable: SaleRecord) => {
        const comparables = state.comparableSales;
        const index = state.comparableSales.findIndex((currentComparable) => currentComparable._id === comparable._id);
        if (index !== -1) comparables.splice(index, 1);
        props.onChange?.(comparables);
    };
    const toggleNewItem = () => {
        const newComp = state.newComparableSale;
        newComp.isPortfolioCompilation = null;
        setListState({isCreatingNewItem: false, newComparableSale: newComp});
    };
    const toggleCreateNewItem = () => setListState({isCreatingNewItem: true});
    const changeSortColumn = (field: string) => {
        const newSort = (`+${field}` === props.sort) ? `-${field}` : (`-${field}` === props.sort) ? `+${field}` : `-${field}`;
        props.onSortChanged?.(newSort);
        setListState({sort: newSort});
    };
    const setNewCompType = (type: string) => {
        const newComp = state.newComparableSale;
        newComp.isPortfolioCompilation = type === 'portfolio';
        setListState({newComparableSale: newComp});
    };

    const excludeIds = props.excludeIds ?? [];
    const firstSpacing = props.onRemoveComparableClicked ? 'first-spacing' : '';
    const headerFields = props.headers || defaultComparableSaleHeaderFields(props.search);
    const statsFields = (props.stats || defaultComparableSaleStatsFields(props.search)) as string[];

    React.useEffect(() => {
        updateComparables();
    });

    return (
            <div>
                {
                    props.statsPosition === "above" ? <ComparableSalesStatistics
                        comparableSales={state.comparableSales}
                        title={props.statsTitle}
                        stats={statsFields}
                    /> : null
                }
                <div>
                    {
                        props.allowNew ?
                            <div className={"new-comparable-sale-popup"}>
                                <button type="button" className="card b new-comparable-sale" onClick={toggleCreateNewItem}>
                                    <div className="card-body"><span>Create new comparable...</span></div>
                                </button>
                                <Modal isOpen={state.isCreatingNewItem} toggle={toggleNewItem} className={"new-comp-dialog"}>
                                    <ModalHeader toggle={toggleNewItem}>New Comparable Sale</ModalHeader>
                                    <ModalBody>
                                        {
                                            state.newComparableSale.isPortfolioCompilation === null ?
                                                <div className={"comparable-type-buttons"}>
                                                    <Button outline={'primary' as never} className={"comp-type-button"} onClick={() => setNewCompType("regular")}>
                                                        <em className="type-icon fa-2x fas fa-file-alt"></em>
                                                        {/*<div className={"description-block"}>*/}
                                                        <br />
                                                            Create Regular Comp
                                                        {/*</div>*/}
                                                    </Button>
                                                    <Button outline={'primary' as never} className={"comp-type-button"} onClick={() => setNewCompType("portfolio")}>
                                                        <em className="type-icon fa-2x fas fa-copy"></em>
                                                        {/*<div className={"description-block"}>*/}
                                                        <br />
                                                            Create Portfolio Comp
                                                        {/*</div>*/}
                                                    </Button>
                                                </div> : null
                                        }
                                        {
                                            state.newComparableSale.isPortfolioCompilation !== null ?
                                                <div>
                                                    <ComparableSaleListItem
                                                        appraisal={props.appraisal}
                                                        headers={headerFields}
                                                        comparableSale={state.newComparableSale}
                                                        openByDefault={true}
                                                        onChange={(comp: SaleRecord) => setListState({newComparableSale: comp})}
                                                        onChangePortfolio={(portfolioComps: SaleRecord[]) => setListState({portfolioComps})}
                                                    />
                                                </div> : null
                                        }
                                    </ModalBody>
                                    {
                                        state.newComparableSale.isPortfolioCompilation !== null ?
                                            <ModalFooter>
                                                <Button color="primary" onClick={() => addNewComparable(state.newComparableSale)}>Add</Button>{' '}
                                                <Button color="primary" onClick={toggleNewItem}>Cancel</Button>{' '}
                                            </ModalFooter> : null
                                    }
                                </Modal>
                            </div> : null
                    }
                {
                    <div className={`card b comparable-sale-list-header`}>
                        <CardHeader className={`comparable-sale-list-item-header ${firstSpacing}`}>
                            <CardTitle tag="div">
                                <Row>
                                    {
                                        headerFields.map((headerFieldList, headerIndex) =>
                                        {
                                            return <ComparableSaleListHeaderColumn
                                                key={headerIndex}
                                                size={comparableSaleListHeaderConfigurations[headerFieldList[0]].size}
                                                texts={headerFieldList.map((field) => comparableSaleListHeaderConfigurations[field].title)}
                                                fields={headerFieldList}
                                                sort={props.sort}
                                                changeSortColumn={changeSortColumn}
                                            />
                                        })
                                    }
                                </Row>
                            </CardTitle>
                        </CardHeader>
                    </div>
                }
                {
                    state.comparableSales.map((comparableSale, index) =>
                    {
                        if (excludeIds.indexOf(comparableSale._id as string) === -1)
                        {
                            return <ComparableSaleListItem
                                headers={headerFields}
                                key={comparableSale._id}
                                comparableSale={comparableSale}
                                navigate={props.navigate} search={props.search}
                                appraisal={props.appraisal}
                                onChange={(comp: SaleRecord) => updateComparable(comp, index)}
                                onAddComparableClicked={props.onAddComparableClicked}
                                onRemoveComparableClicked={props.onRemoveComparableClicked}
                                onRemoveDCAClicked={props.onRemoveDCAClicked}
                                onRemoveCapRateClicked={props.onRemoveCapRateClicked}
                                onAddDCAClicked={props.onAddDCAClicked}
                                onAddCapRateClicked={props.onAddCapRateClicked}
                                onDeleteComparable={onRemoveComparableClicked}
                                last={index===state.comparableSales.length-1}
                            />;
                        }
                        else
                        {
                            return null;
                        }
                    })
                }
                <div>
                    {
                        state.comparableSales.length === 0 ? <div className="card b no-comparables-found">
                            <div className="card-body">
                                <span>{props.noCompMessage}</span>
                            </div>
                        </div> : null
                    }
                </div>
                </div>
                {
                    props.statsPosition === "below" ? <div><br/>
                        <ComparableSalesStatistics
                            comparableSales={state.comparableSales}
                            title={props.statsTitle}
                            stats={statsFields}
                        /></div> : null
                }
            </div>
    );
}


export default ComparableSaleList;
