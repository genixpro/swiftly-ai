import React from 'react';
import LeaseFields from './LeaseFields';
import AnnotationEditor from './components/AnnotationEditor';

class ViewLeaseExtractions extends React.Component
{
    saveAppraisal(newLease)
    {
        this.props.saveLeaseData(newLease);
    }


    render() {
        return (
            <AnnotationEditor saveAppraisal={(doc) => this.saveAppraisal(doc)} document={this.props.lease} annotationFields={LeaseFields} />
        );
    }
}

export default ViewLeaseExtractions;
