import React from 'react';
import {Row, Col, Card, CardBody, Table, Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import NumberFormat from 'react-number-format';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import UnitsTable from "./components/UnitsTable";
import AreaFormat from "./components/AreaFormat";
import Auth from "../Auth";

class ViewStabilizedStatement extends React.Component
{
    state = {
        capitalizationRate: 8.4
    };

    componentDidMount()
    {
        this.props.reloadAppraisal();
    }


    changeStabilizedInput(field, newValue)
    {
        this.props.appraisal.stabilizedStatementInputs[field] = newValue;
        this.props.saveAppraisal(this.props.appraisal, true);
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
                            <div className={"stabilized-statement-centered"}>

                                <h3>Stabilized Income & Expense Statement</h3>
                                <h4>{this.props.appraisal.address}</h4>
                                <UnitsTable
                                    appraisal={this.props.appraisal}
                                    allowSelection={false}
                                    allowNewUnit={false}
                                    statsMode={"total"}
                                />
                                <br/>
                                <Table className={"statement-table "}>
                                    <tbody>
                                    <tr className={"title-row"}>
                                        <td className={"label-column"}><span className={"title"}>Revenue</span></td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}/>
                                    </tr>
                                    <tr className={"data-row"}>
                                        <td className={"label-column"}>Stabilized Rental Income</td>
                                        <td className={"amount-column"}>
                                            $<NumberFormat
                                                value={this.props.appraisal.stabilizedStatement.rentalIncome}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />
                                        </td>
                                        <td/>
                                    </tr>
                                    <tr className={"data-row"}>
                                        <td className={"label-column"}>Additional Income</td>
                                        <td className={"amount-column"}>
                                            $<NumberFormat
                                            value={this.props.appraisal.stabilizedStatement.additionalIncome}
                                            displayType={'text'}
                                            thousandSeparator={', '}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                        />
                                        </td>
                                        <td className={"amount-total-column"}/>
                                    </tr>
                                    <tr className={"statement-sum-after-row data-row"}>
                                        <td className={"label-column"}>Recoverable Income</td>
                                        <td className={"amount-column"}>
                                                $<NumberFormat
                                                value={this.props.appraisal.stabilizedStatement.recoverableIncome}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />
                                        </td>
                                        <td className={"amount-total-column"}/>
                                    </tr>
                                    <tr className={"statement-sum-row data-row"}>
                                        <td className={"label-column"}>Potential Gross Income</td>
                                        <td className={"amount-column"}>
                                                $<NumberFormat
                                                value={this.props.appraisal.stabilizedStatement.potentialGrossIncome}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />
                                        </td>
                                        <td className={"amount-total-column"}/>
                                    </tr>
                                    <tr className={"statement-sum-after-row data-row vacancy-row"}>
                                        <td className={"label-column"}>
                                            <span>Less Vacancy @</span>
                                            <FieldDisplayEdit
                                                type={"percent"}
                                                placeholder={"Vacancy Rate"}
                                                value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.vacancyRate : 5.0}
                                                onChange={(newValue) => this.changeStabilizedInput("vacancyRate", newValue)}
                                            />
                                        </td>
                                        <td className={"amount-column"}>
                                                $<NumberFormat
                                                value={this.props.appraisal.stabilizedStatement.vacancyDeduction}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />
                                        </td>
                                        <td className={"amount-total-column"}/>
                                    </tr>
                                    <tr className={"statement-sum-row data-row"}>
                                        <td className={"label-column"}>Effective Gross Income</td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                                $<NumberFormat
                                                value={this.props.appraisal.stabilizedStatement.effectiveGrossIncome}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />
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
                                                <td className={"label-column"}>Operating Costs</td>
                                                <td className={"amount-column"}>
                                                    $<NumberFormat
                                                    value={this.props.appraisal.stabilizedStatement.operatingExpenses}
                                                    displayType={'text'}
                                                    thousandSeparator={', '}
                                                    decimalScale={2}
                                                    fixedDecimalScale={true}
                                                />
                                                </td>
                                                <td className={"amount-total-column"}></td>
                                            </tr> : null
                                    }
                                    {
                                        this.props.appraisal.stabilizedStatement.taxes ?
                                            <tr className={"data-row"}>
                                                <td className={"label-column"}>Taxes</td>
                                                <td className={"amount-column"}>
                                                    $<NumberFormat
                                                    value={this.props.appraisal.stabilizedStatement.taxes}
                                                    displayType={'text'}
                                                    thousandSeparator={', '}
                                                    decimalScale={2}
                                                    fixedDecimalScale={true}
                                                />
                                                </td>
                                                <td className={"amount-total-column"}></td>
                                            </tr> : null
                                    }
                                    {
                                        this.props.appraisal.stabilizedStatement.managementExpenses ?
                                            <tr className={"data-row"}>
                                                <td className={"label-column"}>Management Expenses</td>
                                                <td className={"amount-column"}>
                                                    $<NumberFormat
                                                    value={this.props.appraisal.stabilizedStatement.managementExpenses}
                                                    displayType={'text'}
                                                    thousandSeparator={', '}
                                                    decimalScale={2}
                                                    fixedDecimalScale={true}
                                                />
                                                </td>
                                                <td className={"amount-total-column"}></td>
                                            </tr> : null
                                    }
                                    {
                                        this.props.appraisal.stabilizedStatement.tmiTotal ?
                                            <tr className={"data-row vacancy-row"}>
                                                <td className={"label-column"}>
                                                    <span>TMI</span>&nbsp;
                                                    <AreaFormat spaces={false} value={this.props.appraisal.sizeOfBuilding}/>&nbsp;@
                                                    <FieldDisplayEdit
                                                        type={"currency"}
                                                        placeholder={"TMI Rate (psf)"}
                                                        value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.tmiRatePSF : 0}
                                                        onChange={(newValue) => this.changeStabilizedInput("tmiRatePSF", newValue)}
                                                    />
                                                </td>
                                                <td className={"amount-column"}>
                                                    $<NumberFormat
                                                    value={this.props.appraisal.stabilizedStatement.tmiTotal}
                                                    displayType={'text'}
                                                    thousandSeparator={', '}
                                                    decimalScale={2}
                                                    fixedDecimalScale={true}
                                                />
                                                </td>
                                                <td className={"amount-total-column"}></td>
                                            </tr> : null
                                    }
                                    <tr className={"statement-sum-after-row data-row vacancy-row"}>
                                        <td className={"label-column"}>
                                            <span>Structural Allowance @</span>
                                            <FieldDisplayEdit
                                                type={"percent"}
                                                placeholder={"Structural Allowance Rate"}
                                                value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.structuralAllowancePercent : 2.0}
                                                onChange={(newValue) => this.changeStabilizedInput("structuralAllowancePercent", newValue)}
                                            />
                                        </td>
                                        <td className={"amount-column"}>
                                            $<NumberFormat
                                            value={this.props.appraisal.stabilizedStatement.structuralAllowance}
                                            displayType={'text'}
                                            thousandSeparator={', '}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                        />
                                        </td>
                                        <td className={"amount-total-column"}/>
                                    </tr>
                                    <tr className={"data-row statement-total-sum-row"}>
                                        <td className={"label-column"}>Total Expenses</td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                                $<NumberFormat
                                                value={this.props.appraisal.stabilizedStatement.totalExpenses}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />
                                        </td>
                                    </tr>

                                    <tr className={"title-row"}>
                                        <td className={"label-column"}><span className={"title"}>Net Operating Income</span></td>
                                        <td className={"amount-column"} />
                                        <td className={"amount-total-column"}>
                                                $<NumberFormat
                                                value={this.props.appraisal.stabilizedStatement.netOperatingIncome}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />
                                        </td>
                                    </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        ];
    }
}

export default ViewStabilizedStatement;
