import {Navigate, NavLink, Route, Routes} from 'react-router';
import {Card, CardBody, Col, Nav, NavItem, Row} from 'reactstrap';
import type {EditableAppraisal} from '../app/AppraisalWorkspace';
import RouteScreen from '../routing/RouteScreen';
import AppraisalContentHeader from './components/AppraisalContentHeader';
import ViewAppraisalComparableLeases from './ViewAppraisalComparableLeases';
import ViewComparableLeasesDatabase from './ViewComparableLeasesDatabase';

export default function ViewComparableLeases({appraisalId, appraisal, saveAppraisal}: {
    appraisalId: string;
    appraisal: EditableAppraisal;
    saveAppraisal(appraisal: EditableAppraisal): void;
}) {
    const routeProps = {appraisalId, appraisal, saveAppraisal};
    const basePath = `/appraisal/${appraisalId}/comparable_leases`;
    const tabClass = ({isActive}: {isActive: boolean}) => `nav-link${isActive ? ' active' : ''}`;
    return <>
        <AppraisalContentHeader appraisal={appraisal} title="Comparable Leases" />
        <Row><Col xs={12}><Nav tabs className="comparables-navigation">
            <NavItem><NavLink to={`${basePath}/database`} className={tabClass}>Comparable Leases Database</NavLink></NavItem>
            <NavItem><NavLink to={`${basePath}/appraisal`} className={tabClass}>Appraisal Comparable Leases</NavLink></NavItem>
        </Nav></Col></Row>
        <Row><Col xs={12}><Card className="card-default"><CardBody><div id="view-tenants"><Routes>
            <Route index element={<Navigate to="database" replace />} />
            <Route path="appraisal" element={<RouteScreen component={ViewAppraisalComparableLeases} {...routeProps} />} />
            <Route path="database" element={<RouteScreen component={ViewComparableLeasesDatabase} {...routeProps} />} />
        </Routes></div></CardBody></Card></Col></Row>
    </>;
}
