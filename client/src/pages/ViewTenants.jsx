import React from 'react';
import {Row, Col, Card, CardBody, Nav, NavItem} from 'reactstrap';
import ViewTenantsRentRoll from "./ViewTenantRentRoll";
import ViewTenantsLeasingCosts from "./ViewTenantLeasingCosts";
import ViewVacancySchedule from "./ViewVacancySchedule";
import ViewMarketRents from "./ViewMarketRents";
import ViewRecoveryStructures from "./ViewRecoveryStructures";
import {Navigate, NavLink, Route, Routes} from 'react-router';
import RouteScreen from '../routing/RouteScreen';
import AppraisalContentHeader from "./components/AppraisalContentHeader";

class ViewTenants extends React.Component
{
    state = {
        width: 0,
        height: 0
    };

    componentDidMount() {
    }

    render()
    {
        const routeProps = {
            appraisalId: this.props.appraisalId,
            appraisal: this.props.appraisal,
            saveAppraisal: this.props.saveAppraisal,
        };

        const basePath = `/appraisal/${this.props.appraisalId}/tenants`;
        const tabClass = ({isActive}) => `nav-link${isActive ? ' active' : ''}`;
        return (
            [
                <AppraisalContentHeader key={1} appraisal={this.props.appraisal} title="Tenants" />,
                <Row key={2}>
                    <Col xs={12}>
                        <Nav tabs>
                            <NavItem>
                                <NavLink to={`${basePath}/rent_roll`} className={tabClass}>Rent Roll</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${basePath}/market_rents`} className={tabClass}>Market Rents</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${basePath}/recovery_structures`} className={tabClass}>Recovery Structures</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${basePath}/leasing_costs`} className={tabClass}>Leasing Costs</NavLink>
                            </NavItem>
                            {/*<NavItem>*/}
                                {/*<NavLink to={`${this.props.match.url}/vacancy_schedule`} activeClassName="active"*/}
                                         {/*tag={RRNavLink}>Vacancy Schedule</NavLink>*/}
                            {/*</NavItem>*/}
                        </Nav>
                    </Col>
                </Row>,
                <Row key={3}>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                <div id={"view-tenants"}>
                                    <Routes>
                                        <Route index element={<Navigate to="rent_roll" replace />} />
                                        <Route path="rent_roll" element={<RouteScreen component={ViewTenantsRentRoll} {...routeProps} />} />
                                        <Route path="leasing_costs" element={<RouteScreen component={ViewTenantsLeasingCosts} {...routeProps} />} />
                                        <Route path="vacancy_schedule" element={<RouteScreen component={ViewVacancySchedule} {...routeProps} />} />
                                        <Route path="market_rents" element={<RouteScreen component={ViewMarketRents} {...routeProps} />} />
                                        <Route path="recovery_structures" element={<RouteScreen component={ViewRecoveryStructures} {...routeProps} />} />
                                    </Routes>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>]
        );
    }
}

export default ViewTenants;
