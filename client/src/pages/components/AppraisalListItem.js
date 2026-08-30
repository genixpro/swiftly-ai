import React from 'react';
import { Button } from 'reactstrap';
import { Sidebar } from "../../components/Layout/Sidebar";

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
        const sidebar = Sidebar.getGlobalSidebar();
        if (sidebar)
        {
            sidebar.changeAppraisalType(this.props.appraisal.appraisalType);
        }

        this.props.history.push("/appraisal/" + this.props.appraisal._id + "/upload");
    }

    openAppraisal(evt)
    {
        evt.stopPropagation();
        this.itemClicked();
    }

    render()
    {
        const appraisal = this.props.appraisal;
        return (
            <tr onClick={(evt) => this.itemClicked()}
                onKeyDown={(evt) => (evt.key === 'Enter' || evt.key === ' ') && this.itemClicked()}
                tabIndex={0}
                aria-label={`Open ${appraisal.name}`}
                className={"appraisal-list-item"}>
                <td>{appraisal.name}</td>
                <td>{appraisal.address}</td>

                <td className={"action-column"}>
                    <Button color="primary" onClick={(evt) => this.openAppraisal(evt)} title="Open Appraisal">
                        Open
                    </Button>
                    {' '}
                    <Button
                        color="danger"
                        onClick={(evt) => this.deleteAppraisal(evt)}
                        title={"Delete Appraisal"}
                    >
                        <span className="sr-only">Delete</span>
                        <i className="fa fa-trash-alt"></i>
                    </Button>
                </td>
            </tr>
        );
    }
}


export default AppraisalListItem;
