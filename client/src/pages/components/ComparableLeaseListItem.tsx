import React from 'react';
import { Button, Collapse, CardTitle, CardHeader, Row} from 'reactstrap';
import {useDeleteComparableLease, useUpdateComparableLease} from '@api/hooks';
import UploadableImageSet from "./UploadableImageSet";
import ComparableLeaseFields from './ComparableLeaseFields';
import {
    comparableLeaseDraftReducer,
    createComparableLeaseDraft,
    newComparableLeaseMarker,
    preparedComparableLeaseValues,
    type ComparableLeaseCardRecord,
    type ComparableLeaseDraft,
} from '../../domain/comparableLeaseDraft';
import {
    comparableLeaseListItemHeaderConfigurations,
    ComparableLeaseListItemHeaderColumn,
} from './comparable-lease/ComparableLeaseListItemHeader';
import {confirmBrowserAction} from '../../components/platform/browserActions';

type LeaseRecord = ComparableLeaseCardRecord;

interface ComparableLeaseListItemProps {
    comparableLease: LeaseRecord;
    headers: string[][];
    appraisal?: unknown;
    edit?: boolean;
    openByDefault?: boolean;
    last?: boolean;
    appraisalId?: unknown;
    appraisalComparables?: unknown;
    navigate?: unknown;
    search?: unknown;
    onChange?(comparableLease: LeaseRecord): void;
    onDeleteComparable?(comparableLease: LeaseRecord): void;
    onAddComparableClicked?(comparableLease: LeaseRecord): void;
    onRemoveComparableClicked?(comparableLease: LeaseRecord): void;
}

interface ComparableLeaseListItemState {
    openByDefault: boolean;
    detailsOpen?: boolean;
}

function ComparableLeaseListItem(incomingProps: ComparableLeaseListItemProps) {
    const props = {...incomingProps, edit: incomingProps.edit === undefined ? true : incomingProps.edit};
    const [state, setState] = React.useState<ComparableLeaseListItemState>(() => ({
        openByDefault: Boolean(!props.comparableLease._id || props.openByDefault || (props.comparableLease as Record<PropertyKey, unknown>)[newComparableLeaseMarker]),
    }));
    const [comparableLeaseDraft, dispatchComparableLeaseDraft] = React.useReducer(
        comparableLeaseDraftReducer,
        props.comparableLease,
        createComparableLeaseDraft,
    );
    const comparableLeaseSourceRef = React.useRef<LeaseRecord>(props.comparableLease);
    const updateComparableLease = useUpdateComparableLease();
    const deleteComparableLease = useDeleteComparableLease();
    const updateState = (updates: Partial<ComparableLeaseListItemState>) => {
        setState((currentState) => ({...currentState, ...updates}));
    };
    const comparableLease = comparableLeaseDraft.values;
    const saveComparable = (updatedComparable: LeaseRecord) => {
        updateComparableLease.mutate({id: updatedComparable._id as string, payload: updatedComparable});
    };
    const commitDraft = (nextDraft: ComparableLeaseDraft) => {
        const comparable = preparedComparableLeaseValues(nextDraft.values);
        const source = comparableLeaseSourceRef.current;
        dispatchComparableLeaseDraft({type: 'replace', values: comparable});
        Object.entries(comparable).forEach(([field, value]) => {
            source[field] = value;
        });

        if (source._id)
        {
            saveComparable(source);
        }
        props.onChange!(source);
    };
    const createNewEscalation = (key: string, value: unknown) => {
        if (value !== null)
        {
            commitDraft(comparableLeaseDraftReducer(comparableLeaseDraft, {
                type: 'append-escalation',
                escalation: {[key]: value},
            }));
        }
    };
    const changeEscalationField = (escalationIndex: number, field: string, newValue: unknown) => {
        commitDraft(comparableLeaseDraftReducer(comparableLeaseDraft, {
            type: 'edit-escalation', index: escalationIndex, field, value: newValue,
        }));
    };
    const removeEscalation = (escalationIndex: number) => {
        commitDraft(comparableLeaseDraftReducer(comparableLeaseDraft, {
            type: 'remove-escalation', index: escalationIndex,
        }));
    };
    const changeComparableField = (field: string, newValue: unknown) => {
        commitDraft(comparableLeaseDraftReducer(comparableLeaseDraft, {
            type: 'edit', field, value: newValue,
        }));
    };
    const deleteComparable = () => {
        if (confirmBrowserAction("Are you sure you want to delete the comparable?"))
        {
            props.onDeleteComparable!(comparableLeaseSourceRef.current);

            deleteComparableLease.mutate(comparableLeaseSourceRef.current._id as string);
        }
    };
    const isCompWithinAppraisal = (appraisalComparables?: unknown) => {
        if (!comparableLease._id)
        {
            return false;
        }
        if (!Array.isArray(appraisalComparables))
        {
            return false;
        }

        const id = comparableLease._id;

        for (let i = 0; i < appraisalComparables.length; i += 1)
        {
            if (appraisalComparables[i] === id)
            {
                return true;
            }
        }
        return false;
    };
    const toggleDetails = () => updateState({detailsOpen: !state.detailsOpen});
    const editableClass = props.edit ? "editable" : "non-editable";
    const expandedClass = state.detailsOpen ? "expanded" : "";
    const lastClass = props.last ? "last" : "";
    const detailsOpen = state.detailsOpen === undefined ? state.openByDefault : state.detailsOpen;

    React.useEffect(() => {
        comparableLeaseSourceRef.current = props.comparableLease;
        dispatchComparableLeaseDraft({type: 'replace', values: props.comparableLease});
        setState((currentState) => ({
            ...currentState,
            openByDefault: Boolean(!props.comparableLease._id || props.openByDefault || (props.comparableLease as Record<PropertyKey, unknown>)[newComparableLeaseMarker]),
        }));
    }, [props.comparableLease, props.openByDefault]);

    return (
            <div className={`card b comparable-lease-list-item ${expandedClass} ${lastClass}`}>
                <div>
                    {
                        props.onRemoveComparableClicked && isCompWithinAppraisal(props.appraisalComparables) ?
                            <div className={`comparable-button-row`}>
                                <Button color={"primary"} onClick={() => props.onRemoveComparableClicked!(comparableLeaseSourceRef.current)} className={"move-comparable-button"} title="Included in appraisal" aria-label="Remove comparable lease from appraisal">
                                    <i className={"fa fa-check-square"} />
                                </Button>
                                <Button color={"danger"} onClick={deleteComparable} className={"delete-comparable-button " + (state.detailsOpen ? "" : "hidden")} title="Delete comparable lease">
                                    <i className={"fa fa-trash-alt"} />
                                </Button>
                            </div> : null
                    }
                    {
                        props.onAddComparableClicked && !isCompWithinAppraisal(props.appraisalComparables) ?
                            <div className={`comparable-button-row`}>
                                <Button color={"primary"} onClick={() => props.onAddComparableClicked!(comparableLeaseSourceRef.current)} className={"move-comparable-button"} title="Not included in appraisal" aria-label="Add comparable lease to appraisal">
                                    <i className={"fa fa-square"} />
                                </Button>
                                <Button color={"danger"} onClick={deleteComparable} className={"delete-comparable-button " + (state.detailsOpen ? "" : "hidden")} title="Delete comparable lease">
                                    <i className={"fa fa-trash-alt"} />
                                </Button>
                            </div> : null
                    }
                </div>
                <div className={"comparable-lease-item-content"}>
                    {
                        comparableLease && comparableLease._id && !props.openByDefault ?
                            <CardHeader className={"comparable-lease-list-item-header"}>
                                <button
                                    type="button"
                                    className="comparable-expand-button"
                                    onClick={toggleDetails}
                                    aria-expanded={Boolean(detailsOpen)}
                                    aria-controls={`comparable-lease-details-${String(comparableLease._id).replace(/[^a-z0-9_-]/gi, '-')}`}
                                >
                                <CardTitle tag="div">
                                    <Row>
                                        {
                                            props.headers.map((headerFieldList, headerIndex) =>
                                            {
                                                return <ComparableLeaseListItemHeaderColumn
                                                    key={headerIndex}
                                                    size={comparableLeaseListItemHeaderConfigurations[headerFieldList[0]].size}
                                                    renders={headerFieldList.map((field) => comparableLeaseListItemHeaderConfigurations[field].render)}
                                                    fields={headerFieldList}
                                                    comparableLease={comparableLease}/>
                                            })
                                        }
                                    </Row>
                                </CardTitle>
                                </button>
                            </CardHeader> : null
                    }
                    <Collapse
                        id={comparableLease && comparableLease._id ? `comparable-lease-details-${String(comparableLease._id).replace(/[^a-z0-9_-]/gi, '-')}` : undefined}
                        isOpen={detailsOpen}
                    >
                        <div className={`card-body comparable-lease-list-item-body ${editableClass}`}>
                            <UploadableImageSet
                                editable={props.edit}
                                address={comparableLease.address as string | undefined}
                                value={comparableLease.imageUrls as string[] | null | undefined}
                                onChange={(newUrls: unknown) => changeComparableField('imageUrls', newUrls)}
                                captions={comparableLease.captions as string[] | null | undefined}
                                onChangeCaptions={(newCaptions: unknown) => changeComparableField('captions', newCaptions)}
                            />
                            <div className={`comparable-lease-content`}>
                                <div className={"comparable-fields-area"}>
                                    <ComparableLeaseFields
                                        comparableLease={comparableLease}
                                        editable={props.edit}
                                        appraisalLocation={(props.appraisal as {location?: LeaseRecord['location']} | undefined)?.location}
                                        onChange={changeComparableField}
                                        onChangeEscalation={changeEscalationField}
                                        onRemoveEscalation={removeEscalation}
                                        onCreateEscalation={createNewEscalation}
                                    />

                                </div>
                            </div>
                        </div>
                    </Collapse>
                </div>
            </div>
    );
}

export default ComparableLeaseListItem;
