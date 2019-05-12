import React from 'react';
import AnnotationFields from './AnnotationFields';
import AnnotationEditor from './components/AnnotationEditor';
import {Row, Col, Card, CardBody, Nav, NavItem, NavLink} from 'reactstrap';
import FileModel from "../models/FileModel";
import axios from "axios/index";


class AnnotateFile extends React.Component
{
    state = {};



    render() {

        return <Row>
            <Col xs={12}>
                <Card className="card-default">
                    <CardBody>
                        <div id={"view-lease-page"}>
                            {
                                this.props.appraisal._id && this.props.match.params.fileId ?
                                <Row>
                                    <Col xs={12}>
                                        <Card className="card-default">
                                            <CardBody>
                                                <AnnotationEditor
                                                    annotationFields={AnnotationFields}
                                                    appraisalId={this.props.appraisal._id}
                                                    fileId={this.props.match.params.fileId}
                                                />
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row> : null
                            }
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </Row>;
    }
}

export default AnnotateFile;


