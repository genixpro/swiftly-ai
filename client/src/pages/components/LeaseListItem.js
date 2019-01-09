import React from 'react';


class LeaseListItem extends React.Component
{
    render()
    {
        const lease = this.props.lease;
        return (
            <tr onClick={(evt) => this.props.history.push("/appraisal/" + this.props.appraisalId + "/lease/" + this.props.lease._id['$oid'] + "/summary")} className={"lease-list-item"}>
                <td>{lease.fileName}</td>
                <td>{lease.monthlyRent}</td>
                <td>{lease.size}</td>
                <td>{lease.pricePerSquareFoot}</td>
            </tr>
        );
    }
}


export default LeaseListItem;