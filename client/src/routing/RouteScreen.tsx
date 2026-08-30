import type {ComponentType} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router';

interface RouteScreenProps {
    component: ComponentType<any>;
    appraisalId?: string;
    [key: string]: unknown;
}

export default function RouteScreen({component: Component, ...props}: RouteScreenProps) {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    return <Component
        {...props}
        appraisalId={params.id || props.appraisalId}
        leaseId={params.leaseId}
        financialStatementId={params.financialStatementId}
        pathname={location.pathname}
        search={location.search}
        navigate={navigate}
    />;
}
