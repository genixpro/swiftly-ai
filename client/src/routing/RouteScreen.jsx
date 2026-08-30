import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

export default function RouteScreen({ component: Component, ...props }) {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    return <Component
        {...props}
        appraisalId={params.id || params.appraisalId || props.appraisalId}
        leaseId={params.leaseId}
        financialStatementId={params.financialStatementId}
        pathname={location.pathname}
        search={location.search}
        navigate={navigate}
    />;
}
