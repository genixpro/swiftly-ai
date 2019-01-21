import React from 'react';
import ComparableSaleFields from './ComparableSaleFields';
import AnnotationEditor from './components/AnnotationEditor';

class ViewComparableSaleExtractions extends React.Component
{
    saveDocument(newFinancialStatement)
    {
        this.props.saveComparableSaleData(newFinancialStatement);
    }


    render() {
        return (
            <AnnotationEditor saveDocument={(doc) => this.saveDocument(doc)} document={this.props.comparableSale} annotationFields={ComparableSaleFields} />
        );
    }
}

export default ViewComparableSaleExtractions;


