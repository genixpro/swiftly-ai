import React from 'react';
import {Row, Col, Card, CardBody, Nav, NavItem, NavLink} from 'reactstrap';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import {withProps} from "recompose";
import ViewComparableSalesDatabase from "./ViewComparableSalesDatabase";
import ViewAppraisalComparableSales from "./ViewAppraisalComparableSales";
import {NavLink as RRNavLink} from 'react-router-dom';
import {Switch, Route} from 'react-router-dom';


class ViewComparableSales extends React.Component {
    state = {
        comparableSales: []
    };

    render()
    {
        const routeProps = {
            appraisalId: this.props.match.params.id,
            appraisal: this.props.appraisal,
            saveAppraisal: this.props.saveAppraisal,
        };

        const capRateRouteFields = {
            ...routeProps, compsField: "comparableSalesCapRate"
        };

        const dcaRouteFields = {
            ...routeProps, compsField: "comparableSalesDCA"
        };

        return [
            <AppraisalContentHeader key={1} appraisal={this.props.appraisal} title="Comparable Sales" />,
            <Row key={2}>
                <Col xs={12}>
                    <Nav tabs>
                        <NavItem>
                            <NavLink to={`${this.props.match.url}/database`} activeClassName="active" tag={RRNavLink}>Comparable Sales Database</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink to={`${this.props.match.url}/appraisal_caprate`} activeClassName="active" tag={RRNavLink}>Comparable Sales for Capitalization Approach</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink to={`${this.props.match.url}/appraisal_dca`} activeClassName="active" tag={RRNavLink}>Comparable Sales for Direct Comparison Approach</NavLink>
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
                                    <Route path={`${this.props.match.url}/appraisal_caprate`} render={(props) => withProps({...capRateRouteFields, ...props})(ViewAppraisalComparableSales)()} />
                                    <Route path={`${this.props.match.url}/appraisal_dca`} render={(props) => withProps({...dcaRouteFields, ...props})(ViewAppraisalComparableSales)()} />
                                    <Route path={`${this.props.match.url}/database`} render={(props) => withProps({...routeProps, ...props})(ViewComparableSalesDatabase)()} />
                                </Switch>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        ];

    }
}

export default ViewComparableSales;
