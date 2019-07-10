import React from 'react';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Switch, Route } from 'react-router-dom';
import {withProps} from 'recompose';

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
import AnnotateFile from "./AnnotateFile";
import ViewExpensesTMI from "./ViewExpensesTMI";
import Logout from "./Logout";
import axios from "axios/index";
import AppraisalModel from "../models/AppraisalModel";
import Sidebar from "../components/Layout/Sidebar";
import AnnotationEditor from "./components/AnnotationEditor";

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
                const appraisal = AppraisalModel.create(response.data.appraisal);
                this.setState({appraisal: appraisal});

                setTimeout(() =>
                {
                    Sidebar.getGlobalSidebar().changeAppraisalType(appraisal.appraisalType);
                });
            }
            catch(err)
            {
                console.log(err);
            }
        });
    }

    saveAppraisal(newAppraisal)
    {
        this.setState({appraisal: newAppraisal});

        const updates = this.state.appraisal.getUpdates();
        if (Object.keys(updates).length > 0)
        {
            axios.post(`/appraisal/${this.props.match.params.id}`, this.state.appraisal.getUpdates()).then((response) =>
            {
                this.state.appraisal.clearUpdates();

                newAppraisal.applyDiff(response.data);

                this.setState({appraisal: newAppraisal});
            });
        }
    }

    render() {
        const routeProps = {
            appraisal: this.state.appraisal,
            saveAppraisal: this.saveAppraisal.bind(this),
            reloadAppraisal: this.reloadAppraisal.bind(this)
        };

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

                        <Route path={`${this.props.match.path}/stabilized_statement_valuation`} render={(props) => withProps({...routeProps, ...props})(ViewStabilizedStatement)()} />
                        <Route path={`${this.props.match.path}/comparable_sales`} render={(props) => withProps({...routeProps, ...props})(ViewComparableSales)()} />

                        <Route path={`${this.props.match.path}/files/:fileId/annotate`} render={(props) => withProps({...routeProps, ...props})(AnnotateFile)()} />

                        <Route path={`${this.props.match.path}/discounted_cash_flow`} render={(props) => withProps({...routeProps, ...props})(ViewDiscountedCashFlow)()} />
                        <Route path={`${this.props.match.path}/tenants`} render={(props) => withProps({...routeProps, ...props})(ViewTenants)()} />
                        <Route path={`${this.props.match.path}/general`} render={(props) => withProps({...routeProps, ...props})(ViewBuildingInformation)()}/>} />
                        <Route path={`${this.props.match.path}/expenses`} render={(props) => withProps({...routeProps, ...props})(ViewExpenses)()} />
                        <Route path={`${this.props.match.path}/comparable_leases`} render={(props) => withProps({...routeProps, ...props})(ViewComparableLeases)()} />
                        <Route path={`${this.props.match.path}/direct_comparison_valuation`} render={(props) => withProps({...routeProps, ...props})(ViewDirectComparisonValuation)()} />
                        <Route path={`${this.props.match.path}/capitalization_valuation`} render={(props) => withProps({...routeProps, ...props})(ViewCapitalizationValuation)()} />
                        <Route path={`${this.props.match.path}/additional_income`} render={(props) => withProps({...routeProps, ...props})(ViewAdditionalIncome)()} />
                        <Route path={`${this.props.match.path}/amortization`} render={(props) => withProps({...routeProps, ...props})(ViewAmortization)()} />
                        <Route path={`${this.props.match.path}/expenses_tmi`} render={(props) => withProps({...routeProps, ...props})(ViewExpensesTMI)()} />
                        <Route path={`${this.props.match.path}/logout`} render={(props) => withProps({...routeProps, ...props})(Logout)()} />
                    </Switch>
                </div>
            </ContentWrapper> : null
        );
    }
}

export default ViewAppraisal;
