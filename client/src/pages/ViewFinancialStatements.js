import React from 'react';
import { Row, Col } from 'reactstrap';
import axios from 'axios';
import FinancialStatementList from "./components/FinancialStatementList"


class ViewFinancialStatements extends React.Component
{
    state = {
        financial_statements: []
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.match.params.id}/files?type=financials`).then((response) =>
        {
            this.setState({financial_statements: response.data.files})
        });
    }


    render() {
        return (
            <div>
                <Row>
                    <Col xs={12}>
                        <h3>View Financial Statements</h3>
                    </Col>
                    <Col xs={12}>
                        <FinancialStatementList financialStatements={this.state.financial_statements} history={this.props.history} appraisalId={this.props.match.params.id}/>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ViewFinancialStatements;
