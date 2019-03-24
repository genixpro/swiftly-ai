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
