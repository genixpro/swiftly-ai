import React from 'react';
import {Row, Col, Card, CardBody, Nav, NavItem, NavLink} from 'reactstrap';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import {withProps} from "recompose";
import ViewComparableLeasesDatabase from "./ViewComparableLeasesDatabase";
import ViewAppraisalComparableLeases from "./ViewAppraisalComparableLeases";
import {NavLink as RRNavLink} from 'react-router-dom';
import {Switch, Route} from 'react-router-dom';


class ViewComparableLeases extends React.Component {
    state = {
        comparableLeases: []
    };

    render()
    {
        const routeProps = {
            appraisalId: this.props.match.params.id,
            appraisal: this.props.appraisal,
            saveDocument: this.props.saveDocument,
        };

        return [
            <AppraisalContentHeader key={1} appraisal={this.props.appraisal} title="Comparable Leases" />,
            <Row key={2}>
                <Col xs={12}>
                    <Nav tabs>
                        <NavItem>
                            <NavLink to={`${this.props.match.url}/database`} activeClassName="active" tag={RRNavLink}>Comparable Leases Database</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink to={`${this.props.match.url}/appraisal`} activeClassName="active" tag={RRNavLink}>Appraisal Comparable Leases</NavLink>
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
                                    <Route path={`${this.props.match.url}/appraisal`} render={(props) => withProps({...routeProps, ...props})(ViewAppraisalComparableLeases)()} />
                                    <Route path={`${this.props.match.url}/database`} render={(props) => withProps({...routeProps, ...props})(ViewComparableLeasesDatabase)()} />
                                </Switch>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        ];

    }
}

export default ViewComparableLeases;
