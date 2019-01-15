import React from 'react';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardBody, CardHeader, FormGroup, Input, Table } from 'reactstrap';
import FinancialStatementListItem from './FinancialStatementListItem';


class FinancialStatementList extends React.Component
{
    render() {
        return (
            <Table striped bordered hover responsive>
                <thead>
                <tr>
                    <th>Name</th>
                </tr>
                </thead>
                <tbody>
                {
                    this.props.financialStatements.map((financial_statement) => <FinancialStatementListItem financial_statement={financial_statement} history={this.props.history} appraisalId={this.props.appraisalId}/>)
                }
                </tbody>
            </Table>
        );
    }
}


export default FinancialStatementList;
