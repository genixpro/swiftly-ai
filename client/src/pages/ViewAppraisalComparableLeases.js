import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import axios from 'axios';
import ComparableSaleList from "./components/ComparableSaleList";
import Promise from 'bluebird';
import _ from 'underscore';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import ComparableSaleSearch from './components/ComparableSaleSearch';
import ComparableLeaseList from "./components/ComparableLeaseList";


class ViewAppraisalComparableLeases extends React.Component {
    state = {
        comparableLeases: []
    };

    createNewComparable(newComparable)
    {
        const comparables = this.state.comparableLeases;
        comparables.splice(0, 0, newComparable);
        this.setState({comparableLeases: comparables});
    }

    onComparablesChanged(comps)
    {
        this.setState({comparableLeases: comps});
    }

    addComparableToAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        appraisal.comparableLeases.push(comp._id['$oid']);
        appraisal.comparableLeases = _.clone(appraisal.comparableLeases);
        this.props.saveDocument(appraisal);
    }


    removeComparableFromAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        for (let i = 0; i < appraisal.comparableLeases.length; i += 1)
        {
            if (appraisal.comparableLeases[i] === comp._id['$oid'])
            {
                appraisal.comparableLeases.splice(i, 1);
                break;
            }
        }
        appraisal.comparableLeases = _.clone(appraisal.comparableLeases);
        this.props.saveDocument(appraisal);
    }


    render()
    {
        if (!this.props.appraisal)
        {
            return null;
        }

        return [
            <div>
                <Row>
                    <Col xs={11}>
                        <h3>View Comparable Leases</h3>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <ComparableLeaseList comparableLeaseIds={this.props.appraisal.comparableLeases}
                                            allowNew={false}
                                            history={this.props.history}
                                            appraisalId={this.props.match.params._id}
                                            onRemoveComparableClicked={(comp) => this.removeComparableFromAppraisal(comp)}
                                            onChange={(comps) => this.onComparablesChanged(comps)}
                        />
                    </Col>
                </Row>
            </div>
        ];
    }
}

export default ViewAppraisalComparableLeases;
