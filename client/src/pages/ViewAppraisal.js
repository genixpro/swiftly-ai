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
import ViewStabilizedStatementValuation from "./ViewStabilizedStatementValuation";
import ViewComparableSales from "./ViewComparableSales";
import ViewComparableSale from "./ViewComparableSale";
import ViewDiscountedCashFlow from "./ViewDiscountedCashFlow";
import ViewTenants from "./ViewTenants";
import ViewUnitInformation from "./ViewUnitInformation";

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
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/comparable_sales`} activeClassName="active" tag={RRNavLink}>Comparable Sales</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/tenants`} activeClassName="active" tag={RRNavLink}>Tenants</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/stabilized_statement_valuation`} activeClassName="active" tag={RRNavLink}>Stabilized Statement Valuation</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/discounted_cash_flow`} activeClassName="active" tag={RRNavLink}>Discounted Cash Flow</NavLink>
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
                                        <Route path={`${this.props.match.path}/stabilized_statement_valuation`} component={ViewStabilizedStatementValuation} />
                                        <Route path={`${this.props.match.path}/comparable_sales`} component={ViewComparableSales} />
                                        <Route path={`${this.props.match.path}/comparable_sale/:comparableSaleId`} component={ViewComparableSale} />
                                        <Route path={`${this.props.match.path}/discounted_cash_flow`} component={ViewDiscountedCashFlow} />
                                        <Route path={`${this.props.match.path}/tenants`} component={ViewTenants} />
                                        <Route path={`${this.props.match.path}/units/:unitNum`} component={ViewUnitInformation} />
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
