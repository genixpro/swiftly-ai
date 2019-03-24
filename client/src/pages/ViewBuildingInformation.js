import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';
import FieldDisplayEdit from "./components/FieldDisplayEdit";
import AppraisalContentHeader from "./components/AppraisalContentHeader";


class ViewBuildingInformation extends React.Component
{
    state = {
        capitalizationRate: 8.4,
    };

    changeAppraisalField(field, newValue)
    {
        const appraisal = this.props.appraisal;
        appraisal[field] = newValue;
        this.props.saveDocument(appraisal);
    }

    render() {
        return (
            (this.props.appraisal) ?
                <div id={"view-building-information"} className={"view-building-information"}>
                    <AppraisalContentHeader appraisal={this.props.appraisal} title="General Information" />
                    <Row>
                        <Col xs={12} md={12} lg={12} xl={12}>
                            <Card className="card-default">
                                <CardBody>
                                    <Row>
                                        <Col xs={12} sm={10} md={8}>
                                            <table className="table property-information-fields-table">
                                                <tbody>
                                                <tr>
                                                    <td>
                                                        <strong>Name</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit value={this.props.appraisal.name} onChange={(newValue) => this.changeAppraisalField('name', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Address</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit value={this.props.appraisal.address} onChange={(newValue) => this.changeAppraisalField('address', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>City</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit value={this.props.appraisal.city} onChange={(newValue) => this.changeAppraisalField('city', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Region</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit value={this.props.appraisal.region} onChange={(newValue) => this.changeAppraisalField('region', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Country</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit value={this.props.appraisal.country} onChange={(newValue) => this.changeAppraisalField('country', newValue)}/>
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
        );
    }
}

export default ViewBuildingInformation;
