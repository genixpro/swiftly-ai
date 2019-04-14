import React from 'react';
import {Row, Col, Card, CardBody, Nav, NavItem, NavLink} from 'reactstrap';
import axios from 'axios';
import ViewTenantsRentRoll from "./ViewTenantRentRoll";
import ViewTenantsLeasingCosts from "./ViewTenantLeasingCosts";
import ViewVacancySchedule from "./ViewVacancySchedule";
import ViewMarketRents from "./ViewMarketRents";
import {NavLink as RRNavLink} from 'react-router-dom';
import {Switch, Route} from 'react-router-dom';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import {withProps} from "recompose";

class ViewTenants extends React.Component
{
    state = {
        width: 0,
        height: 0
    };

    render()
    {
        const routeProps = {
            appraisalId: this.props.match.params.id,
            appraisal: this.props.appraisal,
            saveDocument: this.props.saveDocument,
        };

        return (
            [
                <AppraisalContentHeader key={1} appraisal={this.props.appraisal} title="Tenants" />,
                <Row key={2}>
                    <Col xs={12}>
                        <Nav tabs>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/rent_roll`} activeClassName="active"
                                         tag={RRNavLink}>Rent Roll</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/market_rents`} activeClassName="active"
                                         tag={RRNavLink}>Market Rents</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/leasing_costs`} activeClassName="active"
                                         tag={RRNavLink}>Leasing Costs</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/vacancy_schedule`} activeClassName="active"
                                         tag={RRNavLink}>Vacancy Schedule</NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                </Row>,
                <Row key={3}>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                <div id={"view-tenants"}>
                                    <Switch>
                                        <Route path={`${this.props.match.url}/rent_roll`} render={(props) => withProps({...routeProps, ...props})(ViewTenantsRentRoll)()} />
                                        <Route path={`${this.props.match.url}/leasing_costs`} render={(props) => withProps({...routeProps, ...props})(ViewTenantsLeasingCosts)()} />
                                        <Route path={`${this.props.match.url}/vacancy_schedule`} render={(props) => withProps({...routeProps, ...props})(ViewVacancySchedule)()} />
                                        <Route path={`${this.props.match.url}/market_rents`} render={(props) => withProps({...routeProps, ...props})(ViewMarketRents)()} />
                                    </Switch>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>]
        );
    }
}

export default ViewTenants;
