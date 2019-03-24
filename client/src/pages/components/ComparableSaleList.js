import React from 'react';
import { Table } from 'reactstrap';
import ComparableSaleListItem from './ComparableSaleListItem';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Col} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';


class ComparableSaleList extends React.Component
{
    state = {
        newComparableSale: {}
    };

    addNewComparable(newComparable)
    {
        const comparables = this.props.comparableSales;
        comparables.push(newComparable);
        this.props.onChange(comparables);
    }

    updateComparable(changedComp, index)
    {
        const comparables = this.props.comparableSales;
        comparables[index] = changedComp;
        this.props.onChange(comparables);
    }


    render() {
        return (
            <div>
                {
                    this.props.comparableSales.map((comparableSale, index) =>
                        <ComparableSaleListItem
                            key={index}
                            comparableSale={comparableSale}
                            history={this.props.history}
                            onChange={(comp) => this.updateComparable(comp, index)}
                            appraisalId={this.props.appraisalId}
                        />)
                }
                <ComparableSaleListItem comparableSale={this.state.newComparableSale} onChange={(comp) => this.addNewComparable(comp)}/>
            </div>




            // <Table striped bordered hover responsive>
            //     <thead>
            //     <tr>
            //         <th>Name</th>
            //         <th>Price Per Square Foot</th>
            //         <th>Capitalization Rate</th>
            //     </tr>
            //     </thead>
            //     <tbody>
            //     {
            //         this.props.comparableSales.map((comparableSale) => <ComparableSaleListItem key={comparableSale._id['$oid']} comparableSale={comparableSale} history={this.props.history} appraisalId={this.props.appraisalId}/>)
            //     }
            //     <tr>
            //         <td>New Comparable...</td>
            //         <td />
            //         <td />
            //     </tr>
            //     </tbody>
            // </Table>
        );
    }
}


export default ComparableSaleList;
