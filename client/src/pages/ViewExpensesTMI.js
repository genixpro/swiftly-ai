import React from 'react';
import {Row, Col, Card, CardBody, Button} from 'reactstrap';
import axios from "axios/index";
import FieldDisplayEdit from './components/FieldDisplayEdit';
import AppraisalContentHeader from './components/AppraisalContentHeader';
import 'react-datetime/css/react-datetime.css'
import ComparableLeaseModel from "../models/ComparableLeaseModel";
import ComparableLeaseList from "./components/ComparableLeaseList";
import Promise from "bluebird";

class ViewExpensesTMI extends React.Component
{
    state = {
        capitalizationRate: 8.4,
        selectedUnit: null,
        newMarketRent: {},
        comparableSales: []
    };

    loadedComparables = {};

    componentDidMount()
    {
        this.loadComparables();
    }

    loadComparables()
    {
        Promise.map(this.props.appraisal.comparableLeases, (comparableLeaseId) =>
        {
            if (this.loadedComparables[comparableLeaseId])
            {
                return this.loadedComparables[comparableLeaseId];
            }
            else
            {
                // alert('loading');
                return axios.get(`/comparable_leases/` + comparableLeaseId).then((response) =>
                {
                    this.loadedComparables[comparableLeaseId] = ComparableLeaseModel.create(response.data.comparableLease);
                    return this.loadedComparables[comparableLeaseId];
                });
            }
        }).then((comparableLeases) =>
        {
            this.setState({comparableLeases: ComparableLeaseModel.sortComparables(comparableLeases, this.state.sort)})
        })
    }

    onSortChanged(newSort)
    {
        this.setState({sort: newSort, comparableLeases: ComparableLeaseModel.sortComparables(this.state.comparableLeases, this.state.sort)})
    }

    onComparablesChanged(newComps)
    {
        this.setState({comparableLeases: newComps})
    }

    changeStabilizedInput(key, newValue)
    {
        const appraisal = this.props.appraisal;
        appraisal.stabilizedStatementInputs[key] = newValue;
        this.props.saveAppraisal(appraisal);
    }

    changeExpenseMode()
    {
        this.props.appraisal.stabilizedStatementInputs.expensesMode = "income_statement";
        this.props.saveAppraisal(this.props.appraisal);
        this.props.history.push(`/appraisal/${this.props.appraisal._id}/expenses`);
    }

    render()
    {
        return (
            <div className={"view-expenses-tmi"}>
                <AppraisalContentHeader appraisal={this.props.appraisal} title="Expenses"/>
                <Row>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                <Row>
                                    <Col xs={12}>
                                        <Button color={"primary"} onClick={() => this.changeExpenseMode()}>
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
                                        <ComparableLeaseList comparableLeases={this.state.comparableLeases}
                                                            statsTitle={"Statistics for Selected Comps"}
                                                            allowNew={false}
                                                            sort={this.state.sort}
                                                            onSortChanged={(newSort) => this.onSortChanged(newSort)}
                                                            noCompMessage={"There are no comparables attached to this appraisal. Please go to the comparable sales database and select comparables from there."}
                                                            history={this.props.history}
                                                            appraisal={this.props.appraisal}
                                                            appraisalId={this.props.match.params._id}
                                                            appraisalComparables={this.props.appraisal.comparableLeases}
                                                            onChange={(comps) => this.onComparablesChanged(comps)}
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
                                                                      value={this.props.appraisal.stabilizedStatementInputs.tmiRatePSF}
                                                                      onChange={(newValue) => this.changeStabilizedInput('tmiRatePSF', newValue)}/>
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
}

export default ViewExpensesTMI;
