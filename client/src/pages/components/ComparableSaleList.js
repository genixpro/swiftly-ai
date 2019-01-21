import React from 'react';
import { Table } from 'reactstrap';
import ComparableSaleListItem from './ComparableSaleListItem';


class ComparableSaleList extends React.Component
{
    render() {
        return (
            <Table striped bordered hover responsive>
                <thead>
                <tr>
                    <th>Name</th>
                </tr>
                </thead>
                <tbody>
                {
                    this.props.comparableSales.map((comparableSale) => <ComparableSaleListItem key={comparableSale._id['$oid']} comparableSale={comparableSale} history={this.props.history} appraisalId={this.props.appraisalId}/>)
                }
                </tbody>
            </Table>
        );
    }
}


export default ComparableSaleList;
