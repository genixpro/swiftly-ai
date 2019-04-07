import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';
import FieldDisplayEdit from "./components/FieldDisplayEdit";
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import PropertyTypeSelector from "./components/PropertyTypeSelector";
import IndustrialSubtypeSelector from "./components/IndustrialSubtypeSelector";
import LandSubtypeSelector from "./components/LandSubtypeSelector";
import ZoneSelector from "./components/ZoneSelector";
import ZoneDescriptionEditor from "./components/ZoneDescriptionEditor";
import UploadableImage from "./components/UploadableImage";


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

    renderFieldRow(title, fieldName, fieldType)
    {
        return<tr>
            <td>
                <strong>{title}</strong>
            </td>
            <td>
                <FieldDisplayEdit
                    type={fieldType}
                    value={this.props.appraisal[fieldName]}
                    onChange={(newValue) => this.changeAppraisalField(fieldName, newValue)}
                    onGeoChange={(newValue) => this.changeAppraisalField("location", {"type": "Point", "coordinates": [newValue.lng, newValue.lat]} )}
                />
            </td>
        </tr>;
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
                                                        <strong>Picture</strong>
                                                    </td>
                                                    <td>
                                                        {
                                                            (this.props.appraisal.address && this.props.appraisal.address !== "") ?
                                                                <UploadableImage value={`https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480&source=outdoor&location=${this.props.appraisal.address}`} />
                                                                : <UploadableImage />
                                                        }
                                                    </td>
                                                </tr>


                                                {this.renderFieldRow("Name", "name")}
                                                {this.renderFieldRow("Address", "address", "address")}
                                                {this.renderFieldRow("Property Type", "propertyType", "propertyType")}
                                                {
                                                    this.props.appraisal.propertyType === 'industrial' ?
                                                        <tr>
                                                            <td>
                                                                <strong>Sub-type</strong>
                                                            </td>
                                                            <td>
                                                                <IndustrialSubtypeSelector value={this.props.appraisal.industrialSubType}  onChange={(newValue) => this.changeAppraisalField('industrialSubType', newValue)}/>
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.propertyType === 'land' ?
                                                        <tr>
                                                            <td>
                                                                <strong>Sub-type</strong>
                                                            </td>
                                                            <td>
                                                                <LandSubtypeSelector
                                                                    value={this.props.appraisal.landSubType}
                                                                    onChange={(newValue) => this.changeAppraisalField('landSubType', newValue)}/>
                                                            </td>
                                                        </tr> : null
                                                }
                                                {this.renderFieldRow("Size of Building", "sizeOfBuilding", "number")}
                                                {this.renderFieldRow("Lot Size", "sizeOfLand", "number")}
                                                {this.renderFieldRow("Legal Description", "legalDescription")}
                                                {this.renderFieldRow("Tags", "propertyTags", "tags")}
                                                {this.renderFieldRow("Zoning", "zoning", "zone")}

                                                {
                                                    (this.props.appraisal.zoning !== '' && this.props.appraisal.zoning !== null) ?
                                                        <tr>
                                                            <td>
                                                                <strong>Zone Description</strong>
                                                            </td>
                                                            <td>
                                                                <ZoneDescriptionEditor
                                                                    zoneId={this.props.appraisal.zoning}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }

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
