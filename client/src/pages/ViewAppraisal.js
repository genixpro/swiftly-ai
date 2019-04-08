import React from 'react';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row, Col, Nav, NavItem, NavLink, Card, CardBody, CardHeader, Collapse } from 'reactstrap';
import { Switch, Route } from 'react-router-dom';
import { NavLink as RRNavLink } from 'react-router-dom';
import {withProps} from 'recompose';

import UploadFiles from "./UploadFiles";
import ViewLeases from "./ViewLeases";
import ViewLease from "./ViewLease";
import ViewFinancialStatements from "./ViewFinancialStatements";
import ViewFinancialStatement from "./ViewFinancialStatement";
import ViewStabilizedStatementValuation from "./ViewStabilizedStatementValuation";
import ViewComparableSales from "./ViewComparableSales";
import ViewComparableSale from "./ViewComparableSale";
import ViewDiscountedCashFlow from "./ViewDiscountedCashFlow";
import ViewDirectComparisonValuation from "./ViewDirectComparisonValuation";
import ViewTenants from "./ViewTenants";
import ViewBuildingInformation from "./ViewBuildingInformation";
import ViewExpenses from "./ViewExpenses";
import ViewComparableLeases from "./ViewComparableLeases";
import axios from "axios/index";
import AppraisalModel from "../models/AppraisalModel";

class ViewAppraisal extends React.Component
{
    state = {};


    componentDidMount()
    {
        this.reloadAppraisal();
    }

    reloadAppraisal()
    {
        axios.get(`/appraisal/${this.props.match.params.id}`).then((response) =>
        {
            try
            {
                this.setState({appraisal: new AppraisalModel(response.data.appraisal)})
            }
            catch(err)
            {
                console.log(err);
            }
        });
    }

    saveDocument(newAppraisal, updateStateAfterSave)
    {
        this.setState({appraisal: this.state.appraisal});
        axios.post(`/appraisal/${this.props.match.params.id}`, newAppraisal).then((response) =>
        {
            if (updateStateAfterSave)
            {
                this.setState({appraisal: new AppraisalModel(response.data.appraisal)})
            }
        });
    }

    render() {
        const routeProps = {
            appraisal: this.state.appraisal,
            saveDocument: this.saveDocument.bind(this),
            reloadAppraisal: this.reloadAppraisal.bind(this)
        };

        console.log(this.state.appraisal);

        return (
            this.state.appraisal ?
            <ContentWrapper>
                <div className={"view-appraisal"}>
                    <Switch>
                        <Route path={`${this.props.match.path}/upload`} render={(props) => withProps({...routeProps, ...props})(UploadFiles)()} />
                        <Route path={`${this.props.match.path}/leases`} render={(props) => withProps({...routeProps, ...props})(ViewLeases)()} />
                        <Route path={`${this.props.match.path}/lease/:leaseId`} render={(props) => withProps({...routeProps, ...props})(ViewLease)()} />
                        <Route path={`${this.props.match.path}/financial_statements`} render={(props) => withProps({...routeProps, ...props})(ViewFinancialStatements)()} />
                        <Route path={`${this.props.match.path}/financial_statement/:financialStatementId`} render={(props) => withProps({...routeProps, ...props})(ViewFinancialStatement)()} />
                        <Route path={`${this.props.match.path}/stabilized_statement_valuation`} render={(props) => withProps({...routeProps, ...props})(ViewStabilizedStatementValuation)()} />
                        <Route path={`${this.props.match.path}/comparable_sales`} render={(props) => withProps({...routeProps, ...props})(ViewComparableSales)()} />
                        <Route path={`${this.props.match.path}/comparable_sale/:comparableSaleId`} render={(props) => withProps({...routeProps, ...props})(ViewComparableSale)()} />
                        <Route path={`${this.props.match.path}/discounted_cash_flow`} render={(props) => withProps({...routeProps, ...props})(ViewDiscountedCashFlow)()} />
                        <Route path={`${this.props.match.path}/tenants`} render={(props) => withProps({...routeProps, ...props})(ViewTenants)()} />
                        <Route path={`${this.props.match.path}/general`} render={(props) => withProps({...routeProps, ...props})(ViewBuildingInformation)()}/>} />
                        <Route path={`${this.props.match.path}/expenses`} render={(props) => withProps({...routeProps, ...props})(ViewExpenses)()} />
                        <Route path={`${this.props.match.path}/comparable_leases`} render={(props) => withProps({...routeProps, ...props})(ViewComparableLeases)()} />
                        <Route path={`${this.props.match.path}/direct_comparison_valuation`} render={(props) => withProps({...routeProps, ...props})(ViewDirectComparisonValuation)()} />
                    </Switch>
                </div>
            </ContentWrapper> : null
        );
    }
}

export default ViewAppraisal;
