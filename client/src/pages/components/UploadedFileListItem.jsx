import React from 'react';
import axios from '@api/client';
import {Button} from 'reactstrap';


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

        axios.patch(`/appraisals/${this.props.appraisalId}/files/${this.state.file._id}`, {"fileType": evt.target.value}).then((response) =>
        {

        });
    }

    onDeleteFile(evt)
    {

        evt.stopPropagation();
        if (window.confirm(`Are you sure you want to remove “${this.state.file.fileName}”?`))
        {
            this.setState({deleting: true, deleteError: null});
            axios.delete(`/appraisals/${this.props.appraisalId}/files/${this.state.file._id}`).then((response) =>
            {
                this.props.handleDeletion(this.props.file);
            }).catch(() => {
                this.setState({deleting: false, deleteError: "The file could not be removed. Please try again."});
            });
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
            <tr className="uploaded-file-list-item">
                <td>{file.fileName}</td>
                <td>
                    <span>{file.reviewStatus || "fresh"}</span>
                    {file.extractionError && <small className="d-block text-danger">{file.extractionError}</small>}
                </td>
                {/*<td>*/}
                {/*<select value={file.fileType} onChange={this.onFileTypeChanged.bind(this)} onClick={(evt) => evt.stopPropagation()}>*/}
                {/*<option value={"lease"}>Lease</option>*/}
                {/*<option value={"financials"}>Financial Statement</option>*/}
                {/*<option value={"comparable"}>Comparable Sale</option>*/}
                {/*<option value={"rentroll"}>Rent Roll</option>*/}
                {/*</select>*/}
                {/*</td>*/}
                <td>
                    <Button color="danger" disabled={this.state.deleting} onClick={(evt) => this.onDeleteFile(evt)}>
                        {this.state.deleting ? "Removing…" : "Remove"}
                    </Button>
                    {this.state.deleteError ? <small className="d-block text-danger" role="alert">{this.state.deleteError}</small> : null}
                </td>
            </tr>
        );
    }
}


export default UploadedFileListItem;
