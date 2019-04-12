import React from 'react';
import {Row, Col, Card, CardBody, CardHeader, Table, Button} from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import _ from 'underscore';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import UnitsTable from "./components/UnitsTable";

class ViewStabilizedStatement extends React.Component
{
    state = {
        capitalizationRate: 8.4
    };

    componentDidUpdate()
    {

    }


    changeStabilizedInput(field, newValue)
    {
        this.props.appraisal.stabilizedStatementInputs[field] = newValue;
        this.props.saveDocument(this.props.appraisal, true);
    }


    render()
    {
        return [
            <AppraisalContentHeader appraisal={this.props.appraisal} title="Stabilized Statement Valuation"/>,
            <Row className={"view-stabilized-statement"}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
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
                                    </tr>
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
                                    </tr>
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
                                    </tr>
                                    <tr className={"data-row statement-sum-after-row"}>
                                        <td className={"label-column"}>Structural Allowance</td>
                                        <td className={"amount-column"}>
                                                $<NumberFormat
                                                value={this.props.appraisal.stabilizedStatement.structuralAllowance}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />
                                        </td>
                                        <td className={"amount-total-column"}></td>
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
