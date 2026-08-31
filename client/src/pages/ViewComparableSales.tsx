import {Navigate, NavLink, Route, Routes} from 'react-router';
import {Card, CardBody, Col, Nav, NavItem, Row} from 'reactstrap';
import type {AppraisalFieldUpdate, EditableAppraisal} from '../app/AppraisalWorkspace';
import RouteScreen from '../routing/RouteScreen';
import AppraisalContentHeader from './components/AppraisalContentHeader';
import ViewAppraisalComparableSales from './ViewAppraisalComparableSales';
import ViewComparableSalesDatabase from './ViewComparableSalesDatabase';

export default function ViewComparableSales({appraisalId, appraisal, saveAppraisal, updateAppraisal}: {
    appraisalId: string;
    appraisal: EditableAppraisal;
    saveAppraisal(appraisal: EditableAppraisal): void;
    updateAppraisal(fields: AppraisalFieldUpdate): void;
}) {
    const routeProps = {appraisalId, appraisal, saveAppraisal, updateAppraisal};
    const basePath = `/appraisal/${appraisalId}/comparable_sales`;
    const tabClass = ({isActive}: {isActive: boolean}) => `nav-link${isActive ? ' active' : ''}`;
    return <>
        <AppraisalContentHeader appraisal={appraisal} title="Comparable Sales" />
        <Row><Col xs={12}><Nav tabs className="comparables-navigation">
            <NavItem><NavLink to={`${basePath}/database`} className={tabClass}>Comparable Sales Database</NavLink></NavItem>
            <NavItem><NavLink to={`${basePath}/appraisal_caprate`} className={tabClass}>Comparable Sales for Capitalization Approach</NavLink></NavItem>
            <NavItem><NavLink to={`${basePath}/appraisal_dca`} className={tabClass}>Comparable Sales for Direct Comparison Approach</NavLink></NavItem>
        </Nav></Col></Row>
        <Row><Col xs={12}><Card className="card-default"><CardBody><div id="view-tenants"><Routes>
            <Route index element={<Navigate to="database" replace />} />
            <Route path="appraisal_caprate" element={<RouteScreen component={ViewAppraisalComparableSales} {...routeProps} compsField="comparableSalesCapRate" />} />
            <Route path="appraisal_dca" element={<RouteScreen component={ViewAppraisalComparableSales} {...routeProps} compsField="comparableSalesDCA" />} />
            <Route path="database" element={<RouteScreen component={ViewComparableSalesDatabase} {...routeProps} />} />
        </Routes></div></CardBody></Card></Col></Row>
    </>;
}
