import React from 'react';
import {Row, Col, Card, CardBody, CardHeader, Table, Button} from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import _ from 'underscore';
import AppraisalContentHeader from "./components/AppraisalContentHeader";

class ViewExpenses extends React.Component
{
    state = {

    };

    componentDidMount()
    {
        this.computeExpenseTotals();
    }

    componentDidUpdate()
    {

    }

    computeExpenseTotals()
    {
        let expenseTotal = {};

        if (this.props.appraisal.incomeStatement.expenses)
        {
            this.props.appraisal.incomeStatement.expenses.forEach((expense) =>
            {
                for (let year of Object.keys(expense.yearlyAmounts))
                {
                    if (_.isUndefined(expenseTotal[year]))
                    {
                        expenseTotal[year] = 0;
                    }
                    expenseTotal[year] += expense.yearlyAmounts[year];
                }
            });
        }

        return expenseTotal;
    }


    changeIncomeItemValue(item, year, newValue)
    {
        item['yearlyAmounts'][year] = newValue;
        this.props.saveDocument(this.props.appraisal)
    }


    changeIncomeItemName(item, newName)
    {
        item['name'] = newName;
        this.props.saveDocument(this.props.appraisal)
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

        this.props.saveDocument(this.props.appraisal)
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
            {
                this.props.appraisal.incomeStatement.years.map((year) =>
                {
                    return <td key={year} className={"amount-column"}>
                        <FieldDisplayEdit
                            type="currency"
                            hideIcon={true}
                            value={incomeStatementItem.yearlyAmounts[year.toString()]}
                            onChange={(newValue) => this.changeIncomeItemValue(incomeStatementItem, year, newValue)}
                        />
                    </td>
                })
            }
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
            this.props.appraisal.latestIncomeStatement.incomes.push(newItem);
        }
        else
        {
            this.props.appraisal.latestIncomeStatement.expenses.push(newItem);
        }

        this.props.saveDocument(this.props.appraisal)

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
        return (
            [
                <AppraisalContentHeader appraisal={this.props.appraisal} title="Expenses"/>,
                <Row>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                {(this.props.appraisal && this.props.appraisal.incomeStatement) ?
                                    <div id={"view-expensest"} className={"view-expensest"}>
                                        <Row>
                                            <Col xs={12} md={10} lg={8} xl={6}>
                                                <Table striped bordered hover responsive>
                                                    <thead>
                                                        <tr>
                                                            <td />
                                                            {
                                                                this.props.appraisal.incomeStatement.years.map((year) =>
                                                                {
                                                                    return <td key={year} className={"amount-column"}>
                                                                        {year}
                                                                    </td>
                                                                })
                                                            }
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                    {
                                                        this.props.appraisal.incomeStatement.expenses && this.props.appraisal.incomeStatement.expenses.map((item, itemIndex) =>
                                                        {
                                                            return this.renderIncomeStatementItemRow(item, itemIndex);
                                                        })
                                                    }
                                                    {
                                                        this.props.appraisal.incomeStatement.expenses ?
                                                            this.renderNewItemRow('expense')
                                                            : null
                                                    }
                                                    <tr className={"total-row"}>
                                                        <td className={"name-column"}>
                                                            <span>Total</span>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                        <span>
                                                            $<NumberFormat value={this.state.expenseTotal}
                                                                           displayType={'text'}
                                                                           thousandSeparator={', '}
                                                                           decimalScale={2}
                                                                           fixedDecimalScale={true}/>
                                                        </span>
                                                        </td>
                                                        <td>
                                                        </td>
                                                    </tr>

                                                    </tbody>
                                                </Table>
                                            </Col>
                                        </Row>
                                    </div>
                                    : null}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            ]
        );
    }
}

export default ViewExpenses;
