import React from 'react';
import { translate, Trans } from 'react-i18next';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardBody, CardHeader, FormGroup, Input,  Nav, NavItem, NavLink } from 'reactstrap';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import Promise from "bluebird";


class UploadFiles extends React.Component
{
    state = {};

    onDrop(files)
    {
        const promise = Promise.mapSeries(files, (file) => {
            return new Promise((resolve, reject) => {
                const data = new FormData();
                data.set("fileName", file.name);
                data.set("file", file);
                const options = {
                    method: 'post',
                    url: "/appraisal/" + this.props.match.params['id'] + "/upload",
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
        });
    }


    render() {
        return (
            <div>
                <Row>
                    <Col xs={12}>
                        <h3>Upload files for analysis</h3>
                        <br/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={6} lg={4}>
                        <Dropzone className="card card-default p-3 upload-zone"
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
                            </div>
                        </Dropzone>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <h3>View Existing Files</h3>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default UploadFiles;
