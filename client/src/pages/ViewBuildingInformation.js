import React from 'react';
import { Row, Col, Card, CardBody, Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import FieldDisplayEdit from "./components/FieldDisplayEdit";
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import IndustrialSubtypeSelector from "./components/IndustrialSubtypeSelector";
import LandSubtypeSelector from "./components/LandSubtypeSelector";
import ZoneDescriptionEditor from "./components/ZoneDescriptionEditor";
import UploadableImageSet from "./components/UploadableImageSet";
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
                    location={this.props.appraisal.location ? {lat: () => this.props.appraisal.location.coordinates[1], lng: () => this.props.appraisal.location.coordinates[0]} : null}
                    onGeoChange={(newValue) => this.changeAppraisalField("location", {"type": "Point", "coordinates": [newValue.lng, newValue.lat]} )}
                />
            </td>
        </tr>;
    }

    downloadWordSummary()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/subject_details/word?access_token=${Auth.getAccessToken()}`;
    }

    toggleDownload()
    {
        this.setState({showBuildingInformation: !this.state.showBuildingInformation});
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
                                        <Col xs={12}>
                                            <Dropdown isOpen={this.state.showBuildingInformation} toggle={this.toggleDownload.bind(this)}>
                                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                                    Download
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {/*<DropdownItem onClick={() => this.downloadExcelSummary()}>Spreadsheet (xls)</DropdownItem>*/}
                                                    <DropdownItem onClick={() => this.downloadWordSummary()}>Subject Details (word)</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} sm={10} md={8}>
                                            <table className="table property-information-fields-table">
                                                <tbody>
                                                <tr>
                                                    <td>
                                                        <strong>Picture</strong>
                                                    </td>
                                                    <td>
                                                        <UploadableImageSet
                                                            editable={this.props.edit}
                                                            address={this.props.appraisal.address}
                                                            accessToken={Auth.getAccessToken()}
                                                            value={this.props.appraisal.imageUrls}
                                                            onChange={(newUrls) => this.changeAppraisalField('imageUrls', newUrls)}
                                                            captions={this.props.appraisal.captions}
                                                            onChangeCaptions={(newCaptions) => this.changeAppraisalField('captions', newCaptions)}
                                                        />
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
