import React from 'react';
import axios from "axios/index";
import {Button} from 'reactstrap';
import Auth from "../../Auth";


class UploadedFileListItem extends React.Component
{
    state = {};

    componentDidMount()
    {
        this.setState({file: this.props.file})
    }

    onFileTypeChanged(evt)
    {
        evt.stopPropagation();

        const file = this.state.file;
        file.fileType = evt.target.value;
        this.setState({file: file});

        axios.post(`/appraisal/${this.props.appraisalId}/files/${this.state.file._id}`, {"fileType": evt.target.value}).then((response) =>
        {

        });
    }

    onDeleteFile(evt)
    {
        evt.stopPropagation();
        if (window.confirm("Are you sure you want to remove the file?"))
        {
            axios.delete(`/appraisal/${this.props.appraisalId}/files/${this.state.file._id}`).then((response) =>
            {
                this.props.handleDeletion(this.props.file);
            });
        }
    }

    onFileClicked()
    {
        if (Auth.isAdmin)
        {
            this.props.history.push("/appraisal/" + this.props.appraisalId + "/financial_statement/" + this.state.file._id + "/raw");
            // if (this.state.file.fileType === 'financials')
            // {
            // this.props.history.push("/appraisal/" + this.props.appraisalId + "/financial_statement/" + this.state.file._id + "/raw");
            // }
            // else if (this.state.file.fileType === 'lease')
            // {
            //     this.props.history.push("/appraisal/" + this.props.appraisalId + "/lease/" + this.state.file._id + "/raw");
            // }
            // else if (this.state.file.fileType === 'comparable')
            // {
            //     this.props.history.push("/appraisal/" + this.props.appraisalId + "/comparable_sale/" + this.state.file._id + "/raw");
            // }
        }
    }


    render()
    {
        const file = this.state.file;

        if (!file)
        {
            return <tr></tr>;
        }

        let className = "";

        if (Auth.isAdmin)
        {
            className = "clickable";
        }

        return (
            <tr className={`uploaded-file-list-item ${className}`} onClick={(evt) => this.onFileClicked()}>
                <td>{file.fileName}</td>
                {/*<td>*/}
                {/*<select value={file.fileType} onChange={this.onFileTypeChanged.bind(this)} onClick={(evt) => evt.stopPropagation()}>*/}
                {/*<option value={"lease"}>Lease</option>*/}
                {/*<option value={"financials"}>Financial Statement</option>*/}
                {/*<option value={"comparable"}>Comparable Sale</option>*/}
                {/*<option value={"rentroll"}>Rent Roll</option>*/}
                {/*</select>*/}
                {/*</td>*/}
                {
                    process.env.VALUATE_ENVIRONMENT.REACT_APP_ENABLE_UPLOAD === 'true' ?
                        <td>
                            <Button color="danger" onClick={(evt) => this.onDeleteFile(evt)}>Remove</Button>
                        </td>
                        : null
                }
            </tr>
        );
    }
}


export default UploadedFileListItem;
