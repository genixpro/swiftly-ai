import React from 'react';
import {Row, Col, Card, CardBody, Nav, NavItem} from 'reactstrap';
import axios from '@api/client';
import ViewFinancialStatementAudit from "./ViewFinancialStatementAudit";
import {Navigate, NavLink, Route, Routes} from 'react-router';
import FileModel from "../models/FileModel";


class ViewFinancialStatement extends React.Component {
    state = {
        width: 0,
        height: 0
    };

    componentDidMount() {
        axios.get(`/appraisals/${this.props.appraisalId}/files/${this.props.financialStatementId}`).then((response) => {
            this.setState({financialStatement: FileModel.create(response.data.file)})
        });
    }

    componentDidUpdate() {

    }

    saveFinancialStatementData(newLease) {
        axios.patch(`/appraisals/${this.props.appraisalId}/files/${this.props.financialStatementId}`, newLease).then((response) => {
            this.setState({financialStatement: FileModel.create(newLease)})
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
                                            <NavItem>
                                                <NavLink to={`/appraisal/${this.props.appraisalId}/financial_statement/${this.props.financialStatementId}/audit`}
                                                         className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}>Extracted Data</NavLink>
                                            </NavItem>
                                        </Nav>
                                    </Col>
                                </Row>
                                {
                                    (this.state.financialStatement && <Row>
                                        <Col xs={12}>
                                            <Card className="card-default">
                                                <CardBody>
                                                    <Routes>
                                                        <Route index element={<Navigate to="audit" replace />} />
                                                        {['audit', 'summary', 'report'].map((path) => <Route key={path} path={path} element={<ViewFinancialStatementAudit
                                                            financialStatement={this.state.financialStatement}
                                                            saveFinancialStatementData={this.saveFinancialStatementData.bind(this)}/>} />)}
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

export default ViewFinancialStatement;
