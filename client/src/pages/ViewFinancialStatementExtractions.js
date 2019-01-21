import React from 'react';
import FinancialStatementsFields from './FinancialStatementFields';
import AnnotationEditor from './components/AnnotationEditor';

class ViewFinancialStatementExtractions extends React.Component
{
    saveDocument(newFinancialStatement)
    {
        this.props.saveFinancialStatementData(newFinancialStatement);
    }


    render() {
        return (
            <AnnotationEditor saveDocument={(doc) => this.saveDocument(doc)} document={this.props.financialStatement} annotationFields={FinancialStatementsFields} />
        );
    }
}

export default ViewFinancialStatementExtractions;
