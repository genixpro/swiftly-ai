import { reportUrl } from "@api/client";
import React from 'react';
import { Row, Col, Card, CardBody, Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import FieldDisplayEdit from "./components/FieldDisplayEdit";
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import ZoneDescriptionEditor from "./components/ZoneDescriptionEditor";
import UploadableImageSet from "./components/UploadableImageSet";
import AreaFormat from "./components/AreaFormat";
import CurrencyFormat from "./components/CurrencyFormat";
import PercentFormat from "./components/PercentFormat";
import {appraisalBuildingSize, occupancyRate} from '../domain/appraisal';
import {floorSpaceIndex, hasZoneDescription, lotSizeSquareFeet} from '../domain/generalInformation';
import type {AppraisalDTO, NamedAmountDTO} from '@api/types';
import {navigateBrowserLocation} from '../components/platform/browserActions';

interface BuildingInformationAppraisal extends AppraisalDTO {
    marketRents: NamedAmountDTO[];
    directComparisonValuation: {valuationRounded?: number | null};
    stabilizedStatement: {netOperatingIncome?: number | null; valuationRounded?: number | null; valuation?: number | null};
    stabilizedStatementInputs: {capitalizationRate?: number | null};
    occupancyRate?: number;
}

interface ViewBuildingInformationProps {
    appraisal: BuildingInformationAppraisal | null | undefined;
    edit?: boolean;
    updateAppraisal(fields: Record<string, unknown>): void;
}

interface SelectedLocation {
    lat: number;
    lng: number;
}

function ViewBuildingInformation(props: ViewBuildingInformationProps)
{
    const [showBuildingInformation, setShowBuildingInformation] = React.useState<boolean | undefined>();
    const appraisal = props.appraisal as BuildingInformationAppraisal | null | undefined;
    // Keep the pre-existing fallback for incomplete legacy-shaped objects;
    // normalized appraisals always derive these from their unit list.
    const sizeOfBuilding = appraisal ? appraisalBuildingSize(appraisal) : 0;
    const currentOccupancyRate = (appraisal?.units ? occupancyRate(appraisal) : appraisal?.occupancyRate) as number;

    function changeAppraisalField(field: string, newValue: unknown)
    {
        props.updateAppraisal({[field]: newValue});
    }

    function renderFieldRow(title: string, fieldName: string, fieldType?: string)
    {
        if (!appraisal) return null;
        const location = appraisal.location;
        return<tr>
            <td>
                <strong>{title}</strong>
            </td>
            <td>
                <FieldDisplayEdit
                    type={fieldType}
                    title={title}
                    ariaLabel={title}
                    value={appraisal[fieldName]}
                    onChange={(newValue: unknown) => changeAppraisalField(fieldName, newValue)}
                    location={location ? {lat: () => location.coordinates[1], lng: () => location.coordinates[0]} : null}
                    onGeoChange={(newValue: SelectedLocation) => changeAppraisalField("location", {"type": "Point", "coordinates": [newValue.lng, newValue.lat]} )}
                />
            </td>
        </tr>;
    }

    function downloadWordSummary()
    {
        if (appraisal) navigateBrowserLocation(reportUrl(appraisal._id, "subject_details", "word"));
    }

    function toggleDownload()
    {
        setShowBuildingInformation(open => !open);
    }

        return (
            (appraisal) ?
                <div id={"view-building-information"} className={"view-building-information"}>
                    <AppraisalContentHeader appraisal={appraisal} title="General Information" />
                    <Row>
                        <Col xs={12} md={12} lg={12} xl={12}>
                            <Card className="card-default">
                                <CardBody>
                                    <Row>
                                        <Col xs={12}>
                                            <Dropdown isOpen={showBuildingInformation} toggle={toggleDownload}>
                                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                                    Download
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {/*<DropdownItem onClick={() => this.downloadExcelSummary()}>Spreadsheet (xls)</DropdownItem>*/}
                                                    <DropdownItem onClick={downloadWordSummary}>Subject Details (word)</DropdownItem>
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
                                                            editable={props.edit}
                                                            address={appraisal.address}
                                                            value={appraisal.imageUrls}
                                                            onChange={(newUrls: string[]) => changeAppraisalField('imageUrls', newUrls)}
                                                            captions={appraisal.captions}
                                                            onChangeCaptions={(newCaptions: string[]) => changeAppraisalField('captions', newCaptions)}
                                                        />
                                                    </td>
                                                </tr>
                                                {renderFieldRow("Name", "name")}
                                                {renderFieldRow("Client", "client", "text")}
                                                {renderFieldRow("Address", "address", "address")}
                                                <tr>
                                                    <td>
                                                        <h3>Property Details</h3>
                                                    </td>
                                                    <td />
                                                </tr>

                                                {renderFieldRow("Property Type", "propertyType", "propertyType")}
                                                {renderFieldRow("Sub Type", "propertyTags", "tags")}
                                                {renderFieldRow("Tenancy Is", "tenancyType", "tenancyType")}
                                                {renderFieldRow("Lot Size", "sizeOfLand", "acres")}
                                                <tr>
                                                    <td>
                                                        <strong>Lot Size (sqft)</strong>
                                                    </td>
                                                    <td style={{"paddingLeft": "25px"}}>
                                                        <AreaFormat value={lotSizeSquareFeet(appraisal.sizeOfLand)}/>
                                                    </td>
                                                </tr>
                                                {appraisal.propertyType !== 'land' ?
                                                    <tr>
                                                        <td>
                                                            <strong>Building Size</strong>
                                                        </td>
                                                        <td style={{"paddingLeft": "25px"}}>
                                                            <AreaFormat value={sizeOfBuilding}/>
                                                        </td>
                                                    </tr> : null
                                                }
                                                {renderFieldRow("Zoning", "zoning", "zone")}
                                                {
                                                    hasZoneDescription(appraisal.zoning) ?
                                                        <tr>
                                                            <td>
                                                                <strong>Zone Description</strong>
                                                            </td>
                                                            <td>
                                                                <ZoneDescriptionEditor
                                                                    zoneId={appraisal.zoning as string}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {appraisal.propertyType === 'land' ? renderFieldRow("Buildable Area", "buildableArea", "area") : null}

                                                {appraisal.propertyType === 'land' ?<tr>
                                                    <td>
                                                        <strong>Floor Space Index</strong>
                                                    </td>
                                                    <td>
                                                        {
                                                            floorSpaceIndex(appraisal.buildableArea, appraisal.sizeOfLand)
                                                        }
                                                    </td>
                                                </tr> : null}

                                                {appraisal.propertyType === 'land' ? renderFieldRow("Buildable Units", "buildableUnits", "number") : null}

                                                {appraisal.propertyType !== 'land' ?
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
                                                                <PercentFormat value={currentOccupancyRate * 100} />
                                                            </td>
                                                        </tr>,
                                                        <tr key={3}>
                                                            <td>
                                                                <strong>Estimated Market Rent</strong>
                                                            </td>
                                                            <td style={{"paddingLeft": "25px"}}>
                                                                {
                                                                    appraisal.marketRents.map((marketRent, index) =>
                                                                    {
                                                                        return <span key={marketRent.name || index}><CurrencyFormat value={marketRent.amountPSF} cents={false} />&nbsp; - &nbsp; {marketRent.name}
                                                                            {
                                                                                index !== appraisal.marketRents.length - 1 ? <br /> : null
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
                                                                <CurrencyFormat value={appraisal.stabilizedStatement.netOperatingIncome} cents={false} />
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
                                                {renderFieldRow("Effective Date", "effectiveDate", "date")}

                                                <tr>
                                                    <td>
                                                        <strong>Direct Comparison Approach</strong>
                                                    </td>
                                                    <td style={{"paddingLeft": "25px"}}>
                                                        <CurrencyFormat value={appraisal.directComparisonValuation.valuationRounded} cents={false} />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Capitalization Approach</strong>
                                                    </td>
                                                    <td style={{"paddingLeft": "25px"}}>
                                                        <CurrencyFormat value={appraisal.stabilizedStatement.valuationRounded} cents={false} />
                                                        &nbsp;
                                                        &nbsp;
                                                        &nbsp;
                                                        (<CurrencyFormat value={(appraisal.stabilizedStatement.valuation as number) / sizeOfBuilding} cents={true} /> psf)
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Capitalization Rate</strong>
                                                    </td>
                                                    <td style={{"paddingLeft": "25px"}}>
                                                        <PercentFormat value={appraisal.stabilizedStatementInputs.capitalizationRate} />
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

export default ViewBuildingInformation;
