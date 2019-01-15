import React from 'react';
import { translate, Trans } from 'react-i18next';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardBody, CardHeader, FormGroup, Input,  Nav, NavItem, NavLink } from 'reactstrap';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import Promise from "bluebird";
import FinancialStatementList from "./components/FinancialStatementList"


class ViewFinancialStatements extends React.Component
{
    state = {
        financial_statements: []
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.match.params.id}/financial_statements`).then((response) =>
        {
            this.setState({financial_statements: response.data.financial_statements})
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
