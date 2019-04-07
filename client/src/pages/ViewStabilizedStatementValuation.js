import React from 'react';
import {Row, Col, Card, CardBody, CardHeader, Table, Button} from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import _ from 'underscore';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import UnitsTable from "./components/UnitsTable";

class ViewStabilizedStatementValuation extends React.Component
{
    state = {
        capitalizationRate: 8.4
    };

    componentDidUpdate()
    {

    }

    computeGroupTotals()
    {
        if (!this.props.appraisal.incomeStatement)
        {
            return
        }

        const year = this.props.appraisal.incomeStatement.years[this.props.appraisal.incomeStatement.years.length - 1];

        let incomeTotal = 0;
        let expenseTotal = 0;

        if (this.props.appraisal.incomeStatement.incomes)
        {
            this.props.appraisal.incomeStatement.incomes.forEach((income) =>
            {
                incomeTotal += income.yearlyAmounts[year];
            });
        }

        if (this.props.appraisal.incomeStatement.expenses)
        {
            this.props.appraisal.incomeStatement.expenses.forEach((expense) =>
            {
                expenseTotal += expense.yearlyAmounts[year];
            });
        }

        let operatingIncome = incomeTotal - expenseTotal;
        let valuation = operatingIncome / (this.state.capitalizationRate / 100.0);
        this.setState({incomeTotal, expenseTotal, operatingIncome, valuation});
    }

    saveDocument(newAppraisal)
    {
        axios.post(`/appraisal/${this.props.match.params.id}`, newAppraisal).then((response) =>
        {
            // this.setState({financialStatement: newLease})
        });
    }

    changeCapitalization(newValue)
    {
        this.setState({capitalizationRate: newValue}, () => this.computeGroupTotals());
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
                                    {/*<tr className={"data-row"}>*/}
                                        {/*<td className={"label-column"}>NOI per square foot</td>*/}
                                        {/*<td className={"amount-column"}></td>*/}
                                        {/*<td className={"amount-total-column"}>todo</td>*/}
                                    {/*</tr>*/}
                                    <tr className={"data-row capitalization-row"}>
                                        <td className={"label-column"}>
                                            <span>Capitalized @</span>
                                            <FieldDisplayEdit
                                                type={"percent"}
                                                placeholder={"Capitalization Rate"}
                                                value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.capitalizationRate : 5.0}
                                                onChange={(newValue) => this.changeStabilizedInput("capitalizationRate", newValue)}
                                            />
                                        </td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                                $<NumberFormat
                                                value={this.props.appraisal.stabilizedStatement.valuation}
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
                                                value={this.props.appraisal.stabilizedStatement.valuationRounded}
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
                                <h4 className={"final-valuation"}>Value by the Income Approach ... $<NumberFormat
                                        value={this.props.appraisal.stabilizedStatement.valuationRounded}
                                        displayType={'text'}
                                        thousandSeparator={', '}
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                    />
                                </h4>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        ];
    }
}

export default ViewStabilizedStatementValuation;
