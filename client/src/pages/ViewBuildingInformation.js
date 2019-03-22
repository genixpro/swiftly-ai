import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';
import FieldDisplayEdit from "./components/FieldDisplayEdit";


class ViewBuildingInformation extends React.Component
{
    state = {
        capitalizationRate: 8.4,
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.match.params.id}`).then((response) =>
        {
            this.setState({appraisal: response.data.appraisal})
        });
    }

    changeAppraisalField(field, newValue)
    {
        this.state.appraisal[field] = newValue;
        this.setState({appraisal: this.state.appraisal});
        this.saveDocument(this.state.appraisal);
    }

    saveDocument(newAppraisal)
    {
        axios.post(`/appraisal/${this.props.match.params.id}`, newAppraisal).then((response) =>
        {
            this.setState({appraisal: response.data.appraisal})
        });
    }

    render() {
        return (
            <Row>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            {(this.state.appraisal) ?
                                <div id={"view-building-information"} className={"view-building-information"}>
                                    <Row>
                                        <Col xs={12} md={12} lg={12} xl={12}>
                                            <Card outline color="primary" className="mb-3">
                                                <CardHeader className="text-white bg-primary">General Information</CardHeader>
                                                <CardBody>
                                                    <Row>
                                                        <Col xs={12} sm={10} md={8}>
                                                            <table className="table">
                                                                <tbody>
                                                                <tr>
                                                                    <td>
                                                                        <strong>Name</strong>
                                                                    </td>
                                                                    <td>
                                                                        <FieldDisplayEdit value={this.state.appraisal.name} onChange={(newValue) => this.changeAppraisalField('name', newValue)}/>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <strong>Address</strong>
                                                                    </td>
                                                                    <td>
                                                                        <FieldDisplayEdit value={this.state.appraisal.address} onChange={(newValue) => this.changeAppraisalField('address', newValue)}/>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <strong>City</strong>
                                                                    </td>
                                                                    <td>
                                                                        <FieldDisplayEdit value={this.state.appraisal.city} onChange={(newValue) => this.changeAppraisalField('city', newValue)}/>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <strong>Region</strong>
                                                                    </td>
                                                                    <td>
                                                                        <FieldDisplayEdit value={this.state.appraisal.region} onChange={(newValue) => this.changeAppraisalField('region', newValue)}/>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <strong>Country</strong>
                                                                    </td>
                                                                    <td>
                                                                        <FieldDisplayEdit value={this.state.appraisal.country} onChange={(newValue) => this.changeAppraisalField('country', newValue)}/>
                                                                    </td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </Col>
                                                    </Row>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div> : null
                            }
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default ViewBuildingInformation;
