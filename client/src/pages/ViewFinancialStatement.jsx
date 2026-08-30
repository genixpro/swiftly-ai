import React from 'react';
import {Row, Col, Card, CardBody, Nav, NavItem} from 'reactstrap';
import {filesApi} from '@api/resources';
import ViewFinancialStatementAudit from "./ViewFinancialStatementAudit";
import {Navigate, NavLink, Route, Routes} from 'react-router';
import FileModel from "../models/FileModel";


class ViewFinancialStatement extends React.Component {
    state = {
        width: 0,
        height: 0
    };

    componentDidMount() {
        filesApi.get(this.props.appraisalId, this.props.financialStatementId).then((file) => {
            this.setState({financialStatement: FileModel.create(file)})
        });
    }

    componentDidUpdate() {

    }

    saveFinancialStatementData(newLease) {
        filesApi.update(this.props.appraisalId, this.props.financialStatementId, {extractedData: newLease.extractedData}).then(() => {
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
