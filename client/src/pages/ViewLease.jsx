import React from 'react';
import {Row, Col, Card, CardBody, Nav, NavItem} from 'reactstrap';
import {filesApi} from '@api/resources';
import ViewLeaseReport from "./ViewLeaseReport";
import {Navigate, NavLink, Route, Routes} from 'react-router';
import FileModel from "../models/FileModel";


class ViewLease extends React.Component {
    state = {
        width: 0,
        height: 0
    };

    componentDidMount() {
        filesApi.get(this.props.appraisalId, this.props.leaseId).then((file) => {
            this.setState({lease: FileModel.create(file)})
        });
    }

    componentDidUpdate() {

    }

    saveLeaseData(newLease) {
        filesApi.update(this.props.appraisalId, this.props.leaseId, {extractedData: newLease.extractedData}).then(() => {
            this.setState({lease: newLease})
        });
    }

    render() {
        return (
            <Row>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <div id={"view-lease-page"}>
                                <Row>
                                    <Col xs={12}>
                                        <Nav tabs>
                                            {/*<NavItem>*/}
                                            {/*<NavLink to={`${this.props.match.url}/summary`} activeClassName="active" tag={RRNavLink}>Summarized Data</NavLink>*/}
                                            {/*</NavItem>*/}
                                            <NavItem>
                                                <NavLink to={`/appraisal/${this.props.appraisalId}/lease/${this.props.leaseId}/report`}
                                                         className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}>Report</NavLink>
                                            </NavItem>
                                        </Nav>
                                    </Col>
                                </Row>
                                {
                                    (this.state.lease && <Row>
                                        <Col xs={12}>
                                            <Card className="card-default">
                                                <CardBody>
                                                    <Routes>
                                                        <Route index element={<Navigate to="report" replace />} />
                                                        <Route path="summary" element={<ViewLeaseReport lease={this.state.lease} saveLeaseData={this.saveLeaseData.bind(this)}/>} />
                                                        <Route path="report" element={<ViewLeaseReport lease={this.state.lease} saveLeaseData={this.saveLeaseData.bind(this)}/>} />
                                                    </Routes>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    </Row>)
                                }
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default ViewLease;
