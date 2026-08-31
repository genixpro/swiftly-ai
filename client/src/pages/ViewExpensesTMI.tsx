import React from 'react';
import {Row, Col, Card, CardBody, Button} from 'reactstrap';
import {useComparableLeasesByIds} from '@api/hooks';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import AppraisalContentHeader from './components/AppraisalContentHeader';
import '@components/Common/datetime-compat.css'
import ComparableLeaseList from "./components/ComparableLeaseList";
import {sortComparables} from '../domain/comparables';
import type {AppraisalDTO, ComparableLeaseDTO} from '../api/types';

interface TmiStabilizedStatementInputs {
    expensesMode?: string;
    tmiRatePSF?: number | null;
    [field: string]: unknown;
}

interface TmiExpensesAppraisal extends AppraisalDTO {
    _id: string;
    comparableLeases?: string[] | null;
    stabilizedStatementInputs: TmiStabilizedStatementInputs;
}

interface ViewExpensesTmiProps {
    appraisal: TmiExpensesAppraisal;
    appraisalId?: string;
    navigate(path: string): void;
    saveAppraisal(appraisal: TmiExpensesAppraisal): void;
    search?: unknown;
}

function ViewExpensesTMI(props: ViewExpensesTmiProps)
{
    const [comparableLeases, setComparableLeases] = React.useState<readonly ComparableLeaseDTO[]>();
    const [sort, setSort] = React.useState<string | undefined>();
    const initialSortRef = React.useRef(sort);
    const initialComparableLeaseIdsRef = React.useRef(props.appraisal.comparableLeases ?? []);
    const comparableLeasesQuery = useComparableLeasesByIds(initialComparableLeaseIdsRef.current);

    React.useEffect(() =>
    {
        if (comparableLeasesQuery.data) {
            const leases = comparableLeasesQuery.data;
            setComparableLeases(sortComparables(leases, initialSortRef.current));
        }
    }, [comparableLeasesQuery.data]);

    function onSortChanged(newSort: string)
    {
        // Keep the class component's sort timing: its calculation used the
        // pre-update sort value from the current render.
        setSort(newSort);
        setComparableLeases((leases) => sortComparables(leases ?? [], sort));
    }

    function onComparablesChanged(newComps: readonly ComparableLeaseDTO[])
    {
        setComparableLeases(newComps);
    }

    function changeStabilizedInput(key: string, newValue: unknown)
    {
        const appraisal = props.appraisal;
        appraisal.stabilizedStatementInputs[key] = newValue;
        props.saveAppraisal(appraisal);
    }

    function changeExpenseMode()
    {
        props.appraisal.stabilizedStatementInputs.expensesMode = "income_statement";
        props.saveAppraisal(props.appraisal);
        props.navigate(`/appraisal/${props.appraisal._id}/expenses`);
    }

    return (
            <div className={"view-expenses-tmi"}>
                <AppraisalContentHeader appraisal={props.appraisal} title="Expenses"/>
                <Row>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                <Row>
                                    <Col xs={12}>
                                        <Button color={"primary"} onClick={() => changeExpenseMode()}>
                                            <i className={"fa fa-angle-double-left"} />
                                            &nbsp;
                                            <span>Set expenses based on line-items</span>
                                        </Button>
                                        <br/>
                                        <br/>
                                        <h2>Building TMI Rate</h2>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <ComparableLeaseList comparableLeases={comparableLeases}
                                                            statsTitle={"Statistics for Selected Comps"}
                                                            allowNew={false}
                                                             statsPosition={"below"}
                                                             sort={sort}
                                                            onSortChanged={(newSort: string) => onSortChanged(newSort)}
                                                            noCompMessage={"There are no comparables attached to this appraisal. Please go to the comparable sales database and select comparables from there."}
                                                            navigate={props.navigate} search={props.search}
                                                            appraisal={props.appraisal}
                                                            appraisalId={props.appraisalId}
                                                            appraisalComparables={props.appraisal.comparableLeases}
                                                            onChange={(comps) => onComparablesChanged(comps as readonly ComparableLeaseDTO[])}
                                        />
                                    </Col>
                                </Row>
                                <br/>
                                <br/>
                                <Row>
                                    <Col xs={12} sm={{size: 6, offset: 3}} md={{size: 4, offset: 4}}>
                                        <h2>Set TMI Rate for Building</h2>
                                        <br/>
                                        <table className="tmi-table">
                                            <tbody>
                                            <tr>
                                                <td>
                                                    TMI (psf):
                                                </td>
                                                <td>
                                                    <FieldDisplayEdit type="currency" placeholder="Amount (psf)"
                                                                      value={props.appraisal.stabilizedStatementInputs.tmiRatePSF}
                                                                      onChange={(newValue) => changeStabilizedInput('tmiRatePSF', newValue)}/>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
    );
}

export default ViewExpensesTMI;
