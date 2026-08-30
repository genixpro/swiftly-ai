import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';

import Base from './components/Layout/Base';
import BasePage from './components/Layout/BasePage';
import RouteScreen from './routing/RouteScreen';
import StartAppraisal from './pages/StartAppraisal';
import ViewAppraisal from './pages/ViewAppraisal';
import ViewAllAppraisals from './pages/ViewAllAppraisals';
import ClientDropbox from './pages/ClientDropbox';

export default function AppRoutes() {
    const location = useLocation();
    const navigate = useNavigate();

    if (location.pathname === '/drop' || location.pathname.startsWith('/drop/')) {
        return <BasePage>
            <Routes>
                <Route path="/drop" element={<RouteScreen component={ClientDropbox} />} />
                <Route path="/drop/:id" element={<RouteScreen component={ClientDropbox} />} />
                <Route path="*" element={<Navigate to="/appraisals/" replace />} />
            </Routes>
        </BasePage>;
    }

    return <Base pathname={location.pathname} navigate={navigate}>
        <Routes>
            <Route path="/appraisal/new" element={<RouteScreen component={StartAppraisal} />} />
            <Route path="/appraisal/:id/*" element={<RouteScreen component={ViewAppraisal} />} />
            <Route path="/appraisals/*" element={<RouteScreen component={ViewAllAppraisals} />} />
            <Route path="*" element={<Navigate to="/appraisals/" replace />} />
        </Routes>
    </Base>;
}
