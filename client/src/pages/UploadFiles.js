import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import Promise from "bluebird";
import UploadedFileList from "./components/UploadedFileList"
import 'loaders.css/loaders.css';
import 'spinkit/css/spinkit.css';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import Checklist from "./components/Checklist";
import FileModel from "../models/FileModel";


class UploadFiles extends React.Component {
    state = {
        files: [],
        uploading: false,
        uploadError: null
    };

    componentDidMount()
    {
        this.appraisalId = this.props.match.params['id'];
        this.refreshFileList();
    }

    refreshFileList()
    {
        axios.get(`/appraisal/${this.appraisalId}/files`).then((response) =>
        {
            this.setState({files: response.data.files.map((file) => FileModel.create(file))})
        });
    }

    onFileDeleted()
    {
        this.props.reloadAppraisal();
        this.refreshFileList();
    }

    onDrop(files)
    {
        if (this.uploadInProgress || !files || files.length === 0)
        {
            return;
        }

        this.uploadInProgress = true;
        this.setState({uploading: true, uploadError: null});
        Promise.mapSeries(files, (file) => {
            const data = new FormData();
            data.set("fileName", file.name);
            data.set("file", file);
            return axios({
                method: 'post',
                url: "/appraisal/" + this.props.match.params['id'] + "/files",
                data: data
            });
        }).then(() => {
            this.refreshFileList();
            this.props.reloadAppraisal();
        }).catch(() => {
            this.setState({uploadError: "One or more files could not be uploaded. Please try again."});
            this.refreshFileList();
        }).finally(() => {
            this.uploadInProgress = false;
            this.setState({uploading: false});
        });
    }

    onUploadKeyDown(evt)
    {
        if (!this.state.uploading && (evt.key === 'Enter' || evt.key === ' '))
        {
            evt.preventDefault();
            this.refs.dropzone.open();
        }
    }


    render() {
        return (
            <div className={"upload-files-page"}>
                <AppraisalContentHeader appraisal={this.props.appraisal} title="Upload Files" />
                <Row>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                <div>
                                    {/*<Row>*/}
                                        {/*<Col xs={12}>*/}
                                            {/*<h3>Upload</h3>*/}
                                            {/*<br/>*/}
                                        {/*</Col>*/}
                                    {/*</Row>*/}
                                    <Row>
                                        <Col xs={12} className={"upload-zone-column"}>
                                            {
                                                true ?
                                                    <Dropzone className="card card-default upload-zone"
                                                              ref="dropzone"
                                                              multiple
                                                              disableClick={this.state.uploading}
                                                              onDrop={this.onDrop.bind(this)}
                                                              onKeyDown={this.onUploadKeyDown.bind(this)}
                                                              role="button"
                                                              tabIndex={this.state.uploading ? -1 : 0}
                                                              aria-label="Upload appraisal files"
                                                              aria-busy={this.state.uploading}
                                                              inputProps={{'aria-label': 'Choose appraisal files to upload'}}
                                                              align="center"
                                                    >
                                                        <div className={"drop-zone-content-wrapper"}>
                                                            <i className={"fa fa-upload drop-zone-upload-icon"} aria-hidden="true"/>
                                                            <br/>
                                                            <br/>
                                                            <span>Drop files here or click here to upload</span>

                                                            {
                                                                this.state.uploading &&
                                                                <div className="upload-files-loader ball-pulse" role="status" aria-label="Uploading files">
                                                                    <div></div>
                                                                    <div></div>
                                                                    <div></div>
                                                                </div>
                                                            }
                                                            {this.state.uploadError ? <div className="alert alert-danger mt-3" role="alert">{this.state.uploadError}</div> : null}
                                                        </div>
                                                    </Dropzone> :
                                                    <div className="card card-default upload-zone upload-disabled"
                                                    >
                                                        <div className={"drop-zone-content-wrapper"}>
                                                            {/*<i className={"fa fa-upload drop-zone-upload-icon"}/>*/}
                                                            {/*<br/>*/}
                                                            <br/>
                                                            <strong>Uploads are disabled in the Sandbox.</strong>

                                                            {
                                                                this.state.uploading &&
                                                                <div className="upload-files-loader ball-pulse">
                                                                    <div></div>
                                                                    <div></div>
                                                                    <div></div>
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>

                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className={"checklist-column"}>
                                            <Checklist
                                                appraisal={this.props.appraisal}
                                                files={this.state.files}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        {/*<Col xs={12}>*/}
                                            {/*<h3>Existing Files</h3>*/}
                                        {/*</Col>*/}
                                        <Col xs={12}>
                                            <UploadedFileList appraisalId={this.props.match.params['id']}
                                                              files={this.state.files}
                                                              history={this.props.history}
                                                              onDeleteFile={() => this.onFileDeleted()}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default UploadFiles;
