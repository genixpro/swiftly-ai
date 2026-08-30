import React from 'react';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Link, Switch, Route } from 'react-router-dom';

import UploadFiles from "./UploadFiles";
import ViewLeases from "./ViewLeases";
import ViewLease from "./ViewLease";
import ViewFinancialStatements from "./ViewFinancialStatements";
import ViewFinancialStatement from "./ViewFinancialStatement";
import ViewStabilizedStatement from "./ViewStabilizedStatement";
import ViewComparableSales from "./ViewComparableSales";
import ViewDiscountedCashFlow from "./ViewDiscountedCashFlow";
import ViewDirectComparisonValuation from "./ViewDirectComparisonValuation";
import ViewTenants from "./ViewTenants";
import ViewBuildingInformation from "./ViewBuildingInformation";
import ViewExpenses from "./ViewExpenses";
import ViewComparableLeases from "./ViewComparableLeases";
import ViewCapitalizationValuation from "./ViewCapitalizationValuation";
import ViewAdditionalIncome from "./ViewAdditionalIncomes";
import ViewAmortization from "./ViewAmortization";
import ViewExpensesTMI from "./ViewExpensesTMI";
import Logout from "./Logout";
import axios from "axios";
import AppraisalModel from "../models/AppraisalModel";
import { Sidebar } from "../components/Layout/Sidebar";
import mixpanel from "mixpanel-browser";

class ViewAppraisal extends React.Component
{
    state = {loading: true, error: null, saving: false, saveError: null, savedAt: null};


    componentDidMount()
    {
        mixpanel.track("view-appraisal");

        this.reloadAppraisal();
    }

    reloadAppraisal()
    {
        this.setState({loading: !this.state.appraisal, error: null});
        const currentSidebar = Sidebar.getGlobalSidebar();
        if (!this.state.appraisal && currentSidebar)
        {
            currentSidebar.clearAppraisal();
        }
        axios.get(`/appraisal/${this.props.match.params.id}`).then((response) =>
        {
            try
            {
                const appraisal = AppraisalModel.create(response.data.appraisal);
                this.setState({appraisal: appraisal, loading: false, error: null});

                setTimeout(() =>
                {
                    const sidebar = Sidebar.getGlobalSidebar();
                    if (sidebar)
                    {
                        sidebar.changeAppraisalType(appraisal.appraisalType);
                    }
                });
            }
            catch(err)
            {
                this.setState({loading: false, error: "This appraisal could not be opened because its saved data is invalid."});
            }
        }).catch((error) => {
            const sidebar = Sidebar.getGlobalSidebar();
            if (sidebar)
            {
                sidebar.clearAppraisal();
            }
            const notFound = error.response && error.response.status === 404;
            this.setState({
                loading: false,
                error: notFound
                    ? "We couldn't find that appraisal. It may have been removed."
                    : "We couldn't load this appraisal. Check that the local API is running and try again."
            });
        });
    }

    saveAppraisal(newAppraisal)
    {
        this.setState({appraisal: newAppraisal, saving: true, saveError: null});

        const updates = newAppraisal.getUpdates();
        if (Object.keys(updates).length > 0)
        {
            const requestId = (this.saveRequestId || 0) + 1;
            this.saveRequestId = requestId;
            axios.post(`/appraisal/${this.props.match.params.id}`, updates).then((response) =>
            {
                if (requestId !== this.saveRequestId) return;
                newAppraisal.clearUpdates();
                this.setState({
                    appraisal: AppraisalModel.create(response.data.appraisal),
                    saving: false,
                    saveError: null,
                    savedAt: new Date()
                });
            }).catch(() => {
                if (requestId !== this.saveRequestId) return;
                this.setState({saving: false, saveError: "Your changes could not be saved. They are still available on this page."});
            });
        }
        else
        {
            this.setState({saving: false});
        }
    }

    render() {
        const routeProps = {
            appraisal: this.state.appraisal,
            saveAppraisal: this.saveAppraisal.bind(this),
            reloadAppraisal: this.reloadAppraisal.bind(this)
        };

        if (this.state.loading)
        {
            document.title = "Loading Appraisal – Swiftly";
            return <ContentWrapper>
                <div className="content-heading"><h1 className="page-title">Loading appraisal…</h1></div>
                <div className="card card-default"><div className="card-body text-muted" role="status">Preparing the appraisal workspace.</div></div>
            </ContentWrapper>;
        }

        if (this.state.error)
        {
            document.title = "Appraisal Unavailable – Swiftly";
            return <ContentWrapper>
                <div className="content-heading"><h1 className="page-title">Appraisal unavailable</h1></div>
                <div className="alert alert-warning" role="alert">
                    <p className="mb-3">{this.state.error}</p>
                    <Link className="btn btn-primary" to="/appraisals/">Return to appraisals</Link>
                </div>
            </ContentWrapper>;
        }

        return (
            <ContentWrapper>
                <div className={"view-appraisal"}>
                    <div className="save-status" role="status" aria-live="polite">
                        {this.state.saving ? "Saving changes…" : this.state.savedAt ? "Changes saved." : ""}
                    </div>
                    {this.state.saveError ? <div className="alert alert-danger save-error" role="alert">
                        {this.state.saveError}{' '}
                        <button type="button" className="btn btn-light" onClick={() => this.saveAppraisal(this.state.appraisal)}>Try again</button>
                    </div> : null}
                    <Switch>
                        <Route path={`${this.props.match.path}/upload`} render={(props) => <UploadFiles {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/leases`} render={(props) => <ViewLeases {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/lease/:leaseId`} render={(props) => <ViewLease {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/financial_statements`} render={(props) => <ViewFinancialStatements {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/financial_statement/:financialStatementId`} render={(props) => <ViewFinancialStatement {...routeProps} {...props} />} />

                        <Route path={`${this.props.match.path}/stabilized_statement_valuation`} render={(props) => <ViewStabilizedStatement {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/comparable_sales`} render={(props) => <ViewComparableSales {...routeProps} {...props} />} />

                        <Route path={`${this.props.match.path}/discounted_cash_flow`} render={(props) => <ViewDiscountedCashFlow {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/tenants`} render={(props) => <ViewTenants {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/general`} render={(props) => <ViewBuildingInformation {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/expenses`} render={(props) => <ViewExpenses {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/comparable_leases`} render={(props) => <ViewComparableLeases {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/direct_comparison_valuation`} render={(props) => <ViewDirectComparisonValuation {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/capitalization_valuation`} render={(props) => <ViewCapitalizationValuation {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/additional_income`} render={(props) => <ViewAdditionalIncome {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/amortization`} render={(props) => <ViewAmortization {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/expenses_tmi`} render={(props) => <ViewExpensesTMI {...routeProps} {...props} />} />
                        <Route path={`${this.props.match.path}/logout`} render={(props) => <Logout {...routeProps} {...props} />} />
                    </Switch>
                </div>
            </ContentWrapper>
        );
    }
}

export default ViewAppraisal;
