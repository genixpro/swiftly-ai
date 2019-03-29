import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import axios from 'axios';
import ComparableSaleList from "./components/ComparableSaleList";
import Promise from 'bluebird';
import _ from 'underscore';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import ComparableSearch from './components/ComparableSearch';


class ViewAppraisalComparables extends React.Component {
    state = {
        comparableSales: []
    };

    componentDidMount()
    {
        axios.get(`/comparable_sales`).then((response) => {
            // console.log(response.data.comparableSales);
            this.setState({comparableSales: response.data.comparableSales})
        });
    }


    createNewComparable(newComparable)
    {
        const comparables = this.state.comparableSales;
        comparables.splice(0, 0, newComparable);
        this.setState({comparableSales: comparables});
    }

    onComparablesChanged(comps)
    {
        this.setState({comparableSales: comps});
    }

    addComparableToAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        appraisal.comparables.push(comp._id['$oid']);
        appraisal.comparables = _.clone(appraisal.comparables);
        this.props.saveDocument(appraisal);
    }


    removeComparableFromAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        for (let i = 0; i < appraisal.comparables.length; i += 1)
        {
            if (appraisal.comparables[i] === comp._id['$oid'])
            {
                appraisal.comparables.splice(i, 1);
                break;
            }
        }
        appraisal.comparables = _.clone(appraisal.comparables);
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
                            <h3>View Comparable Sales</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <ComparableSaleList comparableSaleIds={this.props.appraisal.comparables}
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

export default ViewAppraisalComparables;
