import React from 'react';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Link, Navigate, Route, Routes } from 'react-router';
import RouteScreen from '../routing/RouteScreen';

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
import {appraisalsApi} from '@api/resources';
import AppraisalModel from "../models/AppraisalModel";
import { Sidebar } from "../components/Layout/Sidebar";

class ViewAppraisal extends React.Component
{
    state = {loading: true, error: null, saving: false, saveError: null, savedAt: null};


    componentDidMount()
    {

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
        appraisalsApi.get(this.props.appraisalId).then((data) =>
        {
            try
            {
                const appraisal = AppraisalModel.create(data);
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
            const notFound = error.status === 404;
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
            appraisalsApi.update(this.props.appraisalId, updates).then((data) =>
            {
                if (requestId !== this.saveRequestId) return;
                newAppraisal.clearUpdates();
                this.setState({
                    appraisal: AppraisalModel.create(data),
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
            appraisalId: this.props.appraisalId,
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
                    <Routes>
                        <Route index element={<Navigate to="upload" replace />} />
                        <Route path="upload/*" element={<RouteScreen component={UploadFiles} {...routeProps} />} />
                        <Route path="leases/*" element={<RouteScreen component={ViewLeases} {...routeProps} />} />
                        <Route path="lease/:leaseId/*" element={<RouteScreen component={ViewLease} {...routeProps} />} />
                        <Route path="financial_statements/*" element={<RouteScreen component={ViewFinancialStatements} {...routeProps} />} />
                        <Route path="financial_statement/:financialStatementId/*" element={<RouteScreen component={ViewFinancialStatement} {...routeProps} />} />
                        <Route path="stabilized_statement_valuation/*" element={<RouteScreen component={ViewStabilizedStatement} {...routeProps} />} />
                        <Route path="comparable_sales/*" element={<RouteScreen component={ViewComparableSales} {...routeProps} />} />
                        <Route path="discounted_cash_flow/*" element={<RouteScreen component={ViewDiscountedCashFlow} {...routeProps} />} />
                        <Route path="tenants/*" element={<RouteScreen component={ViewTenants} {...routeProps} />} />
                        <Route path="general/*" element={<RouteScreen component={ViewBuildingInformation} {...routeProps} />} />
                        <Route path="expenses/*" element={<RouteScreen component={ViewExpenses} {...routeProps} />} />
                        <Route path="comparable_leases/*" element={<RouteScreen component={ViewComparableLeases} {...routeProps} />} />
                        <Route path="direct_comparison_valuation/*" element={<RouteScreen component={ViewDirectComparisonValuation} {...routeProps} />} />
                        <Route path="capitalization_valuation/*" element={<RouteScreen component={ViewCapitalizationValuation} {...routeProps} />} />
                        <Route path="additional_income/*" element={<RouteScreen component={ViewAdditionalIncome} {...routeProps} />} />
                        <Route path="amortization/*" element={<RouteScreen component={ViewAmortization} {...routeProps} />} />
                        <Route path="expenses_tmi/*" element={<RouteScreen component={ViewExpensesTMI} {...routeProps} />} />
                    </Routes>
                </div>
            </ContentWrapper>
        );
    }
}

export default ViewAppraisal;
