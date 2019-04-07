import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Button, CardFooter, Collapse, CardTitle, CardHeader, Row, Col} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';
import axios from "axios/index";
import Datetime from 'react-datetime';
import PropertyTypeSelector from './PropertyTypeSelector';

class UploadableImage extends React.Component
{
    render()
    {
        return (
            <div className={`uploadable-image`}>
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
            </div>
        );
    }
}


export default UploadableImage;