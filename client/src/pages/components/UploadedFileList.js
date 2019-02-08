import React from 'react';
import { Table } from 'reactstrap';
import UploadedFileListItem from './UploadedFileListItem';
import axios from "axios";

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
            this.setState({files: response.data.files})
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
                    this.state.files.map((file) => <UploadedFileListItem key={file._id['$oid']} file={file} appraisalId={this.props.appraisalId}/>)
                }
                </tbody>
            </Table>
        );
    }
}


export default UploadedFileList;
