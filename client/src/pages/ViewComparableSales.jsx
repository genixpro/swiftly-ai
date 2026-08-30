import React from 'react';
import {Row, Col, Card, CardBody, Nav, NavItem} from 'reactstrap';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import ViewComparableSalesDatabase from "./ViewComparableSalesDatabase";
import ViewAppraisalComparableSales from "./ViewAppraisalComparableSales";
import {Navigate, NavLink, Route, Routes} from 'react-router';
import RouteScreen from '../routing/RouteScreen';



class ViewComparableSales extends React.Component {
    state = {
        comparableSales: []
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

        const capRateRouteFields = {
            ...routeProps, compsField: "comparableSalesCapRate"
        };

        const dcaRouteFields = {
            ...routeProps, compsField: "comparableSalesDCA"
        };

        const basePath = `/appraisal/${this.props.appraisalId}/comparable_sales`;
        const tabClass = ({isActive}) => `nav-link${isActive ? ' active' : ''}`;
        return [
            <AppraisalContentHeader key={1} appraisal={this.props.appraisal} title="Comparable Sales" />,
            <Row key={2}>
                <Col xs={12}>
                    <Nav tabs className="comparables-navigation">
                        <NavItem>
                            <NavLink to={`${basePath}/database`} className={tabClass}>Comparable Sales Database</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink to={`${basePath}/appraisal_caprate`} className={tabClass}>Comparable Sales for Capitalization Approach</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink to={`${basePath}/appraisal_dca`} className={tabClass}>Comparable Sales for Direct Comparison Approach</NavLink>
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
                                    <Route path="appraisal_caprate" element={<RouteScreen component={ViewAppraisalComparableSales} {...capRateRouteFields} />} />
                                    <Route path="appraisal_dca" element={<RouteScreen component={ViewAppraisalComparableSales} {...dcaRouteFields} />} />
                                    <Route path="database" element={<RouteScreen component={ViewComparableSalesDatabase} {...routeProps} />} />
                                </Routes>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        ];

    }
}

export default ViewComparableSales;
