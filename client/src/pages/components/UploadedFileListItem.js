import React from 'react';
import axios from "axios/index";
import { Button } from 'reactstrap';


class UploadedFileListItem extends React.Component
{
    state = {};

    componentDidMount()
    {
        this.setState({file: this.props.file})
    }

    onFileTypeChanged(evt)
    {
        const file = this.state.file;
        file.type = evt.target.value;
        this.setState({file: file});

        axios.post(`/appraisal/${this.props.appraisalId}/files/${this.state.file._id['$oid']}`, {"type": evt.target.value}).then((response) =>
        {

        });
    }

    onDeleteFile(evt)
    {
        axios.delete(`/appraisal/${this.props.appraisalId}/files/${this.state.file._id['$oid']}`).then((response) =>
        {
            this.props.handleDeletion(this.props.file);
        });
    }

    onFileClicked()
    {
        if (this.state.file.type === 'financials')
        {
            this.props.history.push("/appraisal/" + this.props.appraisalId + "/financial_statement/" + this.state.file._id['$oid'] + "/raw");
        }
        else if (this.state.file.type === 'lease')
        {
            this.props.history.push("/appraisal/" + this.props.appraisalId + "/lease/" + this.state.file._id['$oid'] + "/raw");
        }
        else if (this.state.file.type === 'comparable')
        {
            this.props.history.push("/appraisal/" + this.props.appraisalId + "/comparable_sale/" + this.state.file._id['$oid'] + "/raw");
        }

    }


    render()
    {
        const file = this.state.file;

        if (!file)
        {
            return <tr></tr>;
        }

        return (
            <tr className={"uploaded-file-list-item"} onClick={(evt) => this.onFileClicked()}>
                <td>{file.fileName}</td>
                <td>
                    <select value={file.type} onChange={this.onFileTypeChanged.bind(this)}>
                        <option value={"lease"}>Lease</option>
                        <option value={"financials"}>Financial Statement</option>
                        <option value={"comparable"}>Comparable Sale</option>
                        <option value={"rentroll"}>Rent Roll</option>
                    </select>
                </td>
                <td>
                    <Button color="danger" onClick={(evt) => this.onDeleteFile()}>Remove</Button>
                </td>
            </tr>
        );
    }
}


export default UploadedFileListItem;
