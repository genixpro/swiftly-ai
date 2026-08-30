import React from 'react';
import { Table } from 'reactstrap';
import 'react-datetime/css/react-datetime.css'

class ComparableSaleSummaryList extends React.Component
{
    static defaultProps = {
    };

    state = {
        selectedUnit: null
    };


    render() {
        return (
            (this.props.appraisal) ?
                <Table hover={this.props.allowSelection} responsive className={"comparables-table " + (this.props.allowSelection ? "allow-selection" : "")}>
                    <thead>
                    <tr className={"header-row"}>
                        <td><strong>Date</strong></td>
                        <td><strong>Address</strong></td>
                        <td><strong>Building Size (sf)</strong></td>
                        <td><strong>Annual Net Rent (psf)</strong></td>
                        <td className={"action-column"} />
                    </tr>

                    </thead>
                    <tbody>



                    </tbody>
                </Table>
                : null
        );
    }
}

export default ComparableSaleSummaryList;
