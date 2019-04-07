import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Input, Col, Row} from 'reactstrap';
import Dropzone from 'react-dropzone';
import axios from "axios/index";
import Promise from "bluebird";

// import FormValidator from '../Forms/FormValidator.js';


class ClientDropBox extends Component {

    state = {
        formLogin: {
            email: '',
            password: ''
        }
    };

    onDrop(files)
    {
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
            this.props.reloadAppraisal();
            this.fileList.refresh();
        }, (err) => {
            this.setState({uploading: false});
        });
    }


    /**
     * Validate input using onChange event
     * @param  {String} formName The name of the form in the state object
     * @return {Function} a function used for the event
     */
    validateOnChange = event => {
        // const input = event.target;
        // const form = input.form
        // const value = input.type === 'checkbox' ? input.checked : input.value;
        //
        // const result = FormValidator.validate(input);
        //
        // this.setState({
        //     [form.name]: {
        //         ...this.state[form.name],
        //         [input.name]: value,
        //         errors: {
        //             ...this.state[form.name].errors,
        //             [input.name]: result
        //         }
        //     }
        // });

    }

    onSubmit = e => {
        // const form = e.target;
        // const inputs = [...form.elements].filter(i => ['INPUT', 'SELECT'].includes(i.nodeName))
        //
        // const { errors, hasError } = FormValidator.bulkValidate(inputs)
        //
        // this.setState({
        //     [form.name]: {
        //         ...this.state[form.name],
        //         errors
        //     }
        // });
        //
        // console.log(hasError ? 'Form has errors. Check!' : 'Form Submitted!')
        //
        // e.preventDefault()
    }

    /* Simplify error check */
    hasError = (formName, inputName, method) => {
        // return  this.state[formName] &&
        //     this.state[formName].errors &&
        //     this.state[formName].errors[inputName] &&
        //     this.state[formName].errors[inputName][method]
    }

    render() {
        return (
            <div className="block-center mt-4 wd-xl">
                <div className="card card-flat">
                    <div className="card-header text-center">
                        <a href="">
                            <img className="block-center rounded" src="img/test-client-logo.png" alt="Logo"/>
                        </a>
                    </div>
                    <div className="card-body">
                        <p className="text-center py-2">Please Upload Your Documents</p>

                        <Row>
                            <Col xs={12} className={"upload-zone-column"}>
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
                                </Dropzone>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className="p-3 text-center">
                    <span className="mr-2">&copy;</span>
                    <span>{new Date().getFullYear()}</span>
                    <span className="mx-2">-</span>
                    <span>Swiftly AI Inc.</span>
                </div>
            </div>
        );
    }
}

export default ClientDropBox;
