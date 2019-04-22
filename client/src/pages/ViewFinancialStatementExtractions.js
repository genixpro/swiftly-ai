import React from 'react';
import FinancialStatementsFields from './FinancialStatementFields';
import AnnotationEditor from './components/AnnotationEditor';

class ViewFinancialStatementExtractions extends React.Component
{
    saveFile(newFinancialStatement)
    {
        this.props.saveFinancialStatementData(newFinancialStatement);
    }


    render() {
        return (
            <AnnotationEditor
                saveFile={(doc) => this.saveFile(doc)}
                document={this.props.financialStatement}
                annotationFields={FinancialStatementsFields}
                reprocessFile={this.props.reprocessFile}
            />
        );
    }
}

export default ViewFinancialStatementExtractions;
