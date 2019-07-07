import React from 'react';
import {Row, Col, Card, CardBody, Table, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import NumberFormat from 'react-number-format';
import {Link} from "react-router-dom"
import axios from "axios/index";
import FieldDisplayEdit from './components/FieldDisplayEdit';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import ComparableSaleList from "./components/ComparableSaleList";
import ComparableSaleModel from "../models/ComparableSaleModel";
import Promise from "bluebird";
import {DirectComparisonModifier} from "../models/DirectComparisonInputsModel";
import Auth from "../Auth";
import PercentFormat from "./components/PercentFormat";
import CurrencyFormat from "./components/CurrencyFormat";
import IntegerFormat from "./components/IntegerFormat";
import FloatFormat from "./components/FloatFormat";
import TotalRemainingFreeRentPopoverWrapper from "./components/TotalRemainingFreeRentPopoverWrapper";
import TotalMarketRentDifferentialCalculationPopoverWrapper from "./components/TotalMarketRentDifferentialCalculationPopoverWrapper";

class ViewDirectComparisonValuation extends React.Component
{
    state = {
        capitalizationRate: 8.4,
        comparableSales: [],
        sort: "-saleDate"
    };

    loadedComparables = {};

    componentDidMount()
    {
        this.props.appraisal.loadComparableSalesDCA().then((comparableSales) =>
        {
            this.setState({comparableSales: ComparableSaleModel.sortComparables(comparableSales.filter((item) => item), this.state.sort)})
        });
    }


    onComparablesChanged(comps)
    {
        this.setState({comparableSales: comps});
    }


    changeDirectComparisonInput(field, newValue)
    {
        this.props.appraisal.directComparisonInputs[field] = newValue;
        this.props.saveAppraisal(this.props.appraisal);
    }


    changeStabilizedInput(field, newValue)
    {
        this.props.appraisal.stabilizedStatementInputs[field] = newValue;
        this.props.saveAppraisal(this.props.appraisal);
    }


    changeModifier(index, field, newValue)
    {
        if (field === 'amount' && newValue === null)
        {
            this.removeModifier(index);
        }
        else
        {
            this.props.appraisal.directComparisonInputs.modifiers[index][field] = newValue;
            this.props.saveAppraisal(this.props.appraisal);
        }
    }


    removeModifier(index)
    {
        this.props.appraisal.directComparisonInputs.modifiers.splice(index, 1);
        this.props.saveAppraisal(this.props.appraisal);
    }


    createNewModifier(field, newValue)
    {
        if (newValue)
        {
            if (!this.props.appraisal.directComparisonInputs.modifiers)
            {
                this.props.appraisal.directComparisonInputs.modifiers = [];
            }

            const object = DirectComparisonModifier.create({
                name: "New Adjustment",
                amount: 0
            }, this.props.appraisal.directComparisonInputs, "modifiers");

            object[field] = newValue;

            this.props.appraisal.directComparisonInputs.modifiers.push(object);
            this.props.saveAppraisal(this.props.appraisal);
        }
    }

    onSortChanged(newSort)
    {
        this.setState({
            sort: newSort,
            comparableSales: ComparableSaleModel.sortComparables(this.state.comparableSales, newSort)
        })
    }


    toggle()
    {
        this.setState({downloadDropdownOpen: !this.state.downloadDropdownOpen})
    }


    downloadWordSummary()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/direct_comparison_valuation/word?access_token=${Auth.getAccessToken()}`;
    }


    downloadExcelSummary()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/direct_comparison_valuation/excel?access_token=${Auth.getAccessToken()}`;
    }


    changeDirectComparisonNOIMultiple(newValue)
    {
        this.props.appraisal.directComparisonInputs["noiPSFMultiple"] = newValue;
        this.props.appraisal.directComparisonInputs["noiPSFPricePerSquareFoot"] = (this.props.appraisal.stabilizedStatement.netOperatingIncome / this.props.appraisal.sizeOfBuilding) * newValue;

        this.props.saveAppraisal(this.props.appraisal);
    }


    changeDirectComparisonPricePerSquareFootMultiple(newValue)
    {
        this.props.appraisal.directComparisonInputs["noiPSFMultiple"] = newValue / (this.props.appraisal.stabilizedStatement.netOperatingIncome / this.props.appraisal.sizeOfBuilding);
        this.props.appraisal.directComparisonInputs["noiPSFPricePerSquareFoot"] = newValue;

        this.props.saveAppraisal(this.props.appraisal);
    }


    render()
    {
        const compHeaders = [
            ["saleDate"],
            ["address"]
        ];

        const compStats = [];

        if (this.props.appraisal.directComparisonInputs.directComparisonMetric !== "noi_multiple")
        {
            compHeaders.push(["salePrice"]);
            compStats.push(["salePrice"]);
        }
        else
        {
            compHeaders.push(["salePrice"]);
            compStats.push(["pricePerSquareFoot"]);
        }

        if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "psf")
        {
            compHeaders.push(["sizeSquareFootage", "siteCoverage"]);
            compStats.push(["sizeSquareFootage"]);
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "noi_multiple")
        {
            compHeaders.push(["sizeSquareFootage", "occupancyRate"]);
            compHeaders.push(["pricePerSquareFoot"]);
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "psf_land")
        {
            compHeaders.push(["propertyType", "propertyTags"]);
            compHeaders.push(["sizeOfLandSqft"]);
            compStats.push(["sizeOfLandSqft"]);
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "per_acre_land")
        {
            compHeaders.push(["propertyType", "propertyTags"]);
            compHeaders.push(["sizeOfLandAcres"]);
            compStats.push(["sizeOfLandAcres"]);
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "psf_buildable_area")
        {
            compHeaders.push(["sizeOfBuildableAreaSqft", "sizeOfLandSqft"]);
            compHeaders.push(["floorSpaceIndex"]);
            compStats.push(["sizeOfBuildableAreaSqft"]);
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "per_buildable_unit")
        {
            compHeaders.push(["sizeOfBuildableAreaSqft", "sizeOfLandSqft", "buildableUnits"]);
            compStats.push(["buildableUnits"]);
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "per_unit")
        {
            compHeaders.push(["numberOfUnits", "totalBedrooms"]);
        }
        else
        {
            compHeaders.push(["sizeSquareFootage"]);
            compStats.push(["sizeSquareFootage"]);
        }

        if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "psf")
        {
            compHeaders.push(["pricePerSquareFoot"]);
            compStats.push(["pricePerSquareFoot"]);
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "noi_multiple")
        {
            compHeaders.push(["displayNetOperatingIncomePSF"]);
            compHeaders.push(["displayNOIPSFMultiple"]);
            compStats.push(["displayNetOperatingIncomePSF"]);
            compStats.push(["displayNOIPSFMultiple"]);
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "psf_land")
        {
            compHeaders.push(["pricePerSquareFootLand"]);
            compStats.push(["pricePerSquareFootLand"]);
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "per_acre_land")
        {
            compHeaders.push(["pricePerAcreLand"]);
            compStats.push(["pricePerAcreLand"]);
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "psf_buildable_area")
        {
            compHeaders.push(["pricePerSquareFootBuildableArea", "pricePerSquareFootLand"]);
            compStats.push(["pricePerSquareFootBuildableArea"]);
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "per_buildable_unit")
        {
            compHeaders.push(["pricePerSquareFootBuildableArea", "pricePerSquareFootLand", "pricePerBuildableUnit"]);
            compStats.push(["pricePerBuildableUnit"]);
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === "per_unit")
        {
            compHeaders.push(["displayNOIPerUnit", "displayNOIPerBedroom"]);
            compHeaders.push(["pricePerUnit", "pricePerBedroom"]);
            compStats.push(["pricePerUnit"]);
        }
        else
        {
            compHeaders.push(["pricePerSquareFoot"]);
            compStats.push(["pricePerSquareFoot"]);
        }

        return [
            <AppraisalContentHeader appraisal={this.props.appraisal} title="Direct Comparison Approach"/>,
            <Row className={"view-direct-comparison-valuation"}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>

                            <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggle.bind(this)}>
                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                    Download
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => this.downloadWordSummary()}>Direct Comparison Approach Summary (docx)</DropdownItem>
                                    <DropdownItem onClick={() => this.downloadExcelSummary()}>Direct Comparison Approach Spreadsheet (xlsx)</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>


                            <Row>
                                <Col xs={12}>
                            <div className={"stabilized-statement-centered"}>
                                <h3>Direct Comparison Approach</h3>
                                <h4>{this.props.appraisal.address}</h4>
                                <ComparableSaleList comparableSales={this.state.comparableSales}
                                                    statsTitle={""}
                                                    statsPosition={"below"}
                                                    allowNew={false}
                                                    headers={compHeaders}
                                                    stats={compStats}
                                                    noCompMessage={"There are no comparables attached to this appraisal. Please go to the comparables database and select comparables from there."}
                                                    sort={this.state.sort}
                                                    onSortChanged={(newSort) => this.onSortChanged(newSort)}
                                                    history={this.props.history}
                                                    appraisal={this.props.appraisal}
                                                    appraisalId={this.props.match.params._id}
                                                    appraisalComparables={this.props.appraisal.comparableSales}
                                                    onChange={(comps) => this.onComparablesChanged(comps)}
                                />
                            </div>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={8}>
                                    <div className={"stabilized-statement-centered"}>
                                <h3>Valuation</h3>
                                <Table className={"statement-table "}>
                                    <tbody>
                                    {/*<tr className={"data-row"}>*/}
                                    {/*<td className={"label-column"}>NOI per square foot</td>*/}
                                    {/*<td className={"amount-column"}></td>*/}
                                    {/*<td className={"amount-total-column"}>todo</td>*/}
                                    {/*</tr>*/}
                                    <tr className={"data-row capitalization-row"}>
                                        <td className={"label-column"}>
                                            {
                                                !this.props.appraisal.directComparisonInputs.directComparisonMetric  ?
                                                    <span>No Comparison Metric Selected</span> : null
                                            }
                                            {
                                                this.props.appraisal.directComparisonInputs.directComparisonMetric === 'psf' ?
                                                    <span>
                                                                <NumberFormat
                                                                    value={this.props.appraisal.sizeOfBuilding || 0}
                                                                    displayType={'text'}
                                                                    thousandSeparator={', '}
                                                                    decimalScale={0}
                                                                    fixedDecimalScale={true}
                                                                /> sqft @ <CurrencyFormat value={this.props.appraisal.directComparisonInputs.pricePerSquareFoot} />
                                                            </span> : null
                                            }
                                            {
                                                this.props.appraisal.directComparisonInputs.directComparisonMetric === 'noi_multiple' ?
                                                    <span>
                                                                <NumberFormat
                                                                    value={this.props.appraisal.sizeOfBuilding || 0}
                                                                    displayType={'text'}
                                                                    thousandSeparator={', '}
                                                                    decimalScale={0}
                                                                    fixedDecimalScale={true}
                                                                /> sqft @ <CurrencyFormat value={this.props.appraisal.directComparisonInputs.noiPSFPricePerSquareFoot}/>
                                                    </span> : null
                                            }
                                            {
                                                this.props.appraisal.directComparisonInputs.directComparisonMetric === 'psf_land' ?
                                                            <span>
                                                                <NumberFormat
                                                                    value={this.props.appraisal.sizeOfLand * 43560 || 0}
                                                                    displayType={'text'}
                                                                    thousandSeparator={', '}
                                                                    decimalScale={0}
                                                                    fixedDecimalScale={true}
                                                                /> sqft @ <CurrencyFormat value={this.props.appraisal.directComparisonInputs.pricePerSquareFootLand}/>
                                                            </span> : null
                                            }
                                            {
                                                this.props.appraisal.directComparisonInputs.directComparisonMetric === 'per_acre_land' ?
                                                            <span>
                                                                <NumberFormat
                                                                    value={this.props.appraisal.sizeOfLand || 0}
                                                                    displayType={'text'}
                                                                    thousandSeparator={', '}
                                                                    decimalScale={0}
                                                                    fixedDecimalScale={true}
                                                                /> acres @ <CurrencyFormat value={this.props.appraisal.directComparisonInputs.pricePerAcreLand}/>
                                                            </span> : null
                                            }
                                            {
                                                this.props.appraisal.directComparisonInputs.directComparisonMetric === 'psf_buildable_area' ?
                                                            <span>
                                                                <NumberFormat
                                                                    value={this.props.appraisal.buildableArea || 0}
                                                                    displayType={'text'}
                                                                    thousandSeparator={', '}
                                                                    decimalScale={0}
                                                                    fixedDecimalScale={true}
                                                                /> psf @ <CurrencyFormat value={this.props.appraisal.directComparisonInputs.pricePerSquareFootBuildableArea}/>
                                                            </span> : null
                                            }
                                            {
                                                this.props.appraisal.directComparisonInputs.directComparisonMetric === 'per_buildable_unit' ?
                                                            <span>
                                                                <NumberFormat
                                                                    value={this.props.appraisal.buildableUnits || 0}
                                                                    displayType={'text'}
                                                                    thousandSeparator={', '}
                                                                    decimalScale={0}
                                                                    fixedDecimalScale={true}
                                                                /> units @ <CurrencyFormat value={this.props.appraisal.directComparisonInputs.pricePerBuildableUnit}/>
                                                            </span> : null
                                            }
                                        </td>

                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                            <CurrencyFormat value={this.props.appraisal.directComparisonValuation.comparativeValue}/>
                                        </td>
                                    </tr>

                                    {
                                        this.props.appraisal.directComparisonValuation.marketRentDifferential && this.props.appraisal.directComparisonInputs.applyMarketRentDifferential ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <TotalMarketRentDifferentialCalculationPopoverWrapper appraisal={this.props.appraisal}>
                                                        <span>Market Rent Differential</span>
                                                    </TotalMarketRentDifferentialCalculationPopoverWrapper>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <TotalMarketRentDifferentialCalculationPopoverWrapper appraisal={this.props.appraisal}>
                                                        <CurrencyFormat value={this.props.appraisal.directComparisonValuation.marketRentDifferential} />
                                                    </TotalMarketRentDifferentialCalculationPopoverWrapper>
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.props.appraisal.directComparisonValuation.freeRentRentLoss && this.props.appraisal.directComparisonInputs.applyFreeRentLoss ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <TotalRemainingFreeRentPopoverWrapper appraisal={this.props.appraisal}>
                                                        <span>Remaining Free Rent</span>
                                                    </TotalRemainingFreeRentPopoverWrapper>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <TotalRemainingFreeRentPopoverWrapper appraisal={this.props.appraisal}>
                                                        <CurrencyFormat value={this.props.appraisal.directComparisonValuation.freeRentRentLoss} />
                                                    </TotalRemainingFreeRentPopoverWrapper>
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.props.appraisal.directComparisonValuation.vacantUnitLeasupCosts && this.props.appraisal.directComparisonInputs.applyVacantUnitLeasingCosts ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                                        <span>Vacant Unit Leasing Costs</span>
                                                    </Link>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                                        <CurrencyFormat value={this.props.appraisal.directComparisonValuation.vacantUnitLeasupCosts} />
                                                    </Link>
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.props.appraisal.directComparisonValuation.vacantUnitRentLoss && this.props.appraisal.directComparisonInputs.applyVacantUnitRentLoss ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                                        <span>Vacant Unit Gross Rent Loss</span>
                                                    </Link>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                                        <CurrencyFormat value={this.props.appraisal.directComparisonValuation.vacantUnitRentLoss} />
                                                    </Link>
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.props.appraisal.directComparisonValuation.amortizedCapitalInvestment && this.props.appraisal.directComparisonInputs.applyAmortization ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <Link to={`/appraisal/${this.props.appraisal._id}/tenants/amortization`}>
                                                        <span>Amortized Capital Investment</span>
                                                    </Link>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <Link to={`/appraisal/${this.props.appraisal._id}/tenants/amortization`}>
                                                        <CurrencyFormat value={this.props.appraisal.directComparisonValuation.amortizedCapitalInvestment} />
                                                    </Link>
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        (this.props.appraisal.directComparisonInputs.modifiers || []).map((modifier, index) =>
                                        {
                                            return <tr className={"data-row modifier-row"} key={index}>
                                                <td className={"label-column"}>
                                                    <span><FieldDisplayEdit
                                                        type={"text"}
                                                        placeholder={"Add/Remove"}
                                                        value={modifier.name}
                                                        onChange={(newValue) => this.changeModifier(index, "name", newValue)}
                                                    /></span>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <FieldDisplayEdit
                                                        hideIcon={true}
                                                        type={"currency"}
                                                        placeholder={"Amount ($)"}
                                                        value={modifier.amount}
                                                        onChange={(newValue) => this.changeModifier(index, "amount", newValue)}
                                                    />
                                                </td>
                                            </tr>
                                        }).concat([
                                            <tr className={"data-row modifier-row"} key={(this.props.appraisal.directComparisonInputs.modifiers || []).length}>
                                                <td className={"label-column"}>
                                            <span><FieldDisplayEdit
                                                type={"text"}
                                                placeholder={"Add/Remove"}
                                                // value={modifier.name}
                                                onChange={(newValue) => this.createNewModifier("name", newValue)}
                                            /></span>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <FieldDisplayEdit
                                                        type={"currency"}
                                                        placeholder={"Amount ($)"}
                                                        hideIcon={true}
                                                        // value={modifier.amount}
                                                        onChange={(newValue) => this.createNewModifier("amount", newValue)}
                                                    />
                                                </td>
                                            </tr>
                                        ])
                                    }

                                    <tr className={"data-row valuation-row"}>
                                        <td className={"label-column"}>
                                            <span>Valuation</span>
                                        </td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                            <CurrencyFormat value={this.props.appraisal.directComparisonValuation.valuation} />
                                        </td>
                                    </tr>

                                    <tr className={"data-row rounding-row"}>
                                        <td className={"label-column"}>
                                            <span>Rounded</span>
                                        </td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                            <CurrencyFormat value={this.props.appraisal.directComparisonValuation.valuationRounded}/>
                                        </td>
                                    </tr>
                                    </tbody>
                                </Table>
                                <br/>
                                <br/>
                                <h4 className={"final-valuation"}>Value by the Direct Comparison Approach ... $<NumberFormat
                                    value={this.props.appraisal.directComparisonValuation.valuationRounded}
                                    displayType={'text'}
                                    thousandSeparator={', '}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                />
                                </h4>
                            </div>
                                </Col>
                                <Col xs={4}>
                                    <Card className={"direct-comparison-valuation-inputs"} outline>
                                        <CardBody>
                                            <h3>Inputs</h3>

                                            <Table>
                                                <tr>
                                                    <td>Comparison Metric</td>
                                                    <td>
                                                        <FieldDisplayEdit
                                                            type={"directComparisonMetric"}
                                                            placeholder={"The metric used for comparing the building."}
                                                            value={this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.directComparisonMetric : 'psf'}
                                                            onChange={(newValue) => this.changeDirectComparisonInput("directComparisonMetric", newValue)}
                                                        />
                                                    </td>
                                                </tr>
                                                {
                                                    this.props.appraisal.directComparisonInputs.directComparisonMetric === 'psf' ?
                                                        <tr>
                                                            <td>Price Per Square Foot</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"currency"}
                                                                    placeholder={"Price Per Square Foot"}
                                                                    value={this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.pricePerSquareFoot : null}
                                                                    onChange={(newValue) => this.changeDirectComparisonInput("pricePerSquareFoot", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.directComparisonInputs.directComparisonMetric === 'noi_multiple' ?
                                                        <tr>
                                                            <td>NOI Multiple</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"float"}
                                                                    placeholder={"NOI Multiple"}
                                                                    value={this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.noiPSFMultiple : null}
                                                                    onChange={(newValue) => this.changeDirectComparisonNOIMultiple(newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.directComparisonInputs.directComparisonMetric === 'noi_multiple' ?
                                                        <tr>
                                                            <td>Price Per Square Foot</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"currency"}
                                                                    placeholder={"Price Per Square Foot"}
                                                                    value={this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.noiPSFPricePerSquareFoot : null}
                                                                    onChange={(newValue) => this.changeDirectComparisonPricePerSquareFootMultiple(newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.directComparisonInputs.directComparisonMetric === 'psf_land' ?
                                                        <tr>
                                                            <td>Price Per Square Foot of Land</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"currency"}
                                                                    placeholder={"Price Per Square Foot of Land"}
                                                                    value={this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.pricePerSquareFootLand : null}
                                                                    onChange={(newValue) => this.changeDirectComparisonInput("pricePerSquareFootLand", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.directComparisonInputs.directComparisonMetric === 'per_acre_land' ?
                                                        <tr>
                                                            <td>Price Per Acre of Land</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"currency"}
                                                                    placeholder={"Price Per Acre of Land"}
                                                                    value={this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.pricePerAcreLand : null}
                                                                    onChange={(newValue) => this.changeDirectComparisonInput("pricePerAcreLand", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.directComparisonInputs.directComparisonMetric === 'psf_buildable_area' ?
                                                        <tr>
                                                            <td>Price Per Square Foot of Buildable Area</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"currency"}
                                                                    placeholder={"Price Per Square Foot of Buildable Area"}
                                                                    value={this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.pricePerSquareFootBuildableArea : null}
                                                                    onChange={(newValue) => this.changeDirectComparisonInput("pricePerSquareFootBuildableArea", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.directComparisonInputs.directComparisonMetric === 'per_buildable_unit' ?
                                                        <tr>
                                                            <td>Price Per Buildable Unit</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"currency"}
                                                                    placeholder={"Price Per Buildable Unit"}
                                                                    value={this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.pricePerBuildableUnit : null}
                                                                    onChange={(newValue) => this.changeDirectComparisonInput("pricePerBuildableUnit", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.directComparisonValuation.marketRentDifferential ?
                                                        <tr>
                                                            <td>Market Rent Differential</td>
                                                            <td className={"apply-adjustment-column"}>
                                                                <FieldDisplayEdit
                                                                    type={"boolean"}
                                                                    placeholder={"Apply Market Rent Differential"}
                                                                    hideIcon={true}
                                                                    value={this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.applyMarketRentDifferential : null}
                                                                    onChange={(newValue) => this.changeDirectComparisonInput("applyMarketRentDifferential", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.directComparisonValuation.vacantUnitLeasupCosts ?
                                                        <tr>
                                                            <td>Vacant Unit Leasing Costs</td>
                                                            <td className={"apply-adjustment-column"}>
                                                                <FieldDisplayEdit
                                                                    type={"boolean"}
                                                                    placeholder={"Apply Vacant Unit Leasing Costs"}
                                                                    hideIcon={true}
                                                                    value={this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.applyVacantUnitLeasingCosts : null}
                                                                    onChange={(newValue) => this.changeDirectComparisonInput("applyVacantUnitLeasingCosts", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }

                                                {
                                                    this.props.appraisal.directComparisonValuation.vacantUnitRentLoss ?
                                                        <tr>
                                                            <td>Vacant Unit Rent Loss</td>
                                                            <td className={"apply-adjustment-column"}>
                                                                <FieldDisplayEdit
                                                                    type={"boolean"}
                                                                    placeholder={"Apply Vacant Unit Rent Loss"}
                                                                    hideIcon={true}
                                                                    value={this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.applyVacantUnitRentLoss : null}
                                                                    onChange={(newValue) => this.changeDirectComparisonInput("applyVacantUnitLeasingCosts", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }

                                                {
                                                    this.props.appraisal.directComparisonValuation.freeRentRentLoss ?
                                                        <tr>
                                                            <td>Free Rent Loss</td>
                                                            <td className={"apply-adjustment-column"}>
                                                                <FieldDisplayEdit
                                                                    type={"boolean"}
                                                                    placeholder={"Apply Free Rent Loss"}
                                                                    hideIcon={true}
                                                                    value={this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.applyFreeRentLoss : null}
                                                                    onChange={(newValue) => this.changeDirectComparisonInput("applyVacantUnitLeasingCosts", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.directComparisonValuation.amortizedCapitalInvestment ?
                                                        <tr>
                                                            <td>Amortization Adjustment</td>
                                                            <td className={"apply-adjustment-column"}>
                                                                <FieldDisplayEdit
                                                                    type={"boolean"}
                                                                    placeholder={"Apply Amortization Adjustment"}
                                                                    hideIcon={true}
                                                                    value={this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.applyAmortization : null}
                                                                    onChange={(newValue) => this.changeDirectComparisonInput("applyVacantUnitLeasingCosts", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }

                                            </Table>

                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        ];
    }
}

export default ViewDirectComparisonValuation;
