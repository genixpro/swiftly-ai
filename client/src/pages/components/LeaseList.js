import React from 'react';
import { Table } from 'reactstrap';
import LeaseListItem from './LeaseListItem';


class LeaseList extends React.Component
{
    render() {
        return (
            <Table striped bordered hover responsive>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Monthly Rent</th>
                    <th>Size</th>
                    <th>Term</th>
                </tr>
                </thead>
                <tbody>
                {
                    this.props.leases.map((lease) => <LeaseListItem key={lease._id['$oid']} lease={lease} history={this.props.history} appraisalId={this.props.appraisalId}/>)
                }
                </tbody>
            </Table>
        );
    }
}


export default LeaseList;
