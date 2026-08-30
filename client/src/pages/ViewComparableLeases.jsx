import React from 'react';
import {Row, Col, Card, CardBody, Nav, NavItem} from 'reactstrap';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import ViewComparableLeasesDatabase from "./ViewComparableLeasesDatabase";
import ViewAppraisalComparableLeases from "./ViewAppraisalComparableLeases";
import {Navigate, NavLink, Route, Routes} from 'react-router';
import RouteScreen from '../routing/RouteScreen';


class ViewComparableLeases extends React.Component {
    state = {
        comparableLeases: []
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

        const basePath = `/appraisal/${this.props.appraisalId}/comparable_leases`;
        const tabClass = ({isActive}) => `nav-link${isActive ? ' active' : ''}`;
        return [
            <AppraisalContentHeader key={1} appraisal={this.props.appraisal} title="Comparable Leases" />,
            <Row key={2}>
                <Col xs={12}>
                    <Nav tabs className="comparables-navigation">
                        <NavItem>
                            <NavLink to={`${basePath}/database`} className={tabClass}>Comparable Leases Database</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink to={`${basePath}/appraisal`} className={tabClass}>Appraisal Comparable Leases</NavLink>
                        </NavItem>
                    </Nav>
                </Col>
            </Row>,
            <Row key={3}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <div id={"view-tenants"}>
                                <Routes>
                                    <Route index element={<Navigate to="database" replace />} />
                                    <Route path="appraisal" element={<RouteScreen component={ViewAppraisalComparableLeases} {...routeProps} />} />
                                    <Route path="database" element={<RouteScreen component={ViewComparableLeasesDatabase} {...routeProps} />} />
                                </Routes>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        ];

    }
}

export default ViewComparableLeases;
