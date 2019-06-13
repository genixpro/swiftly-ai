import React from 'react';
import { Table } from 'reactstrap';
import UploadedFileListItem from './UploadedFileListItem';
import axios from "axios";
import FileModel from "../../models/FileModel";

class UploadedFileList extends React.Component
{
    componentDidMount()
    {

    }

    render() {
        if (this.props.files.length === 0)
        {
            return null;
        }

        return (
            <Table striped bordered hover responsive>
                <thead>
                <tr>
                    <th>File Name</th>
                    {
                        process.env.VALUATE_ENVIRONMENT.REACT_APP_ENABLE_UPLOAD === 'true' ?
                            <th>Action</th>
                            : null
                    }
                </tr>
                </thead>
                <tbody>
                {
                    this.props.files.map((file) => <UploadedFileListItem key={file._id} file={file} appraisalId={this.props.appraisalId} handleDeletion={() => this.props.onDeleteFile()} history={this.props.history}/>)
                }
                </tbody>
            </Table>
        );
    }
}


export default UploadedFileList;
