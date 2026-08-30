import React from 'react';
import { Button } from 'reactstrap';
import { Sidebar } from "../../components/Layout/Sidebar";

class AppraisalListItem extends React.Component
{
    deleteAppraisal(evt)
    {
        evt.stopPropagation();
        if (window.confirm(`Are you sure you want to delete “${this.props.appraisal.name}”?`))
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

        this.props.navigate("/appraisal/" + this.props.appraisal._id + "/upload");
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
            <tr className={"appraisal-list-item"}>
                <td>{appraisal.name}</td>
                <td>{appraisal.address}</td>

                <td className={"action-column"}>
                    <Button color="primary" onClick={(evt) => this.openAppraisal(evt)} aria-label={`Open ${appraisal.name}`}>
                        Open
                    </Button>
                    {' '}
                    <Button
                        color="danger"
                        onClick={(evt) => this.deleteAppraisal(evt)}
                        aria-label={`Delete ${appraisal.name}`}
                        className="icon-button"
                    >
                        <i className="fa fa-trash-alt" aria-hidden="true"></i>
                    </Button>
                </td>
            </tr>
        );
    }
}


export default AppraisalListItem;
