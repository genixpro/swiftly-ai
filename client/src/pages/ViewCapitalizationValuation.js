import React from 'react';
import {Row, Col, Card, CardBody, Table, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import NumberFormat from 'react-number-format';
import {Link} from 'react-router-dom';
import axios from "axios/index";
import FieldDisplayEdit from './components/FieldDisplayEdit';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import ComparableSaleList from "./components/ComparableSaleList";
import ComparableSaleModel from "../models/ComparableSaleModel";
import Promise from "bluebird";
import Auth from "../Auth";
import PercentFormat from "./components/PercentFormat";
import CurrencyFormat from "./components/CurrencyFormat";
import IntegerFormat from "./components/IntegerFormat";
import {StabilizedStatementModifier} from "../models/StabilizedStatementInputsModel";
import _ from "underscore";
import TotalMarketRentDifferentialCalculationPopoverWrapper from "./components/TotalMarketRentDifferentialCalculationPopoverWrapper";
import TotalRemainingFreeRentPopoverWrapper from "./components/TotalRemainingFreeRentPopoverWrapper";

class ViewCapitalizationValuation extends React.Component
{
    state = {
        capitalizationRate: 8.4,
        comparableSales: [],
        sort: "-saleDate"
    };

    loadedComparables = {};

    componentDidMount()
    {
        this.props.appraisal.loadComparableSalesCapRate().then((comparableSales) =>
        {
            this.setState({comparableSales: ComparableSaleModel.sortComparables(comparableSales.filter((item) => item), this.state.sort)})
        });
    }


    onComparablesChanged(comps)
    {
        this.setState({comparableSales: comps});
    }

    changeStabilizedInput(field, newValue)
    {
        this.props.appraisal.stabilizedStatementInputs[field] = newValue;
        this.props.saveAppraisal(this.props.appraisal);
    }


    changeStabilizedModifier(index, field, newValue)
    {
        if (field === 'amount' && newValue === null)
        {
            this.removeModifier(index);
        }
        else
        {
            this.props.appraisal.stabilizedStatementInputs.modifiers[index][field] = newValue;
            this.props.saveAppraisal(this.props.appraisal);
        }
    }


    removeModifier(index)
    {
        this.props.appraisal.stabilizedStatementInputs.modifiers.splice(index, 1);
        this.props.saveAppraisal(this.props.appraisal);
    }



    createNewModifier(field, newValue)
    {
        if (newValue)
        {
            if (!this.props.appraisal.stabilizedStatementInputs.modifiers)
            {
                this.props.appraisal.stabilizedStatementInputs.modifiers = [];
            }

            const object = StabilizedStatementModifier.create({
                name: "Modification",
                amount: 0
            }, this.props.appraisal.stabilizedStatementInputs, "modifiers");

            object[field] = newValue;

            this.props.appraisal.stabilizedStatementInputs.modifiers.push(object);
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
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/capitalization_valuation/word?access_token=${Auth.getAccessToken()}`;
    }


    downloadExcelSummary()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/capitalization_valuation/excel?access_token=${Auth.getAccessToken()}`;
    }


    render()
    {
        const popoverId = `market-rent-differential-popover`;

        let compHeaders;

        if (this.props.appraisal.propertyType === 'residential')
        {
            compHeaders = [
                ["saleDate"],
                ["address"],
                ["salePrice"],
                ["propertyType", "propertyTags"],
                ["averageMonthlyRentPerUnit", 'numberOfUnits'],
                ["noiPerUnit","noiPerBedroom"],
                ["capitalizationRate"]
            ];
        }
        else
        {
            compHeaders = [
                ["saleDate"],
                ["address"],
                ["salePrice"],
                ["propertyType", "propertyTags"],
                ["sizeSquareFootage"],
                ["netOperatingIncomePSF"],
                ["capitalizationRate"]
            ];
        }

        const compStats = [];
        compStats.push("netOperatingIncomePSF");
        compStats.push("pricePerSquareFoot");
        compStats.push("capitalizationRate");

        return [
            <AppraisalContentHeader appraisal={this.props.appraisal} title="Capitalization Approach" key={"header"}/>,
            <Row className={"view-capitalization-valuation"} key={"body"}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggle.bind(this)}>
                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                    Download
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => this.downloadWordSummary()}>Capitalization Valuation Summary (docx)</DropdownItem>
                                    <DropdownItem onClick={() => this.downloadExcelSummary()}>Capitalization Valuation Spreadshseet (xlsx)</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>

                            <Row>
                                <Col xs={12}>
                                    <div className={"stabilized-statement-centered"}>
                                        <h3>Capitalization Approach</h3>
                                        <h4>{this.props.appraisal.address}</h4>
                                        <ComparableSaleList comparableSales={this.state.comparableSales}
                                                            headers={compHeaders}
                                                            statsTitle={""}
                                                            statsPosition={"below"}
                                                            stats={compStats}
                                                            allowNew={false}
                                                            sort={this.state.sort}
                                                            noCompMessage={"There are no comparables attached to this appraisal. Please go to the comparables database and select comparables from there."}
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
                                            <tr className={"title-row"}>
                                                <td className={"label-column"}><span className={"title"}>Net Operating Income</span></td>
                                                <td className={"amount-column"} />
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.netOperatingIncome} />
                                                </td>
                                            </tr>
                                            {/*<tr className={"data-row"}>*/}
                                            {/*<td className={"label-column"}>NOI per square foot</td>*/}
                                            {/*<td className={"amount-column"}></td>*/}
                                            {/*<td className={"amount-total-column"}>todo</td>*/}
                                            {/*</tr>*/}
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <span>Capitalized @ <PercentFormat value={this.props.appraisal.stabilizedStatementInputs.capitalizationRate}/></span>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.capitalization} />
                                                </td>
                                            </tr>
                                            {
                                                this.props.appraisal.stabilizedStatement.marketRentDifferential && this.props.appraisal.stabilizedStatementInputs.applyMarketRentDifferential ?
                                                    <tr className={"data-row capitalization-row"}>
                                                        <td className={"label-column"}>
                                                            <TotalMarketRentDifferentialCalculationPopoverWrapper appraisal={this.props.appraisal}>
                                                                <span>Market Rent Differential</span>
                                                            </TotalMarketRentDifferentialCalculationPopoverWrapper>
                                                        </td>
                                                        <td className={"amount-column"} />
                                                        <td className={"amount-total-column"}>
                                                            <TotalMarketRentDifferentialCalculationPopoverWrapper appraisal={this.props.appraisal}>
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatement.marketRentDifferential} />
                                                            </TotalMarketRentDifferentialCalculationPopoverWrapper>
                                                        </td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.stabilizedStatement.freeRentRentLoss && this.props.appraisal.stabilizedStatementInputs.applyFreeRentLoss ?
                                                    <tr className={"data-row capitalization-row"}>
                                                        <td className={"label-column"}>
                                                            <TotalRemainingFreeRentPopoverWrapper appraisal={this.props.appraisal}>
                                                                <span>Remaining Free Rent</span>
                                                            </TotalRemainingFreeRentPopoverWrapper>
                                                        </td>
                                                        <td className={"amount-column"}></td>
                                                        <td className={"amount-total-column"}>
                                                            <TotalRemainingFreeRentPopoverWrapper appraisal={this.props.appraisal}>
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatement.freeRentRentLoss} />
                                                            </TotalRemainingFreeRentPopoverWrapper>
                                                        </td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.stabilizedStatement.vacantUnitLeasupCosts && this.props.appraisal.stabilizedStatementInputs.applyVacantUnitLeasingCosts ?
                                                    <tr className={"data-row capitalization-row"}>
                                                        <td className={"label-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                                                <span>Vacant Unit Leasing Costs</span>
                                                            </Link>
                                                        </td>
                                                        <td className={"amount-column"}></td>
                                                        <td className={"amount-total-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatement.vacantUnitLeasupCosts}/>
                                                            </Link>
                                                        </td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.stabilizedStatement.vacantUnitRentLoss && this.props.appraisal.stabilizedStatementInputs.applyVacantUnitRentLoss ?
                                                    <tr className={"data-row capitalization-row"}>
                                                        <td className={"label-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                                                <span>Vacant Unit Rent Loss</span>
                                                            </Link>
                                                        </td>
                                                        <td className={"amount-column"}></td>
                                                        <td className={"amount-total-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatement.vacantUnitRentLoss}/>
                                                            </Link>
                                                        </td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.stabilizedStatement.amortizedCapitalInvestment && this.props.appraisal.stabilizedStatementInputs.applyAmortization ?
                                                    <tr className={"data-row capitalization-row"}>
                                                        <td className={"label-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/tenants/amortization`}>
                                                                <span>Amortized Capital Investment</span>
                                                            </Link>
                                                        </td>
                                                        <td className={"amount-column"}></td>
                                                        <td className={"amount-total-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/tenants/amortization`}>
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatement.amortizedCapitalInvestment} />
                                                            </Link>
                                                        </td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.stabilizedStatementInputs.modifiers ? this.props.appraisal.stabilizedStatementInputs.modifiers.map((modifier, index) =>
                                                {
                                                    return <tr className={"data-row modifier-row"} key={index}>
                                                        <td className={"label-column"}>
                                                            <span><FieldDisplayEdit
                                                                type={"text"}
                                                                placeholder={"Add/Remove ($)"}
                                                                value={modifier.name}
                                                                onChange={(newValue) => this.changeStabilizedModifier(index, "name", newValue)}
                                                            /></span>
                                                        </td>
                                                        <td className={"amount-column"}></td>
                                                        <td className={"amount-total-column"}>
                                                            <FieldDisplayEdit
                                                                hideIcon={true}
                                                                type={"currency"}
                                                                placeholder={"Amount"}
                                                                value={modifier.amount}
                                                                onChange={(newValue) => this.changeStabilizedModifier(index, "amount", newValue)}
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
                                            <tr className={"data-row rounding-row"}>
                                                <td className={"label-column"}>
                                                    <span>Estimated Value</span>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.valuation} />
                                                </td>
                                            </tr>
                                            <tr className={"data-row rounding-row"}>
                                                <td className={"label-column"}>
                                                    <span>Rounded</span>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.valuationRounded} />
                                                </td>
                                            </tr>
                                            </tbody>
                                        </Table>
                                        <br/>
                                        <br/>
                                        <h4 className={"final-valuation"}>Value by the Overall Capitalization Rate Method ... $<NumberFormat
                                            value={this.props.appraisal.stabilizedStatement.valuationRounded}
                                            displayType={'text'}
                                            thousandSeparator={', '}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                        />
                                        </h4>
                                    </div>
                                </Col>
                                <Col xs={4}>
                                    <Card className={"capitalization-valuation-inputs"} outline>
                                        <CardBody>
                                            <h3>Inputs</h3>

                                            <Table>
                                                <tbody>
                                                <tr>
                                                </tr>
                                                <tr>
                                                    <td>Capitalization Rate</td>
                                                    <td>
                                                        <FieldDisplayEdit
                                                            type={"percent"}
                                                            placeholder={"Capitalization Rate"}
                                                            value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.capitalizationRate : 5.0}
                                                            onChange={(newValue) => this.changeStabilizedInput("capitalizationRate", newValue)}
                                                        />
                                                    </td>
                                                </tr>
                                                {
                                                    this.props.appraisal.stabilizedStatement.marketRentDifferential ?
                                                        <tr>
                                                            <td>Market Rent Differential</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"boolean"}
                                                                    placeholder={"Apply Market Rent Differential"}
                                                                    hideIcon={true}
                                                                    value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.applyMarketRentDifferential : null}
                                                                    onChange={(newValue) => this.changeStabilizedInput("applyMarketRentDifferential", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.stabilizedStatement.vacantUnitLeasupCosts ?
                                                        <tr>
                                                            <td>Vacant Unit Leasing Costs</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"boolean"}
                                                                    placeholder={"Apply Vacant Unit Leasing Costs"}
                                                                    hideIcon={true}
                                                                    value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.applyVacantUnitLeasingCosts : null}
                                                                    onChange={(newValue) => this.changeStabilizedInput("applyVacantUnitLeasingCosts", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }

                                                {
                                                    this.props.appraisal.stabilizedStatement.vacantUnitRentLoss ?
                                                        <tr>
                                                            <td>Vacant Unit Rent Loss</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"boolean"}
                                                                    placeholder={"Apply Vacant Unit Rent Loss"}
                                                                    hideIcon={true}
                                                                    value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.applyVacantUnitRentLoss : null}
                                                                    onChange={(newValue) => this.changeStabilizedInput("applyVacantUnitLeasingCosts", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }

                                                {
                                                    this.props.appraisal.stabilizedStatement.freeRentRentLoss ?
                                                        <tr>
                                                            <td>Free Rent Loss</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"boolean"}
                                                                    placeholder={"Apply Free Rent Loss"}
                                                                    hideIcon={true}
                                                                    value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.applyFreeRentLoss : null}
                                                                    onChange={(newValue) => this.changeStabilizedInput("applyVacantUnitLeasingCosts", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.stabilizedStatement.amortizedCapitalInvestment ?
                                                        <tr>
                                                            <td>Amortization Adjustment</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"boolean"}
                                                                    placeholder={"Apply Amortization Adjustment"}
                                                                    hideIcon={true}
                                                                    value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.applyAmortization : null}
                                                                    onChange={(newValue) => this.changeStabilizedInput("applyVacantUnitLeasingCosts", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                </tbody>
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

export default ViewCapitalizationValuation;
