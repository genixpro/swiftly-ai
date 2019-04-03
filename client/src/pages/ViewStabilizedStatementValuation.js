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


    changeIncomeItemValue(item, newValue)
    {
        const year = this.props.appraisal.incomeStatement.years[this.props.appraisal.incomeStatement.years.length - 1];
        item['yearlyAmounts'][year] = newValue;
        this.setState({appraisal: this.props.appraisal}, () => this.saveDocument(this.props.appraisal));
    }


    changeIncomeItemName(item, newName)
    {
        item['name'] = newName;
        this.setState({appraisal: this.props.appraisal}, () => this.saveDocument(this.props.appraisal));
    }


    removeIncomeItem(item, itemIndex)
    {
        if (item.cashFlowType === 'income')
        {
            this.props.appraisal.incomeStatement.incomes.splice(itemIndex, 1);
        }
        else
        {
            this.props.appraisal.incomeStatement.expenses.splice(itemIndex, 1);
        }

        this.setState({appraisal: this.props.appraisal}, () => this.saveDocument(this.props.appraisal));
    }


    renderIncomeStatementItemRow(incomeStatementItem, itemIndex)
    {
        return <tr key={itemIndex}>
            <td className={"name-column"}>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={incomeStatementItem.name}
                    onChange={(newValue) => this.changeIncomeItemName(incomeStatementItem, newValue)}
                />
            </td>
            <td className={"amount-column"}>
                <FieldDisplayEdit
                    type="currency"
                    hideIcon={true}
                    value={incomeStatementItem.yearlyAmounts[this.props.appraisal.incomeStatement.years[this.props.appraisal.incomeStatement.years.length - 1]]}
                    onChange={(newValue) => this.changeIncomeItemValue(incomeStatementItem, newValue)}
                />
            </td>
            <td className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.removeIncomeItem(incomeStatementItem, itemIndex)}
                    title={"Delete Line Item"}
                >
                    <i className="fa fa-trash-alt"></i>
                </Button>
            </td>
        </tr>
    }

    createNewIncomeItem(field, value, type)
    {
        const newItem = {
            type: type
        };

        if (field)
        {
            newItem[field] = value;
        }

        if (_.isUndefined(newItem['yearlyAmount']))
        {
            newItem['yearlyAmount'] = 0;
        }

        if (_.isUndefined(newItem['name']))
        {
            newItem['name'] = 'New Item';
        }

        if (type === 'income')
        {
            this.props.appraisal.incomeStatement.incomes.push(newItem);
        }
        else
        {
            this.props.appraisal.incomeStatement.expenses.push(newItem);
        }

        this.setState({appraisal: this.props.appraisal}, () => this.saveDocument(this.props.appraisal));

    }

    renderNewItemRow(type)
    {
        return <tr>
            <td className={"name-column"}>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewIncomeItem("name", newValue, type))}
                />
            </td>
            <td className={"amount-column"}>
                <FieldDisplayEdit
                    type="currency"
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewIncomeItem("yearlyAmount", newValue, type))}
                />
            </td>
            <td className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.createNewIncomeItem(null, null, type)}
                    title={"New Unit"}
                >
                    <i className="fa fa-plus-square"></i>
                </Button>
            </td>
        </tr>
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
                                        <td className={"amount-column"}>$1, 000</td>
                                        <td/>
                                    </tr>
                                    <tr className={"statement-sum-after-row data-row"}>
                                        <td className={"label-column"}>Recoverable Income</td>
                                        <td className={"amount-column"}>$1, 000</td>
                                        <td className={"amount-total-column"}/>
                                    </tr>
                                    <tr className={"statement-sum-row data-row"}>
                                        <td className={"label-column"}>Potential Gross Income</td>
                                        <td className={"amount-column"}>$1, 000</td>
                                        <td className={"amount-total-column"}/>
                                    </tr>
                                    <tr className={"statement-sum-after-row data-row"}>
                                        <td className={"label-column"}>Less Vacancy @ 4.0%</td>
                                        <td className={"amount-column"}>$1, 000</td>
                                        <td className={"amount-total-column"}/>
                                    </tr>
                                    <tr className={"statement-sum-row data-row"}>
                                        <td className={"label-column"}>Effective Gross Income</td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>$1, 000</td>
                                    </tr>
                                    <tr className={"title-row"}>
                                        <td className={"label-column"}><span className={"title"}>Expenses</span></td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}></td>
                                    </tr>
                                    <tr className={"data-row"}>
                                        <td className={"label-column"}>Operating Costs</td>
                                        <td className={"amount-column"}>$1, 000</td>
                                        <td className={"amount-total-column"}></td>
                                    </tr>
                                    <tr className={"data-row"}>
                                        <td className={"label-column"}>Taxes</td>
                                        <td className={"amount-column"}>$1, 000</td>
                                        <td className={"amount-total-column"}></td>
                                    </tr>
                                    <tr className={"data-row"}>
                                        <td className={"label-column"}>Management Expenses</td>
                                        <td className={"amount-column"}>$1, 000</td>
                                        <td className={"amount-total-column"}></td>
                                    </tr>
                                    <tr className={"data-row statement-sum-after-row"}>
                                        <td className={"label-column"}>Structural Allowance</td>
                                        <td className={"amount-column"}>$1, 000</td>
                                        <td className={"amount-total-column"}></td>
                                    </tr>
                                    <tr className={"data-row statement-total-sum-row"}>
                                        <td className={"label-column"}>Total Expenses</td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>$1, 000</td>
                                    </tr>

                                    <tr className={"title-row"}>
                                        <td className={"label-column"}><span className={"title"}>Net Operating Income</span></td>
                                        <td className={"amount-column"} />
                                        <td className={"amount-total-column"}>$1, 000</td>
                                    </tr>
                                    <tr className={"data-row"}>
                                        <td className={"label-column"}>NOI per square foot</td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>$5.00</td>
                                    </tr>
                                    <tr className={"data-row capitalization-row"}>
                                        <td className={"label-column"}>
                                            <span>Capitalized @</span>
                                            <FieldDisplayEdit
                                                type={"percent"}
                                                placeholder={"Capitalization Rate"}
                                                value={this.props.appraisal.capitalizationRate}
                                                onChange={() => this.changeCapitalization()}
                                            />
                                        </td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>$1, 005, 773</td>
                                    </tr>
                                    <tr className={"data-row rounding-row"}>
                                        <td className={"label-column"}>
                                            <span>Rounded</span>
                                        </td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>$1, 006, 000</td>
                                    </tr>
                                    </tbody>
                                </Table>
                                <br/>
                                <br/>
                                <h4 className={"final-valuation"}>Value by the Income Approach ... $1, 006, 000</h4>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        ];
    }
}

export default ViewStabilizedStatementValuation;
