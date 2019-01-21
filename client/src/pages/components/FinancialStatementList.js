import React from 'react';
import { Table } from 'reactstrap';
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
                    this.props.financialStatements.map((financial_statement) => <FinancialStatementListItem key={financial_statement._id['$oid']} financialStatement={financial_statement} history={this.props.history} appraisalId={this.props.appraisalId}/>)
                }
                </tbody>
            </Table>
        );
    }
}


export default FinancialStatementList;
