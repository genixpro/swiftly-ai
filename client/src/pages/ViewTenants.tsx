import {Navigate, NavLink, Route, Routes} from 'react-router';
import {Card, CardBody, Col, Nav, NavItem, Row} from 'reactstrap';
import type {EditableAppraisal} from '../app/AppraisalWorkspace';
import RouteScreen from '../routing/RouteScreen';
import AppraisalContentHeader from './components/AppraisalContentHeader';
import ViewMarketRents from './ViewMarketRents';
import ViewRecoveryStructures from './ViewRecoveryStructures';
import ViewTenantsLeasingCosts from './ViewTenantLeasingCosts';
import ViewTenantsRentRoll from './ViewTenantRentRoll';
import ViewVacancySchedule from './ViewVacancySchedule';

export default function ViewTenants({appraisalId, appraisal, saveAppraisal}: {
    appraisalId: string;
    appraisal: EditableAppraisal;
    saveAppraisal(appraisal: EditableAppraisal): void;
}) {
    const routeProps = {appraisalId, appraisal, saveAppraisal};
    const basePath = `/appraisal/${appraisalId}/tenants`;
    const tabClass = ({isActive}: {isActive: boolean}) => `nav-link${isActive ? ' active' : ''}`;
    return <>
        <AppraisalContentHeader appraisal={appraisal} title="Tenants" />
        <Row><Col xs={12}><Nav tabs>
            <NavItem><NavLink to={`${basePath}/rent_roll`} className={tabClass}>Rent Roll</NavLink></NavItem>
            <NavItem><NavLink to={`${basePath}/market_rents`} className={tabClass}>Market Rents</NavLink></NavItem>
            <NavItem><NavLink to={`${basePath}/recovery_structures`} className={tabClass}>Recovery Structures</NavLink></NavItem>
            <NavItem><NavLink to={`${basePath}/leasing_costs`} className={tabClass}>Leasing Costs</NavLink></NavItem>
        </Nav></Col></Row>
        <Row><Col xs={12}><Card className="card-default"><CardBody><div id="view-tenants"><Routes>
            <Route index element={<Navigate to="rent_roll" replace />} />
            <Route path="rent_roll" element={<RouteScreen component={ViewTenantsRentRoll} {...routeProps} />} />
            <Route path="leasing_costs" element={<RouteScreen component={ViewTenantsLeasingCosts} {...routeProps} />} />
            <Route path="vacancy_schedule" element={<RouteScreen component={ViewVacancySchedule} {...routeProps} />} />
            <Route path="market_rents" element={<RouteScreen component={ViewMarketRents} {...routeProps} />} />
            <Route path="recovery_structures" element={<RouteScreen component={ViewRecoveryStructures} {...routeProps} />} />
        </Routes></div></CardBody></Card></Col></Row>
    </>;
}
