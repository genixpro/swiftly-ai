import React from 'react';
import { Button } from 'reactstrap';
import Sidebar from "../../components/Layout/Sidebar";

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

    itemClicked()
    {
        console.log(this.props.appraisal)

        Sidebar.getGlobalSidebar().changeAppraisalType(this.props.appraisal.appraisalType);

        this.props.history.push("/appraisal/" + this.props.appraisal._id + "/upload");
    }

    render()
    {
        const appraisal = this.props.appraisal;
        return (
            <tr onClick={(evt) => this.itemClicked()} className={"appraisal-list-item"}>
                <td>{appraisal.name}</td>
                <td>{appraisal.address}</td>

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