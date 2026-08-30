import {useEffect} from 'react';
import {Link, Navigate, Route, Routes} from 'react-router';
import ContentWrapper from '../components/Layout/ContentWrapper';
import RouteScreen from '../routing/RouteScreen';
import UploadFiles from './UploadFiles';
import ViewLeases from './ViewLeases';
import ViewLease from './ViewLease';
import ViewFinancialStatements from './ViewFinancialStatements';
import ViewFinancialStatement from './ViewFinancialStatement';
import ViewStabilizedStatement from './ViewStabilizedStatement';
import ViewComparableSales from './ViewComparableSales';
import ViewDiscountedCashFlow from './ViewDiscountedCashFlow';
import ViewDirectComparisonValuation from './ViewDirectComparisonValuation';
import ViewTenants from './ViewTenants';
import ViewBuildingInformation from './ViewBuildingInformation';
import ViewExpenses from './ViewExpenses';
import ViewComparableLeases from './ViewComparableLeases';
import ViewCapitalizationValuation from './ViewCapitalizationValuation';
import ViewAdditionalIncome from './ViewAdditionalIncomes';
import ViewAmortization from './ViewAmortization';
import ViewExpensesTMI from './ViewExpensesTMI';
import {useAppraisalNavigation} from '../app/AppraisalNavigation';
import {
    AppraisalWorkspaceProvider,
    type EditableAppraisal,
    useAppraisalWorkspace,
} from '../app/AppraisalWorkspace';

interface ViewAppraisalProps {
    appraisalId: string;
}

function AppraisalWorkspaceRoutes({appraisalId}: ViewAppraisalProps) {
    const workspace = useAppraisalWorkspace();
    const appraisal = workspace.appraisal;
    const navigation = useAppraisalNavigation();

    useEffect(() => {
        if (!appraisal) navigation.clearAppraisal();
        else {
            const timer = window.setTimeout(() => navigation.changeAppraisalType(appraisal.appraisalType));
            return () => window.clearTimeout(timer);
        }
    }, [appraisal, navigation]);

    if (workspace.loading) {
        document.title = 'Loading Appraisal – Swiftly';
        return <ContentWrapper>
            <div className="content-heading"><h1 className="page-title">Loading appraisal…</h1></div>
            <div className="card card-default"><div className="card-body text-muted" role="status">Preparing the appraisal workspace.</div></div>
        </ContentWrapper>;
    }

    if (workspace.loadError || !appraisal) {
        document.title = 'Appraisal Unavailable – Swiftly';
        return <ContentWrapper>
            <div className="content-heading"><h1 className="page-title">Appraisal unavailable</h1></div>
            <div className="alert alert-warning" role="alert">
                <p className="mb-3">{workspace.loadError}</p>
                <Link className="btn btn-primary" to="/appraisals/">Return to appraisals</Link>
            </div>
        </ContentWrapper>;
    }

    const routeProps = {
        appraisalId,
        appraisal,
        saveAppraisal: (next: EditableAppraisal) => void workspace.save(next),
        reloadAppraisal: () => void workspace.reload(),
    };

    return <ContentWrapper>
        <div className="view-appraisal">
            <div className="save-status" role="status" aria-live="polite">
                {workspace.saveState === 'saving' ? 'Saving changes…' : workspace.savedAt ? 'Changes saved.' : ''}
            </div>
            {workspace.saveError ? <div className="alert alert-danger save-error" role="alert">
                {workspace.saveError}{' '}
                <button type="button" className="btn btn-light" onClick={() => void workspace.retry()}>Try again</button>
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
    </ContentWrapper>;
}

export default function ViewAppraisal({appraisalId}: ViewAppraisalProps) {
    return <AppraisalWorkspaceProvider appraisalId={appraisalId}>
        <AppraisalWorkspaceRoutes appraisalId={appraisalId} />
    </AppraisalWorkspaceProvider>;
}
