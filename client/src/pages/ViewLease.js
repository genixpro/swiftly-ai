import React from 'react';
import { translate, Trans } from 'react-i18next';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardBody, CardHeader, CardText, CardTitle, FormGroup, Input,  Nav, NavItem, NavLink } from 'reactstrap';
import axios from 'axios';
import ViewLeaseExtractions from "./ViewLeaseExtractions";
import ViewLeaseSummary from "./ViewLeaseSummary";
import ViewLeaseReport from "./ViewLeaseReport";
import { NavLink as RRNavLink } from 'react-router-dom';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';


class ViewLease extends React.Component
{
    state = {
        width: 0,
        height: 0
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.match.params.id}/leases/${this.props.match.params.leaseId}`).then((response) =>
        {
            this.setState({lease: response.data.lease})
        });
    }

    componentDidUpdate()
    {

    }

    saveLeaseData(newLease)
    {
        axios.post(`/appraisal/${this.props.match.params.id}/leases/${this.props.match.params.leaseId}`, newLease).then((response) =>
        {
            this.setState({lease: newLease})
        });
    }

    render() {
        return (
            <div id={"view-lease-page"}>
                <Row>
                    <Col xs={12}>
                        <Nav tabs>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/summary`} activeClassName="active" tag={RRNavLink}>Summarized Data</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/raw`} activeClassName="active" tag={RRNavLink}>Raw Lease</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/report`} activeClassName="active" tag={RRNavLink}>Report</NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                </Row>
                {
                    (this.state.lease && <Row>
                        <Col xs={12} className={"content-column"}>
                            <Card className="card-default">
                                <CardBody>
                                    <Switch>
                                        <Route path={`${this.props.match.url}/raw`} render={() => <ViewLeaseExtractions lease={this.state.lease} saveLeaseData={this.saveLeaseData.bind(this)}/>} lease={this.state.lease} />
                                        <Route path={`${this.props.match.url}/summary`} render={() => <ViewLeaseSummary lease={this.state.lease} saveLeaseData={this.saveLeaseData.bind(this)}/>} lease={this.state.lease} />
                                        <Route path={`${this.props.match.url}/report`} render={() => <ViewLeaseReport lease={this.state.lease} saveLeaseData={this.saveLeaseData.bind(this)}/>} lease={this.state.lease} />
                                    </Switch>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>)
                }
            </div>
        );
    }
}

export default ViewLease;
