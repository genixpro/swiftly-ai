import React from 'react';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardBody, CardHeader, FormGroup, Input, Table } from 'reactstrap';
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
                    <th>Price Per Square Foot</th>
                </tr>
                </thead>
                <tbody>
                {
                    this.props.leases.map((lease) => <LeaseListItem lease={lease} history={this.props.history} appraisalId={this.props.appraisalId}/>)
                }
                </tbody>
            </Table>
        );
    }
}


export default LeaseList;
