import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Button, CardFooter, Collapse, CardTitle, CardHeader, Row, Col} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';
import axios from "axios/index";
import Datetime from 'react-datetime';
import PropertyTypeSelector from './PropertyTypeSelector';
import Dropzone from 'react-dropzone'
import Promise from "bluebird";

class UploadableImage extends React.Component
{
    static defaultProps = {
        editable: true
    };

    onFileUpload(files)
    {
        const file = files[0];

        const data = new FormData();
        data.set("fileName", file.name);
        data.set("file", file);
        const options = {
            method: 'post',
            url: "/images",
            data: data
        };

        const uploadPromise = axios(options);

        uploadPromise.then((response) => {
            if (this.props.onChange)
            {
                this.props.onChange(response.data.url);
            }

        }, (error) => {
            console.log(error);
            console.log(JSON.stringify(error, null, 2));
        });
    }


    render()
    {
        const editableClass = this.props.editable ? " editable" : "";

        return (
            <div className={`uploadable-image ${editableClass}`}>
                <Dropzone onDrop={acceptedFiles => this.onFileUpload(acceptedFiles)} style={{}}>
                    <div className={"uploadable-image-wrapper"}>
                        <a href="">
                            {
                                this.props.value ?
                                    <img className="img-fluid img-thumbnail" src={this.props.value} alt="Demo"/>
                                    : <img className="img-fluid img-thumbnail" src="/img/no_building_image.png" alt="Demo"/>

                            }
                        </a>
                        <div className={"upload-image-overlay"} />
                        <div className={"upload-image-icon"}>
                            <i className={"fa fa-upload"} />
                        </div>
                    </div>
                </Dropzone>
            </div>
        );
    }
}


export default UploadableImage;