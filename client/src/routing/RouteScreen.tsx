import type {ComponentType} from 'react';
import {useLocation, useNavigate, useParams, type NavigateFunction} from 'react-router';

interface RouteScreenProps {
    /**
     * Feature screens retain their individual hydrated-appraisal contracts.
     * They are intentionally opaque here until the workspace facade is fully
     * unified, rather than widening every screen to an untyped record.
     */
    component: ComponentType<never>;
    appraisalId?: string;
    [key: string]: unknown;
}

interface RouteScreenInjectedProps {
    appraisalId?: string;
    financialStatementId?: string;
    leaseId?: string;
    navigate: NavigateFunction;
    pathname: string;
    search: string;
}

export default function RouteScreen({component: Component, ...props}: RouteScreenProps) {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const RoutedComponent = Component as unknown as ComponentType<RouteScreenInjectedProps & Record<string, unknown>>;
    return <RoutedComponent
        {...props}
        appraisalId={params.id || props.appraisalId}
        leaseId={params.leaseId}
        financialStatementId={params.financialStatementId}
        pathname={location.pathname}
        search={location.search}
        navigate={navigate}
    />;
}
