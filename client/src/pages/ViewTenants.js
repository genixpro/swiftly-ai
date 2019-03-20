import React from 'react';
import {Row, Col, Card, CardBody, Nav, NavItem, NavLink} from 'reactstrap';
import axios from 'axios';
import ViewTenantsRentRoll from "./ViewTenantRentRoll";
import {NavLink as RRNavLink} from 'react-router-dom';
import {Switch, Route} from 'react-router-dom';


class ViewTenants extends React.Component {
    state = {
        width: 0,
        height: 0
    };

    render() {
        console.log(this.props);
        return (
            [<Row>
                <Col xs={12}>
                    <Nav tabs>
                        <NavItem>
                            <NavLink to={`${this.props.match.url}/raw`} activeClassName="active" tag={RRNavLink}>Rent Roll</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink to={`${this.props.match.url}/report`} activeClassName="active" tag={RRNavLink}>Leasing Costs</NavLink>
                        </NavItem>
                    </Nav>
                </Col>
            </Row>,
            <Row>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <div id={"view-tenants"}>
                                <Switch>
                                    <Route path={`${this.props.match.url}/`}
                                           render={() => <ViewTenantsRentRoll appraisalId={this.props.match.params.id}/>}/>
                                    <Route path={`${this.props.match.url}/rent_roll`}
                                           render={() => <ViewTenantsRentRoll appraisalId={this.props.match.params.id}/>}/>
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
