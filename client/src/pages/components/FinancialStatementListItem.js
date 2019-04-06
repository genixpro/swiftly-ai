import React from 'react';


class FinancialStatementListItem extends React.Component
{
    render()
    {
        const financialStatement = this.props.financialStatement;
        return (
            <tr onClick={(evt) => this.props.history.push("/appraisal/" + this.props.appraisalId + "/financial_statement/" + this.props.financialStatement._id + "/raw")}
                className={"financial-statement-list-item"}>
                <td>{financialStatement.fileName}</td>
            </tr>
        );
    }
}


export default FinancialStatementListItem;