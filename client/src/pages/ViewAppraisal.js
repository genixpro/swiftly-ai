import React from 'react';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row, Col, Nav, NavItem, NavLink, Card, CardBody } from 'reactstrap';
import { Switch, Route } from 'react-router-dom';
import { NavLink as RRNavLink } from 'react-router-dom';

import UploadFiles from "./UploadFiles";
import ViewLeases from "./ViewLeases";
import ViewLease from "./ViewLease";
import ViewFinancialStatements from "./ViewFinancialStatements";
import ViewFinancialStatement from "./ViewFinancialStatement";

class ViewAppraisal extends React.Component
{
    state = {};


    componentDidMount()
    {

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
                                <NavLink to={`${this.props.match.url}/financial_statements`} activeClassName="active" tag={RRNavLink}>Financials</NavLink>
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
                                        <Route path={`${this.props.match.path}/financial_statements`} component={ViewFinancialStatements} />
                                        <Route path={`${this.props.match.path}/financial_statement/:financialStatementId`} component={ViewFinancialStatement} />
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
