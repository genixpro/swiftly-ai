import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table, Button, NavItem, Nav, Navbar, NavLink } from 'reactstrap';
import { NavLink as RRNavLink } from 'react-router-dom';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';
import Moment from 'react-moment';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css'
import { Switch, Route } from 'react-router-dom';
import ComparableLeaseModel from "../models/ComparableLeaseModel";
import ComparableLeaseList from "./components/ComparableLeaseList";
import Promise from "bluebird";

class ViewMarketRents extends React.Component
{
    state = {
        capitalizationRate: 8.4,
        selectedUnit: null,
        newMarketRent: {},
        comparableLeases: []
    };

    changeMarketRentField(marketRent, field, newValue)
    {
        if (field === "name")
        {
            // Go through the appraisal units and update any which are attached to this rent name
            this.props.appraisal.units.forEach((unit) =>
            {
                if (unit.marketRent === marketRent.name)
                {
                    unit.marketRent = newValue;
                }
            });
        }

        marketRent[field] = newValue;

        this.props.saveDocument(this.props.appraisal);
    }

    newMarketRent(field, newValue)
    {
        if (!newValue)
        {
            return;
        }

        const marketRent = {
            "name": "Market Rent Type",
            "amountPSF": 0
        };
        marketRent[field] = newValue;

        this.props.appraisal.marketRents.push(marketRent);

        this.props.saveDocument(this.props.appraisal);
    }

    componentDidMount()
    {
        this.loadLeases();
    }

    loadLeases()
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
                    this.loadedComparables[comparableLeaseId] = new ComparableLeaseModel(response.data.comparableLease);
                    return this.loadedComparables[comparableLeaseId];
                });
            }
        }).then((comparableLeases) =>
        {
            this.setState({comparableLeases: ComparableLeaseModel.sortComparables(comparableLeases, this.state.sort)})
        })
    }

    render() {
        return (
            (this.props.appraisal) ?
                <div id={"view-market-rents"} className={"view-market-rents"}>
                    <h2>Market Rents</h2>
                    <Row>
                        <Col xs={12}>
                            <ComparableLeaseList comparableLeases={this.state.comparableLeases}
                                                 statsTitle={"Statistics for Selected Lease Comps"}
                                                 allowNew={false}
                                                 sort={this.state.sort}
                                                 onSortChanged={(newSort) => this.onSortChanged(newSort)}
                                                 noCompMessage={"There are no comparables attached to this appraisal. Please go to the comparable leases database and select comparables from there."}
                                                 history={this.props.history}
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

                            <h2>Set Market Rents</h2>

                            <table className="market-rent-table">
                                <tbody>
                                {
                                    this.props.appraisal.marketRents.map((marketRent) => {
                                        return <tr>
                                            <td>
                                                <FieldDisplayEdit type="text" placeholder="Name" value={marketRent.name} onChange={(newValue) => this.changeMarketRentField(marketRent, 'name', newValue)}/>
                                            </td>
                                            <td>
                                                <FieldDisplayEdit type="currency" placeholder="Amount (psf)" value={marketRent.amountPSF} onChange={(newValue) => this.changeMarketRentField(marketRent, 'amountPSF', newValue)}/>
                                            </td>
                                        </tr>
                                    })
                                }
                                {
                                    <tr>
                                        <td>
                                            <FieldDisplayEdit type="text" placeholder="Name" onChange={(newValue) => this.newMarketRent('name', newValue)}/>
                                        </td>
                                        <td>
                                            <FieldDisplayEdit type="currency" placeholder="Amount (psf)" onChange={(newValue) => this.newMarketRent('amountPSF', newValue)}/>
                                        </td>
                                    </tr>
                                }
                                </tbody>
                            </table>
                        </Col>
                    </Row>
                </div>
                : null
        );
    }
}

export default ViewMarketRents;
