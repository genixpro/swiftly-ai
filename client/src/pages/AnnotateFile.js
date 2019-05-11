import React from 'react';
import AnnotationFields from './AnnotationFields';
import AnnotationEditor from './components/AnnotationEditor';
import {Row, Col, Card, CardBody, Nav, NavItem, NavLink} from 'reactstrap';
import FileModel from "../models/FileModel";
import axios from "axios/index";


class AnnotateFile extends React.Component
{
    state = {}

    componentDidMount() {
        axios.get(`/appraisal/${this.props.appraisal._id}/files/${this.props.match.params.fileId}`).then((response) => {
            this.setState({file: FileModel.create(response.data.file)})
        });
    }

    componentDidUpdate() {

    }

    saveFileData(newFile) {
        axios.post(`/appraisal/${this.props.appraisal._id}/files/${this.props.match.params.fileId}`, newFile).then((response) => {
            this.setState({file: newFile})
        });
    }


    render() {

        return <Row>
            <Col xs={12}>
                <Card className="card-default">
                    <CardBody>
                        <div id={"view-lease-page"}>
                            {
                                (this.state.file ? <Row>
                                    <Col xs={12}>
                                        <Card className="card-default">
                                            <CardBody>
                                                <AnnotationEditor saveFile={(doc) => this.saveFileData(doc)} document={this.state.file} annotationFields={AnnotationFields} />
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row> : null)
                            }
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </Row>;
    }
}

export default AnnotateFile;


