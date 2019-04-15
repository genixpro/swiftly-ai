import React from 'react';
import {Row, Col, Card, CardBody, Nav, NavItem, NavLink} from 'reactstrap';
import axios from 'axios';
import ViewFinancialStatementExtractions from "./ViewFinancialStatementExtractions";
import ViewFinancialStatementAudit from "./ViewFinancialStatementAudit";
import {NavLink as RRNavLink} from 'react-router-dom';
import {Switch, Route} from 'react-router-dom';
import FileModel from "../orm/FileModel";


class ViewFinancialStatement extends React.Component {
    state = {
        width: 0,
        height: 0
    };

    componentDidMount() {
        axios.get(`/appraisal/${this.props.match.params.id}/files/${this.props.match.params.financialStatementId}`).then((response) => {
            this.setState({financialStatement: FileModel.create(response.data.file)})
        });
    }

    componentDidUpdate() {

    }

    saveFinancialStatementData(newLease) {
        axios.post(`/appraisal/${this.props.match.params.id}/files/${this.props.match.params.financialStatementId}`, newLease).then((response) => {
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
                                            {/*<NavItem>*/}
                                            {/*<NavLink to={`${this.props.match.url}/summary`} activeClassName="active" tag={RRNavLink}>Summarized Data</NavLink>*/}
                                            {/*</NavItem>*/}
                                            <NavItem>
                                                <NavLink to={`${this.props.match.url}/raw`} activeClassName="active"
                                                         tag={RRNavLink}>Raw Financial Statement</NavLink>
                                            </NavItem>
                                            {/*<NavItem>*/}
                                            {/*<NavLink to={`${this.props.match.url}/audit`} activeClassName="active" tag={RRNavLink}>Audit</NavLink>*/}
                                            {/*</NavItem>*/}
                                        </Nav>
                                    </Col>
                                </Row>
                                {
                                    (this.state.financialStatement && <Row>
                                        <Col xs={12}>
                                            <Card className="card-default">
                                                <CardBody>
                                                    <Switch>
                                                        <Route path={`${this.props.match.url}/raw`}
                                                               render={() => <ViewFinancialStatementExtractions
                                                                   financialStatement={this.state.financialStatement}
                                                                   saveFinancialStatementData={this.saveFinancialStatementData.bind(this)}/>}
                                                               financialStatement={this.state.financialStatement}/>
                                                        <Route path={`${this.props.match.url}/audit`}
                                                               render={() => <ViewFinancialStatementAudit
                                                                   financialStatement={this.state.financialStatement}
                                                                   saveFinancialStatementData={this.saveFinancialStatementData.bind(this)}/>}
                                                               financialStatement={this.state.financialStatement}/>
                                                        <Route path={`${this.props.match.url}/summary`}
                                                               render={() => <ViewFinancialStatementAudit
                                                                   financialStatement={this.state.financialStatement}
                                                                   saveFinancialStatementData={this.saveFinancialStatementData.bind(this)}/>}
                                                               financialStatement={this.state.financialStatement}/>
                                                        <Route path={`${this.props.match.url}/report`}
                                                               render={() => <ViewFinancialStatementAudit
                                                                   financialStatement={this.state.financialStatement}
                                                                   saveFinancialStatementData={this.saveFinancialStatementData.bind(this)}/>}
                                                               financialStatement={this.state.financialStatement}/>
                                                    </Switch>
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
