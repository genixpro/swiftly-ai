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
import mixpanel from "mixpanel-browser";


class UploadFiles extends React.Component {
    state = {
        files: [],
        uploading: false
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
        mixpanel.track("upload-file");

        this.setState({uploading: true});
        Promise.mapSeries(files, (file) => {
            return new Promise((resolve, reject) => {
                const data = new FormData();
                data.set("fileName", file.name);
                data.set("file", file);
                const options = {
                    method: 'post',
                    url: "/appraisal/" + this.props.match.params['id'] + "/files",
                    data: data
                };

                const uploadPromise = axios(options);

                uploadPromise.then((response) => {
                    resolve(null);
                    // setTimeout(() => {
                    // const upProg = this.state.upProg;
                    // upProg[file.name] = 100;
                    // this.setState({upProg});
                    // }, 50);
                }, (error) => {
                    console.log(error);
                    console.log(JSON.stringify(error, null, 2));
                    resolve(null);
                });
                uploadPromise.catch(() => resolve(null));
            })
        }).then(() => {
            this.setState({uploading: false});
            this.refreshFileList();
            this.props.reloadAppraisal();
        }, (err) => {
            this.setState({uploading: false});
        });
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
                                                process.env.VALUATE_ENVIRONMENT.REACT_APP_ENABLE_UPLOAD === 'true' ?
                                                    <Dropzone className="card card-default upload-zone"
                                                              ref="dropzone"
                                                              multiple
                                                              onDrop={this.onDrop.bind(this)}
                                                              align="center"
                                                    >
                                                        <div className={"drop-zone-content-wrapper"}>
                                                            <i className={"fa fa-upload drop-zone-upload-icon"}/>
                                                            <br/>
                                                            <br/>
                                                            <span>Drop files here or click here to upload</span>

                                                            {
                                                                this.state.uploading &&
                                                                <div className="upload-files-loader ball-pulse">
                                                                    <div></div>
                                                                    <div></div>
                                                                    <div></div>
                                                                </div>
                                                            }
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
