import React from 'react';
import { translate, Trans } from 'react-i18next';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Nav, NavItem, NavLink, Card, CardBody } from 'reactstrap';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import { NavLink as RRNavLink } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import UploadFiles from "./UploadFiles";
import ViewLeases from "./ViewLeases";
import ViewLease from "./ViewLease";

class ViewAppraisal extends React.Component
{
    state = {};


    componentDidMount()
    {
        console.log(this.props.match);
    }


    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    <div>View Appraisal</div>
                </div>
                <div className={"view-appraisal"}>
                    <Row>
                        <Nav tabs>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/upload`} activeClassName="active" tag={RRNavLink}>Upload</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/leases`} activeClassName="active" tag={RRNavLink}>Leases</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/financials`} activeClassName="active" tag={RRNavLink}>Financials</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/comparables`} activeClassName="active" tag={RRNavLink}>Comparables</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/report`} activeClassName="active" tag={RRNavLink}>Report</NavLink>
                            </NavItem>
                        </Nav>
                    </Row>
                    <Row>
                        <Col xs={12} className={"content-column"}>
                            <Card className="card-default">
                                <CardBody>
                                    <Switch>
                                        <Route path={`${this.props.match.path}/upload`} component={UploadFiles} />
                                        <Route path={`${this.props.match.path}/leases`} component={ViewLeases} />
                                        <Route path={`${this.props.match.path}/lease/:leaseId`} component={ViewLease} />
                                    </Switch>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </ContentWrapper>
        );
    }
}

export default ViewAppraisal;
