import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import {filesApi} from '@api/resources';
import FinancialStatementList from "./components/FinancialStatementList"
import FileModel from "../models/FileModel";

class ViewFinancialStatements extends React.Component {
    state = {
        financial_statements: []
    };

    componentDidMount()
    {
        filesApi.list(this.props.appraisalId, 'financials').then((files) => {
            this.setState({financial_statements: files.map((file) => FileModel.create(file))})
        });
    }


    render() {
        return (
            <Row>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <div>
                                <Row>
                                    <Col xs={12}>
                                        <h3>View Financial Statements</h3>
                                    </Col>
                                    <Col xs={12}>
                                        <FinancialStatementList
                                            financialStatements={this.state.financial_statements}
                                            navigate={this.props.navigate} search={this.props.search} appraisalId={this.props.appraisalId}/>
                                    </Col>
                                </Row>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default ViewFinancialStatements;
