import React from 'react';
import { Table } from 'reactstrap';
import UploadedFileListItem from './UploadedFileListItem';
import axios from "axios";
import FileModel from "../../orm/FileModel";

class UploadedFileList extends React.Component
{
    state = {
        files: []
    };

    componentDidMount()
    {
        this.refresh();

        if (this.props.ref)
        {
            this.props.ref(this);
        }
    }

    refresh()
    {
        axios.get(`/appraisal/${this.props.appraisalId}/files`).then((response) =>
        {
            this.setState({files: response.data.files.map((file) => FileModel.create(file))})
        });
    }

    render() {
        return (
            <Table striped bordered hover responsive>
                <thead>
                <tr>
                    <th>File Name</th>
                    <th>Type</th>
                </tr>
                </thead>
                <tbody>
                {
                    this.state.files.map((file) => <UploadedFileListItem key={file._id} file={file} appraisalId={this.props.appraisalId} handleDeletion={() => this.refresh()} history={this.props.history}/>)
                }
                </tbody>
            </Table>
        );
    }
}


export default UploadedFileList;
