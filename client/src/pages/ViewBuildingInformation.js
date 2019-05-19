import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import FieldDisplayEdit from "./components/FieldDisplayEdit";
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import IndustrialSubtypeSelector from "./components/IndustrialSubtypeSelector";
import LandSubtypeSelector from "./components/LandSubtypeSelector";
import ZoneDescriptionEditor from "./components/ZoneDescriptionEditor";
import UploadableImage from "./components/UploadableImage";
import AreaFormat from "./components/AreaFormat";
import CurrencyFormat from "./components/CurrencyFormat";
import PercentFormat from "./components/PercentFormat";
import Auth from "../Auth";


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
                                                                    value={this.props.appraisal.imageUrl + `?access_token=${Auth.getAccessToken()}`}
                                                                    onChange={(newUrl) => this.changeAppraisalField('imageUrl', newUrl)} />
                                                                :
                                                                    (this.props.appraisal.address && this.props.appraisal.address !== "") ?
                                                                        <UploadableImage value={`https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480&source=outdoor&location=${this.props.appraisal.address}`}
                                                                                         onChange={(newUrl) => this.changeAppraisalField('imageUrl', newUrl)}
                                                                        />
                                                                        : <UploadableImage onChange={(newUrl) => this.changeAppraisalField('imageUrl', newUrl)} />
                                                        }
                                                    </td>
                                                </tr>
                                                {this.renderFieldRow("Name", "name")}
                                                {this.renderFieldRow("Client", "client", "text")}
                                                {this.renderFieldRow("Address", "address", "address")}
                                                <tr>
                                                    <td>
                                                        <h3>Property Details</h3>
                                                    </td>
                                                    <td />
                                                </tr>

                                                {this.renderFieldRow("Property Type", "propertyType", "propertyType")}
                                                {this.renderFieldRow("Sub Type", "propertyTags", "tags")}
                                                {this.renderFieldRow("Tenancy Is", "tenancyType", "tenancyType")}
                                                {this.renderFieldRow("Lot Size", "sizeOfLand", "acres")}
                                                <tr>
                                                    <td>
                                                        <strong>Lot Size (sqft)</strong>
                                                    </td>
                                                    <td style={{"paddingLeft": "25px"}}>
                                                        <AreaFormat value={this.props.appraisal.sizeOfLand *43560}/>
                                                    </td>
                                                </tr>
                                                {this.props.appraisal.propertyType !== 'land' ?
                                                    <tr>
                                                        <td>
                                                            <strong>Building Size</strong>
                                                        </td>
                                                        <td style={{"paddingLeft": "25px"}}>
                                                            <AreaFormat value={this.props.appraisal.sizeOfBuilding}/>
                                                        </td>
                                                    </tr> : null
                                                }
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
                                                {this.props.appraisal.propertyType === 'land' ? this.renderFieldRow("Buildable Area", "buildableArea", "area") : null}

                                                {this.props.appraisal.propertyType === 'land' ?<tr>
                                                    <td>
                                                        <strong>Floor Space Index</strong>
                                                    </td>
                                                    <td>
                                                        {
                                                            (this.props.appraisal.buildableArea / (this.props.appraisal.sizeOfLand * 43560.0)).toFixed(1)
                                                        }
                                                    </td>
                                                </tr> : null}

                                                {this.props.appraisal.propertyType === 'land' ? this.renderFieldRow("Buildable Units", "buildableUnits", "number") : null}

                                                {this.props.appraisal.propertyType !== 'land' ?
                                                    [
                                                        <tr key={1}>
                                                            <td>
                                                                <h3>Income Information</h3>
                                                            </td>
                                                            <td />
                                                        </tr>,
                                                        <tr key={2}>
                                                            <td>
                                                                <strong>Occupancy</strong>
                                                            </td>
                                                            <td style={{"paddingLeft": "25px"}}>
                                                                <PercentFormat value={this.props.appraisal.occupancyRate * 100} />
                                                            </td>
                                                        </tr>,
                                                        <tr key={3}>
                                                            <td>
                                                                <strong>Estimated Market Rent</strong>
                                                            </td>
                                                            <td style={{"paddingLeft": "25px"}}>
                                                                {
                                                                    this.props.appraisal.marketRents.map((marketRent, index) =>
                                                                    {
                                                                        return <span><CurrencyFormat value={marketRent.amountPSF} cents={false} />&nbsp; - &nbsp; {marketRent.name}
                                                                            {
                                                                                index !== this.props.appraisal.marketRents.length - 1 ? <br /> : null
                                                                            }
                                                                        </span>;
                                                                    })
                                                                }
                                                            </td>
                                                        </tr>,
                                                        <tr key={4}>
                                                            <td>
                                                                <strong>Stabilized NOI</strong>
                                                            </td>
                                                            <td style={{"paddingLeft": "25px"}}>
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatement.netOperatingIncome} cents={false} />
                                                            </td>
                                                        </tr>
                                                    ] : null
                                                }
                                                <tr>
                                                    <td>
                                                        <h3>Appraisal Details</h3>
                                                    </td>
                                                    <td />
                                                </tr>
                                                {this.renderFieldRow("Effective Date", "effectiveDate", "date")}

                                                <tr>
                                                    <td>
                                                        <strong>Direct Comparison Approach</strong>
                                                    </td>
                                                    <td style={{"paddingLeft": "25px"}}>
                                                        <CurrencyFormat value={this.props.appraisal.directComparisonValuation.valuationRounded} cents={false} />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Capitalization Approach</strong>
                                                    </td>
                                                    <td style={{"paddingLeft": "25px"}}>
                                                        <CurrencyFormat value={this.props.appraisal.stabilizedStatement.valuationRounded} cents={false} />
                                                        &nbsp;
                                                        &nbsp;
                                                        &nbsp;
                                                        (<CurrencyFormat value={this.props.appraisal.stabilizedStatement.valuation / this.props.appraisal.sizeOfBuilding} cents={true} /> psf)
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Capitalization Rate</strong>
                                                    </td>
                                                    <td style={{"paddingLeft": "25px"}}>
                                                        <PercentFormat value={this.props.appraisal.stabilizedStatementInputs.capitalizationRate} cents={false} />
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
