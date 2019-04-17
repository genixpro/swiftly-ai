import React from 'react';
import ComparableSaleFields from './ComparableSaleFields';
import AnnotationEditor from './components/AnnotationEditor';

class ViewComparableSaleExtractions extends React.Component
{
    saveAppraisal(newFinancialStatement)
    {
        this.props.saveComparableSaleData(newFinancialStatement);
    }


    render() {
        return (
            <AnnotationEditor saveAppraisal={(doc) => this.saveAppraisal(doc)} document={this.props.comparableSale} annotationFields={ComparableSaleFields} />
        );
    }
}

export default ViewComparableSaleExtractions;


