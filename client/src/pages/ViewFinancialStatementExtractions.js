import React from 'react';
import FinancialStatementsFields from './FinancialStatementFields';
import AnnotationEditor from './components/AnnotationEditor';

class ViewFinancialStatementExtractions extends React.Component
{
    saveAppraisal(newFinancialStatement)
    {
        this.props.saveFinancialStatementData(newFinancialStatement);
    }


    render() {
        return (
            <AnnotationEditor saveAppraisal={(doc) => this.saveAppraisal(doc)} document={this.props.financialStatement} annotationFields={FinancialStatementsFields} />
        );
    }
}

export default ViewFinancialStatementExtractions;
