import React from 'react';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row, Col, Nav, NavItem, NavLink, Card, CardBody, CardHeader, Collapse } from 'reactstrap';
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
import ViewBuildingInformation from "./ViewBuildingInformation";
import ViewExpenses from "./ViewExpenses";
import ViewChecklist from "./ViewChecklist";

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
                        <Col xs={12} md={5} lg={5} xl={5}>
                            <Card outline color="primary" className="mb-3">
                                <CardHeader className="text-white bg-primary">Property Information</CardHeader>
                                <CardBody>
                                    <Nav tabs>
                                        <NavItem>
                                            <NavLink to={`${this.props.match.url}/general`} activeClassName="active" tag={RRNavLink}>General</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink to={`${this.props.match.url}/checklist`} activeClassName="active" tag={RRNavLink}>Checklist</NavLink>
                                        </NavItem>
                                        {/*<NavItem>*/}
                                            {/*<NavLink to={`${this.props.match.url}/leases`} activeClassName="active" tag={RRNavLink}>Leases</NavLink>*/}
                                        {/*</NavItem>*/}
                                        {/*<NavItem>*/}
                                            {/*<NavLink to={`${this.props.match.url}/financial_statements`} activeClassName="active" tag={RRNavLink}>Financials</NavLink>*/}
                                        {/*</NavItem>*/}
                                        <NavItem>
                                            <NavLink to={`${this.props.match.url}/tenants/rent_roll`} activeClassName="active" tag={RRNavLink}>Tenants</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink to={`${this.props.match.url}/expenses`} activeClassName="active" tag={RRNavLink}>Expenses</NavLink>
                                        </NavItem>
                                    </Nav>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xs={12} md={5} lg={5} xl={5}>
                            <Card outline color="primary" className="mb-3">
                                <CardHeader className="text-white bg-primary">Property Valuation</CardHeader>
                                <CardBody>
                                    <Nav tabs>
                                        <NavItem>
                                            <NavLink to={`${this.props.match.url}/comparable_sales`} activeClassName="active" tag={RRNavLink}>Comparable Sales</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink to={`${this.props.match.url}/stabilized_statement_valuation`} activeClassName="active" tag={RRNavLink}>Stabilized Statement Valuation</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink to={`${this.props.match.url}/discounted_cash_flow`} activeClassName="active" tag={RRNavLink}>Discounted Cash Flow</NavLink>
                                        </NavItem>
                                    </Nav>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xs={12} md={2} lg={2} xl={2}>
                            <Card outline color="primary" className="mb-3">
                                <CardHeader className="text-white bg-primary">Upload Data</CardHeader>
                                <CardBody>
                                    <Nav tabs>
                                        <NavItem>
                                            <NavLink to={`${this.props.match.url}/upload`} activeClassName="active" tag={RRNavLink}>Upload</NavLink>
                                        </NavItem>
                                    </Nav>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
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
                        <Route path={`${this.props.match.path}/general`} component={ViewBuildingInformation} />
                        <Route path={`${this.props.match.path}/expenses`} component={ViewExpenses} />
                        <Route path={`${this.props.match.path}/checklist`} component={ViewChecklist} />
                    </Switch>
                </div>
            </ContentWrapper>
        );
    }
}

export default ViewAppraisal;
