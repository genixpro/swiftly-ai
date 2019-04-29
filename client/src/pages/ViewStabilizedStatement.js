import React from 'react';
import {Row, Col, Card, CardBody, Table, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Popover, PopoverHeader, PopoverBody} from 'reactstrap';
import NumberFormat from 'react-number-format';
import {Link} from 'react-router-dom';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import UnitsTable from "./components/UnitsTable";
import AreaFormat from "./components/AreaFormat";
import Auth from "../Auth";
import PercentFormat from "./components/PercentFormat";
import CurrencyFormat from "./components/CurrencyFormat";
import StructuralAllowanceCalculationPopoverWrapper from "./components/StructuralAllowanceCalculationPopoverWrapper";

class ViewStabilizedStatement extends React.Component
{
    state = {
        capitalizationRate: 8.4
    };

    componentDidMount()
    {

    }


    changeStabilizedInput(field, newValue)
    {
        this.props.appraisal.stabilizedStatementInputs[field] = newValue;
        this.props.saveAppraisal(this.props.appraisal);
    }


    changeManagementExpenseCalculationRuleField(field, newValue)
    {
        this.props.appraisal.stabilizedStatementInputs.managementExpenseCalculationRule[field] = newValue;
        this.props.saveAppraisal(this.props.appraisal);
    }


    toggle()
    {
        this.setState({downloadDropdownOpen: !this.state.downloadDropdownOpen})
    }


    downloadWordSummary()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/stabilized_statement/word?access_token=${Auth.getAccessToken()}`;
    }


    downloadExcelSummary()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/stabilized_statement/excel?access_token=${Auth.getAccessToken()}`;
    }

    onUnitClicked(unit, unitIndex)
    {
        this.props.history.push(`/appraisal/${this.props.appraisal._id}/tenants/rent_roll?unit=${unitIndex}`)
    }


    render()
    {
        return [
            <AppraisalContentHeader appraisal={this.props.appraisal} title="Stabilized Statement Valuation"/>,
            <Row className={"view-stabilized-statement"}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggle.bind(this)}>
                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                    Download
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => this.downloadWordSummary()}>Stabilized Statement Summary (docx)</DropdownItem>
                                    <DropdownItem onClick={() => this.downloadExcelSummary()}>Stabilized Statement Spreadsheet (xlsx)</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>

                            <Row>
                                <Col xs={8}>
                                    <div className={"stabilized-statement-centered"}>
                                        <h3>Stabilized Income & Expense Statement</h3>
                                        <h4>{this.props.appraisal.address}</h4>
                                        <UnitsTable
                                            appraisal={this.props.appraisal}
                                            showStabilizedStats={true}
                                            allowSelection={false}
                                            allowNewUnit={false}
                                            statsMode={"total"}
                                            onUnitClicked={(unit, unitIndex) => this.onUnitClicked(unit, unitIndex)}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={8}>
                                    <div className={"stabilized-statement-centered"}>
                                        <br/>
                                        <Table className={"statement-table"}>
                                            <tbody>
                                            <tr className={"title-row"}>
                                                <td className={"label-column"}><span className={"title"}>Revenue</span></td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}/>
                                            </tr>
                                            <tr className={"data-row"}>
                                                <td className={"label-column"}><Link to={`/appraisal/${this.props.appraisal._id}/tenants/rent_roll`}>Stabilized Rental Income</Link></td>
                                                <td className={"amount-column"}>
                                                    <Link to={`/appraisal/${this.props.appraisal._id}/tenants/rent_roll`}><CurrencyFormat value={this.props.appraisal.stabilizedStatement.rentalIncome}/></Link>
                                                </td>
                                                <td/>
                                            </tr>
                                            {
                                                this.props.appraisal.stabilizedStatement.additionalIncome ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}><Link to={`/appraisal/${this.props.appraisal._id}/additional_income`}>Additional Income</Link></td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/additional_income`}><CurrencyFormat value={this.props.appraisal.stabilizedStatement.additionalIncome} /></Link>
                                                        </td>
                                                        <td className={"amount-total-column"}/>
                                                    </tr> : null
                                            }
                                            <tr className={"statement-sum-after-row data-row"}>
                                                <td className={"label-column"}>
                                                    <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>Recoverable Income</Link>
                                                </td>
                                                <td className={"amount-column"}>
                                                    <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}><CurrencyFormat value={this.props.appraisal.stabilizedStatement.recoverableIncome}/></Link>
                                                </td>
                                                <td className={"amount-total-column"}/>
                                            </tr>
                                            <tr className={"statement-sum-row data-row"}>
                                                <td className={"label-column"}>Potential Gross Income</td>
                                                <td className={"amount-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.potentialGrossIncome}/>
                                                </td>
                                                <td className={"amount-total-column"}/>
                                            </tr>
                                            <tr className={"statement-sum-after-row data-row vacancy-row"}>
                                                <td className={"label-column"}>
                                                    <span>Less Vacancy @ <PercentFormat value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.vacancyRate : 5.0}/></span>
                                                </td>
                                                <td className={"amount-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.vacancyDeduction}/>
                                                </td>
                                                <td className={"amount-total-column"}/>
                                            </tr>
                                            <tr className={"statement-sum-row data-row"}>
                                                <td className={"label-column"}>Effective Gross Income</td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.effectiveGrossIncome}/>
                                                </td>
                                            </tr>
                                            <tr className={"title-row"}>
                                                <td className={"label-column"}><span className={"title"}>Expenses</span></td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}></td>
                                            </tr>
                                            {
                                                this.props.appraisal.stabilizedStatement.operatingExpenses ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}><Link to={`/appraisal/${this.props.appraisal._id}/expenses`}>Operating Costs</Link></td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/expenses`}><CurrencyFormat value={this.props.appraisal.stabilizedStatement.operatingExpenses}/></Link>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.stabilizedStatement.taxes ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}><Link to={`/appraisal/${this.props.appraisal._id}/expenses`}>Taxes</Link></td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/expenses`}><CurrencyFormat value={this.props.appraisal.stabilizedStatement.taxes}/></Link>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.stabilizedStatement.managementExpenses ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}><Link to={`/appraisal/${this.props.appraisal._id}/expenses`}>
                                                            {
                                                                this.props.appraisal.stabilizedStatementInputs.managementExpenseMode === 'combined_structural_rule' ?
                                                                    <span>Structural & Mgmt</span> : <span>Management Expenses</span>
                                                            }</Link></td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/expenses`}><CurrencyFormat value={this.props.appraisal.stabilizedStatement.managementExpenses}/></Link>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.stabilizedStatement.tmiTotal ?
                                                    <tr className={"data-row vacancy-row"}>
                                                        <td className={"label-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/expenses_tmi`}>
                                                                <span>TMI</span>&nbsp;
                                                                <AreaFormat spaces={false} value={this.props.appraisal.sizeOfBuilding}/>&nbsp;@&nbsp;
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatementInputs.tmiRatePSF}/>
                                                            </Link>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/expenses_tmi`}>
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatement.tmiTotal}/>
                                                            </Link>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.stabilizedStatement.structuralAllowance ?
                                                    <tr className={"statement-sum-after-row data-row vacancy-row"}>
                                                        <td className={"label-column"}>
                                                            <StructuralAllowanceCalculationPopoverWrapper appraisal={this.props.appraisal}>
                                                                <span>Structural Allowance @ <PercentFormat value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.structuralAllowancePercent : 2.0}/></span>
                                                            </StructuralAllowanceCalculationPopoverWrapper>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <StructuralAllowanceCalculationPopoverWrapper appraisal={this.props.appraisal}>
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatement.structuralAllowance}/>
                                                            </StructuralAllowanceCalculationPopoverWrapper>
                                                        </td>
                                                        <td className={"amount-total-column"}/>
                                                    </tr> : null
                                            }
                                            <tr className={"data-row statement-total-sum-row"}>
                                                <td className={"label-column"}>Total Expenses</td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.totalExpenses}/>
                                                </td>
                                            </tr>

                                            <tr className={"title-row"}>
                                                <td className={"label-column"}><span className={"title"}>Net Operating Income</span></td>
                                                <td className={"amount-column"} />
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.netOperatingIncome}/>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                </Col>
                                <Col xs={4}>
                                    <Card className={"stabilized-statement-inputs"} outline>
                                        <CardBody>
                                            <h3>Inputs</h3>

                                            <Table>
                                                <tr>
                                                    <td>Vacancy Rate</td>
                                                    <td>
                                                        <FieldDisplayEdit
                                                            type={"percent"}
                                                            placeholder={"Vacancy Rate"}
                                                            value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.vacancyRate : 5.0}
                                                            onChange={(newValue) => this.changeStabilizedInput("vacancyRate", newValue)}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Management Expense Mode</td>
                                                    <td>
                                                        <FieldDisplayEdit
                                                            type={"managementExpenseMode"}
                                                            placeholder={"Management Expense Mode"}
                                                            value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.managementExpenseMode : null}
                                                            onChange={(newValue) => this.changeStabilizedInput("managementExpenseMode", newValue)}
                                                        />
                                                    </td>
                                                </tr>
                                                {
                                                    this.props.appraisal.stabilizedStatementInputs.managementExpenseMode === 'rule' || this.props.appraisal.stabilizedStatementInputs.managementExpenseMode === 'combined_structural_rule' ?
                                                        <tr>
                                                            <td>
                                                                <span>Management Expense Calculation</span>
                                                            </td>
                                                            <td className={"management-expense-rule"}>
                                                                <FieldDisplayEdit
                                                                    type={"percent"}
                                                                    placeholder={"Percent Of"}
                                                                    hideIcon={true}
                                                                    value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.percentage : null}
                                                                    onChange={(newValue) => this.changeManagementExpenseCalculationRuleField("percentage", newValue)}
                                                                />
                                                                <span className={"spacer"}>of</span>
                                                                <FieldDisplayEdit
                                                                    type="calculationField"
                                                                    expenses={this.props.appraisal.incomeStatement.expenses}
                                                                    placeholder={"Expense Calculation Field"}
                                                                    value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.field : null}
                                                                    hideIcon={true}
                                                                    onChange={(newValue) => this.changeManagementExpenseCalculationRuleField('field', newValue)}
                                                                />
                                                            </td>
                                                        </tr>
                                                        : null
                                                }
                                                {
                                                    this.props.appraisal.stabilizedStatementInputs.managementExpenseMode === 'rule' ?
                                                        <tr>
                                                            <td>Structural Allowance</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"percent"}
                                                                    placeholder={"Structural Allowance Rate"}
                                                                    value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.structuralAllowancePercent : 2.0}
                                                                    onChange={(newValue) => this.changeStabilizedInput("structuralAllowancePercent", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.stabilizedStatementInputs.expensesMode === 'tmi'  ?
                                                        <tr className={"data-row vacancy-row"}>
                                                            <td>
                                                                <span>TMI (psf)</span>&nbsp;

                                                            </td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"currency"}
                                                                    placeholder={"TMI Rate (psf)"}
                                                                    value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.tmiRatePSF : 0}
                                                                    onChange={(newValue) => this.changeStabilizedInput("tmiRatePSF", newValue)}
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

export default ViewStabilizedStatement;
