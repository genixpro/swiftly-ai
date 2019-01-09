import React from 'react';


class AppraisalListItem extends React.Component
{
    render()
    {
        const appraisal = this.props.appraisal;
        return (
            <tr onClick={(evt) => this.props.history.push("/appraisal/" + this.props.appraisal._id['$oid'] + "/upload")} className={"appraisal-list-item"}>
                <td>{appraisal.name}</td>
                <td>{appraisal.address}</td>
                <td>{appraisal.city}</td>
                <td>{appraisal.region}</td>
                <td>{appraisal.country}</td>
            </tr>
        );
    }
}


export default AppraisalListItem;