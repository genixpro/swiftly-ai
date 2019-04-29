import React from 'react';
import { Button } from 'reactstrap';


class AppraisalListItem extends React.Component
{
    deleteAppraisal(evt)
    {
        evt.stopPropagation();
        if (window.confirm("Are you sure you want to delete the appraisal?"))
        {
            this.props.deleteAppraisal(this.props.appraisal);
        }
    }

    render()
    {
        const appraisal = this.props.appraisal;
        return (
            <tr onClick={(evt) => this.props.history.push("/appraisal/" + this.props.appraisal._id + "/upload")} className={"appraisal-list-item"}>
                <td>{appraisal.name}</td>
                <td>{appraisal.address}</td>
                <td>{appraisal.city}</td>
                <td>{appraisal.region}</td>
                <td>{appraisal.country}</td>

                <td className={"action-column"}>
                    <Button
                        color="info"
                        onClick={(evt) => this.deleteAppraisal(evt)}
                        title={"Delete Appraisal"}
                    >
                        <i className="fa fa-trash-alt"></i>
                    </Button>
                </td>
            </tr>
        );
    }
}


export default AppraisalListItem;