import React from 'react';


class LeaseListItem extends React.Component
{
    render()
    {
        const lease = this.props.lease;
        return (
            <tr onClick={(evt) => this.props.history.push("/appraisal/" + this.props.appraisalId + "/lease/" + this.props.lease._id + "/summary")} className={"lease-list-item"}>
                <td>{lease.fileName}</td>
                <td>{lease.extractedData ? lease.extractedData.rent_per_square_foot : ""}</td>
                <td>{lease.extractedData ? lease.extractedData.size_square_feet : ""}</td>
                <td>{lease.extractedData ? lease.extractedData.term : ""}</td>
            </tr>
        );
    }
}


export default LeaseListItem;