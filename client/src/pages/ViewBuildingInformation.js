import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import FieldDisplayEdit from "./components/FieldDisplayEdit";
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import IndustrialSubtypeSelector from "./components/IndustrialSubtypeSelector";
import LandSubtypeSelector from "./components/LandSubtypeSelector";
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
        this.props.saveAppraisal(appraisal);
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
                                                            (this.props.appraisal.imageUrl) ?
                                                                <UploadableImage
                                                                    editable={this.props.edit}
                                                                    value={this.props.appraisal.imageUrl}
                                                                    onChange={(newUrl) => this.changeAppraisalField('imageUrl', newUrl)} />
                                                                :
                                                                    (this.props.appraisal.address && this.props.appraisal.address !== "") ?
                                                                        <UploadableImage value={`https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480&source=outdoor&location=${this.props.appraisal.address}`}
                                                                                         onChange={(newUrl) => this.changeAppraisalField('imageUrl', newUrl)}
                                                                        />
                                                                        : <UploadableImage />
                                                        }
                                                    </td>
                                                </tr>


                                                {this.renderFieldRow("Name", "name")}
                                                {this.renderFieldRow("Address", "address", "address")}
                                                {this.renderFieldRow("Effective Date", "effectiveDate", "date")}
                                                {this.renderFieldRow("Property Type", "propertyType", "propertyType")}
                                                {this.renderFieldRow("Sub Type", "propertyTags", "tags")}
                                                {this.renderFieldRow("Building Size", "sizeOfBuilding", "area")}
                                                {this.renderFieldRow("Lot Size", "sizeOfLand", "acres")}
                                                {/*{this.renderFieldRow("Legal Description", "legalDescription")}*/}
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
