import React from 'react';
import { Table } from 'reactstrap';
import AppraisalListItem from './AppraisalListItem';


class AppraisalList extends React.Component
{
    render() {
        return (
            <Table striped bordered hover responsive>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {
                    this.props.appraisals.map((appraisal) => <AppraisalListItem key={appraisal._id} deleteAppraisal={this.props.deleteAppraisal} appraisal={appraisal} navigate={this.props.navigate} search={this.props.search}/>)
                }
                </tbody>
            </Table>
        );
    }
}


export default AppraisalList;
