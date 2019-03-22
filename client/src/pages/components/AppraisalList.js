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
                    <th>City</th>
                    <th>Region</th>
                    <th>Country</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {
                    this.props.appraisals.map((appraisal) => <AppraisalListItem key={appraisal._id['$oid']} deleteAppraisal={this.props.deleteAppraisal} appraisal={appraisal} history={this.props.history}/>)
                }
                </tbody>
            </Table>
        );
    }
}


export default AppraisalList;
