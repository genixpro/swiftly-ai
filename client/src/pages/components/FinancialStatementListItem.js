import React from 'react';


class FinancialStatementListItem extends React.Component
{
    render()
    {
        const financialStatement = this.props.financialStatement;
        return (
            <tr onClick={(evt) => this.props.history.push("/appraisal/" + this.props.appraisalId + "/financial_statement/" + this.props.lease._id['$oid'] + "/summary")} className={"financial-list-item"}>
                <td>{financialStatement.fileName}</td>
            </tr>
        );
    }
}


export default FinancialStatementListItem;