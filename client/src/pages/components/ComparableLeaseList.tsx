import React from 'react';
import ComparableLeaseListItem from './ComparableLeaseListItem';
import {Row, CardHeader, CardTitle} from 'reactstrap';
import {useComparableLeasesByIds, useCreateComparableLease} from '@api/hooks';
import ComparableLeasesStatistics from "./ComparableLeasesStatistics";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {createComparableLeaseDraft, type ComparableLeaseCardRecord} from '../../domain/comparableLeaseDraft';
import {
    comparableLeaseHeaderConfigurations,
    ComparableLeaseListHeaderColumn,
    defaultComparableLeaseHeaderFields,
    defaultComparableLeaseStatsFields,
} from './comparable-lease/ComparableLeaseHeader';

type LegacyRecord = ComparableLeaseCardRecord;

interface ComparableLeaseListProps {
    comparableLeases?: readonly LegacyRecord[] | null;
    comparableLeaseIds?: string[];
    excludeIds?: string[];
    headers?: string[][];
    stats?: string[];
    statsPosition?: string;
    statsTitle?: string;
    sort?: unknown;
    noCompMessage?: string;
    appraisal?: unknown;
    appraisalComparables?: unknown;
    appraisalId?: unknown;
    navigate?: unknown;
    search?: unknown;
    allowNew?: boolean;
    comparableLease?: LegacyRecord;
    onChange?(comparables: LegacyRecord[]): void;
    onNewComparable?(comparable: LegacyRecord): void;
    onSortChanged?(sort: string): void;
    onAddComparableClicked?(comparable: LegacyRecord): void;
    onRemoveComparableClicked?(comparable: LegacyRecord): void;
}

interface ComparableLeaseListState {
    comparableLeases: LegacyRecord[];
    newComparableLease: LegacyRecord;
    isCreatingNewItem: boolean;
    sort?: string;
}

function ComparableLeaseList(incomingProps: ComparableLeaseListProps) {
    const props = {
        ...incomingProps,
        sort: incomingProps.sort === undefined ? '-date' : incomingProps.sort as string,
        noCompMessage: incomingProps.noCompMessage === undefined ? 'There are no comparables. Please add a new one or change your search settings.' : incomingProps.noCompMessage,
        statsPosition: incomingProps.statsPosition === undefined ? 'above' : incomingProps.statsPosition,
    };
    const [state, setState] = React.useState<ComparableLeaseListState>(() => ({
        comparableLeases: [],
        newComparableLease: createComparableLeaseDraft({rentType: 'net'}).values as LegacyRecord,
        isCreatingNewItem: false,
    }));
    const comparableLeaseIdsRef = React.useRef<string[] | undefined>(undefined);
    const lastNewCompRef = React.useRef<LegacyRecord | null>(null);
    const createComparableLease = useCreateComparableLease();
    const comparableLeaseIds = props.comparableLeaseIds || [];
    const shouldLoadComparableLeaseIds = !props.comparableLeases && Boolean(props.comparableLeaseIds);
    const comparableLeasesQuery = useComparableLeasesByIds(comparableLeaseIds, {enabled: shouldLoadComparableLeaseIds});
    const setListState = (updates: Partial<ComparableLeaseListState>) => {
        setState((currentState) => ({...currentState, ...updates}));
    };
    const updateComparables = () => {
        if (props.comparableLeases)
        {
            if (props.comparableLeases !== state.comparableLeases)
            {
                setListState({comparableLeases: props.comparableLeases as LegacyRecord[]});
            }
        }
        else if (props.comparableLeaseIds && comparableLeasesQuery.data)
        {
            if (props.comparableLeaseIds !== comparableLeaseIdsRef.current)
            {
                comparableLeaseIdsRef.current = props.comparableLeaseIds;
                setListState({
                    comparableLeases: comparableLeasesQuery.data.map((comparableLease: LegacyRecord) => createComparableLeaseDraft(comparableLease).values as LegacyRecord),
                });
            }
        }
    };
    const toggleNewItem = () => setListState({isCreatingNewItem: false});
    const addNewComparable = (newComparable: LegacyRecord) => {
        if (newComparable === lastNewCompRef.current)
        {
            return;
        }
        lastNewCompRef.current = newComparable;
        createComparableLease.mutateAsync(newComparable).then((comparableId) =>
        {
            newComparable["_id"] = comparableId;
            Reflect.set(newComparable, ComparableLeaseListItem._newLease, true);
            lastNewCompRef.current = null;
            props.onNewComparable!(newComparable);
            setListState({isCreatingNewItem: false, newComparableLease: createComparableLeaseDraft({}).values as LegacyRecord});
        }, () =>
        {
            lastNewCompRef.current = null;
        });
    };
    const updateComparable = (changedComp: LegacyRecord, index: number) => {
        const comparables = state.comparableLeases;
        comparables[index] = changedComp;
        props.onChange?.(comparables);
    };
    const onRemoveComparableClicked = (comparable: LegacyRecord) => {
        const comparables = state.comparableLeases;
        const index = state.comparableLeases.findIndex((currentComparable) => currentComparable._id === comparable._id);
        if (index !== -1) comparables.splice(index, 1);
        props.onChange?.(comparables);
    };
    const toggleCreateNewItem = () => setListState({isCreatingNewItem: true});
    const changeSortColumn = (field: string) => {
        const newSort = (`+${field}` === props.sort) ? `-${field}` : (`-${field}` === props.sort) ? `+${field}` : `-${field}`;
        props.onSortChanged?.(newSort);
        setListState({sort: newSort});
    };
    const excludeIds = props.excludeIds ?? [];
    const firstSpacing = props.onRemoveComparableClicked ? 'first-spacing' : '';
    const headerFields = props.headers || defaultComparableLeaseHeaderFields;
    const statsFields = props.stats || defaultComparableLeaseStatsFields;

    React.useEffect(() => {
        updateComparables();
    }, [props.comparableLeases, props.comparableLeaseIds, comparableLeasesQuery.data]);

    return (
            <div>
                {
                    props.statsPosition === "above" ?
                        <ComparableLeasesStatistics comparableLeases={state.comparableLeases} title={props.statsTitle} stats={statsFields} />
                        : null
                }
                {
                    <div className={`card b comparable-lease-list-header`}>
                        <CardHeader className={`comparable-lease-list-item-header ${firstSpacing}`}>
                            <CardTitle tag="div">
                                <Row>
                                    {
                                        headerFields.map((headerFieldList: string[], headerIndex: number) =>
                                        {
                                            return <ComparableLeaseListHeaderColumn
                                                key={headerIndex}
                                                size={comparableLeaseHeaderConfigurations[headerFieldList[0]].size}
                                                texts={headerFieldList.map((field) => comparableLeaseHeaderConfigurations[field].title)}
                                                fields={headerFieldList}
                                                sortField={comparableLeaseHeaderConfigurations[headerFieldList[0]].sortField || headerFieldList[0]}
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
                    props.allowNew ?
                        <div>
                            <button type="button" className="card b new-comparable" onClick={toggleCreateNewItem}>
                                <div className="card-body"><span>Create new comparable...</span></div>
                            </button>
                            <Modal isOpen={state.isCreatingNewItem} toggle={toggleNewItem} className={"new-comp-dialog"}>
                                        <ModalHeader toggle={toggleNewItem}>New Comparable Lease</ModalHeader>
                                        <ModalBody>
                                            <ComparableLeaseListItem
                                                headers={headerFields}
                                                comparableLease={state.newComparableLease}
                                                openByDefault={true}
                                                appraisal={props.appraisal}
                                                onChange={(comp: LegacyRecord) => setListState({newComparableLease: comp})}/>
                                        </ModalBody>
                                        <ModalFooter>
                                        <Button color="primary" onClick={() => addNewComparable(state.newComparableLease)}>Save</Button>{' '}
                                        <Button color="primary" onClick={() => toggleNewItem}>Cancel</Button>{' '}
                                </ModalFooter>
                            </Modal>
                        </div> : null
                }
                {
                    state.comparableLeases.map((comparableLease: LegacyRecord, index: number) =>
                    {
                        if (excludeIds.indexOf(comparableLease._id as string) === -1)
                        {
                            return <ComparableLeaseListItem
                                headers={headerFields}
                                key={comparableLease._id}
                                comparableLease={comparableLease}
                                navigate={props.navigate} search={props.search}
                                onChange={(comp: LegacyRecord) => updateComparable(comp, index)}
                                appraisalComparables={props.appraisalComparables}
                                onAddComparableClicked={props.onAddComparableClicked}
                                onRemoveComparableClicked={props.onRemoveComparableClicked}
                                onDeleteComparable={onRemoveComparableClicked}
                                appraisalId={props.appraisalId}
                                appraisal={props.appraisal}
                                last={index===state.comparableLeases.length-1}
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
                        state.comparableLeases.length === 0 ? <div className="card b no-comparables-found">
                            <div className="card-body">
                                <span>{props.noCompMessage}</span>
                            </div>
                        </div> : null
                    }
                </div>
                {
                    props.statsPosition === "below" ? <div><br/>
                        <ComparableLeasesStatistics comparableLeases={state.comparableLeases} title={props.statsTitle} stats={statsFields} />
                    </div> : null
                }
            </div>
    );
}


export default ComparableLeaseList;
