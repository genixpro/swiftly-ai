import React from 'react';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardBody, CardHeader, FormGroup, Input, Table } from 'reactstrap';
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
                </tr>
                </thead>
                <tbody>
                {
                    this.props.appraisals.map((appraisal) => <AppraisalListItem appraisal={appraisal} history={this.props.history}/>)
                }
                </tbody>
            </Table>
        );
    }
}


export default AppraisalList;
