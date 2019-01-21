import React from 'react';
import LeaseFields from './LeaseFields';
import AnnotationEditor from './components/AnnotationEditor';

class ViewLeaseExtractions extends React.Component
{
    saveDocument(newLease)
    {
        this.props.saveLease(newLease);
    }


    render() {
        return (
            <AnnotationEditor saveDocument={(doc) => this.saveDocument(doc)} document={this.props.lease} annotationFields={LeaseFields} />
        );
    }
}

export default ViewLeaseExtractions;
