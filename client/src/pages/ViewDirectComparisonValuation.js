import React from 'react';
import {Row, Col, Card, CardBody, Table, Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import NumberFormat from 'react-number-format';
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
        this.props.reloadAppraisal();
        Promise.map(this.props.appraisal.comparableSales, (comparableSaleId) =>
        {
            if (this.loadedComparables[comparableSaleId])
            {
                return this.loadedComparables[comparableSaleId];
            }
            else
            {
                return axios.get(`/comparable_sales/` + comparableSaleId).then((response) =>
                {
                    if (response.data.comparableSale)
                    {
                        this.loadedComparables[comparableSaleId] = ComparableSaleModel.create(response.data.comparableSale);
                        return this.loadedComparables[comparableSaleId];
                    }
                });
            }
        }).then((comparableSales) =>
        {
            this.setState({comparableSales: ComparableSaleModel.sortComparables(comparableSales.filter((item) => item), this.state.sort)})
        }).catch((err) =>
        {
            if (process.env.VALUATE_ENVIRONMENT.REACT_APP_DEBUG)
            {
                alert("Error: " + err.toString());
            }
        })
    }


    changeDirectComparisonInput(field, newValue)
    {
        this.props.appraisal.directComparisonInputs[field] = newValue;
        this.props.saveAppraisal(this.props.appraisal, true);
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
            this.props.saveAppraisal(this.props.appraisal, true);
        }
    }


    removeModifier(index)
    {
        this.props.appraisal.directComparisonInputs.modifiers.splice(index, 1);
        this.props.saveAppraisal(this.props.appraisal, true);
    }


    createNewModifier(field, newValue)
    {
        if (newValue)
        {
            if (!this.props.appraisal.directComparisonInputs.modifiers)
            {
                this.props.appraisal.directComparisonInputs.modifiers = [];
            }

            const object = new DirectComparisonModifier({
                name: "Modification",
                amount: 0
            });

            object[field] = newValue;

            this.props.appraisal.directComparisonInputs.modifiers.push(object);
            this.props.saveAppraisal(this.props.appraisal, true);
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


    render()
    {
        return [
            <AppraisalContentHeader appraisal={this.props.appraisal} title="Direct Comparison Valuation"/>,
            <Row className={"view-direct-comparison-valuation"}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>

                            <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggle.bind(this)}>
                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                    Download
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => this.downloadWordSummary()}>Direct Comparison Valuation Summary (docx)</DropdownItem>
                                    <DropdownItem onClick={() => this.downloadExcelSummary()}>Direct Comparison Valuation Spreadsheet (xlsx)</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>


                            <Row>
                                <Col xs={8}>
                            <div className={"stabilized-statement-centered"}>
                                <h3>Direct Comparison Valuation</h3>
                                <h4>{this.props.appraisal.address}</h4>
                                <ComparableSaleList comparableSales={this.state.comparableSales}
                                                    statsTitle={""}
                                                    statsPosition={"below"}
                                                    allowNew={false}
                                                    noCompMessage={"There are no comparables attached to this appraisal. Please go to the comparables database and select comparables from there."}
                                                    sort={this.state.sort}
                                                    onSortChanged={(newSort) => this.onSortChanged(newSort)}
                                                    history={this.props.history}
                                                    appraisal={this.props.appraisal}
                                                    appraisalId={this.props.match.params._id}
                                                    appraisalComparables={this.props.appraisal.comparableSales}
                                    // onRemoveComparableClicked={(comp) => this.removeComparableFromAppraisal(comp)}
                                    // onChange={(comps) => this.onComparablesChanged(comps)}
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
                                            <span>
                                                <NumberFormat
                                                    value={this.props.appraisal.sizeOfBuilding || 0}
                                                    displayType={'text'}
                                                    thousandSeparator={', '}
                                                    decimalScale={0}
                                                    fixedDecimalScale={true}
                                                /> sqft @ <CurrencyFormat value={this.props.appraisal.directComparisonInputs.pricePerSquareFoot}/>
                                            </span>
                                        </td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                            $<NumberFormat
                                            value={this.props.appraisal.directComparisonValuation.comparativeValue}
                                            displayType={'text'}
                                            thousandSeparator={', '}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                        />
                                        </td>
                                    </tr>

                                    {
                                        this.props.appraisal.directComparisonValuation.marketRentDifferential ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <span>Market Rent Differential, Discounted @ <PercentFormat value={this.props.appraisal.directComparisonValuationInputs.marketRentDifferentialDiscountRate}/></span>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    $<NumberFormat
                                                    value={this.props.appraisal.directComparisonValuation.marketRentDifferential}
                                                    displayType={'text'}
                                                    thousandSeparator={', '}
                                                    decimalScale={2}
                                                    fixedDecimalScale={true}
                                                />
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.props.appraisal.directComparisonValuation.freeRentDifferential ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <span>Free Rent Differential</span>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    $<NumberFormat
                                                    value={this.props.appraisal.directComparisonValuation.freeRentDifferential}
                                                    displayType={'text'}
                                                    thousandSeparator={', '}
                                                    decimalScale={2}
                                                    fixedDecimalScale={true}
                                                />
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.props.appraisal.directComparisonValuation.vacantUnitDifferential ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <span>Vacant Unit Differential</span>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    $<NumberFormat
                                                    value={this.props.appraisal.directComparisonValuation.vacantUnitDifferential}
                                                    displayType={'text'}
                                                    thousandSeparator={', '}
                                                    decimalScale={2}
                                                    fixedDecimalScale={true}
                                                />
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.props.appraisal.directComparisonValuation.amortizationDifferential ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <span>Amortized Capital Investment</span>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    $<NumberFormat
                                                    value={this.props.appraisal.directComparisonValuation.amortizationDifferential}
                                                    displayType={'text'}
                                                    thousandSeparator={', '}
                                                    decimalScale={2}
                                                    fixedDecimalScale={true}
                                                />
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.props.appraisal.directComparisonInputs.modifiers ? this.props.appraisal.directComparisonInputs.modifiers.map((modifier, index) =>
                                        {
                                            return <tr className={"data-row modifier-row"} key={index}>
                                                <td className={"label-column"}>
                                                    <span><FieldDisplayEdit
                                                        type={"text"}
                                                        placeholder={"Add/Remove ($)"}
                                                        value={modifier.name}
                                                        onChange={(newValue) => this.changeModifier(index, "name", newValue)}
                                                    /></span>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <FieldDisplayEdit
                                                        hideIcon={true}
                                                        type={"currency"}
                                                        placeholder={"Amount"}
                                                        value={modifier.amount}
                                                        onChange={(newValue) => this.changeModifier(index, "amount", newValue)}
                                                    />
                                                </td>
                                            </tr>
                                        }) : null
                                    }
                                    <tr className={"data-row"}>
                                        <td className={"label-column"}>
                                            <span><FieldDisplayEdit
                                                type={"text"}
                                                placeholder={"Add/Remove ($)"}
                                                // value={modifier.name}
                                                onChange={(newValue) => this.createNewModifier("name", newValue)}
                                            /></span>
                                        </td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                            <FieldDisplayEdit
                                                type={"currency"}
                                                placeholder={"Amount"}
                                                hideIcon={true}
                                                // value={modifier.amount}
                                                onChange={(newValue) => this.createNewModifier("amount", newValue)}
                                            />
                                        </td>
                                    </tr>

                                    <tr className={"data-row valuation-row"}>
                                        <td className={"label-column"}>
                                            <span>Valuation</span>
                                        </td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                            $<NumberFormat
                                            value={this.props.appraisal.directComparisonValuation.valuation}
                                            displayType={'text'}
                                            thousandSeparator={', '}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                        />
                                        </td>
                                    </tr>

                                    <tr className={"data-row rounding-row"}>
                                        <td className={"label-column"}>
                                            <span>Rounded</span>
                                        </td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                            $<NumberFormat
                                            value={this.props.appraisal.directComparisonValuation.valuationRounded}
                                            displayType={'text'}
                                            thousandSeparator={', '}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                        />
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
                                                    <td>Discount Rate for Market Rent Differential</td>
                                                    <td>
                                                        <FieldDisplayEdit
                                                            type={"percent"}
                                                            placeholder={"Market Rent Differential Discount Rate"}
                                                            value={this.props.appraisal.directComparisonValuationInputs ? this.props.appraisal.directComparisonValuationInputs.marketRentDifferentialDiscountRate : 5.0}
                                                            onChange={(newValue) => this.changeStabilizedInput("marketRentDifferentialDiscountRate", newValue)}
                                                        />
                                                    </td>
                                                </tr>
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
                                                </tr>
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
