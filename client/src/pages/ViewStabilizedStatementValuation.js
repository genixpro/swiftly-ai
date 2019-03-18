import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table, Button } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import _ from 'underscore';

class ViewStabilizedStatementValuation extends React.Component
{
    state = {
        capitalizationRate: 8.4
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.match.params.id}`).then((response) =>
        {
            this.setState({appraisal: response.data.appraisal}, () => this.computeGroupTotals())
        });
    }

    componentDidUpdate()
    {

    }

    computeGroupTotals()
    {
        if (!this.state.appraisal.incomeStatement)
        {
            return
        }

        let incomeTotal = 0;
        let expenseTotal = 0;

        if (this.state.appraisal.incomeStatement.incomes)
        {
            this.state.appraisal.incomeStatement.incomes.forEach((income) =>
            {
                incomeTotal += income.yearlyAmount;
            });
        }

        if (this.state.appraisal.incomeStatement.expenses)
        {
            this.state.appraisal.incomeStatement.expenses.forEach((expense) =>
            {
                expenseTotal += expense.yearlyAmount;
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

    changeCapitalization(evt)
    {
        const newValue = evt.target.value;
        this.setState({capitalizationRate: newValue}, () => this.computeGroupTotals());
    }


    changeIncomeItemValue(item, newValue)
    {
        item['yearlyAmount'] = newValue;
        item['monthlyAmount'] = newValue / 12.0;
        this.setState({appraisal: this.state.appraisal}, () => this.saveDocument(this.state.appraisal));
    }


    changeIncomeItemName(item, newName)
    {
        item['name'] = newName;
        this.setState({appraisal: this.state.appraisal}, () => this.saveDocument(this.state.appraisal));
    }


    removeIncomeItem(item, itemIndex)
    {
        if (item.type === 'income')
        {
            this.state.appraisal.incomeStatement.incomes.splice(itemIndex, 1);
        }
        else
        {
            this.state.appraisal.incomeStatement.expenses.splice(itemIndex, 1);
        }

        this.setState({appraisal: this.state.appraisal}, () => this.saveDocument(this.state.appraisal));
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
                    value={incomeStatementItem.yearlyAmount}
                    onChange={(newValue) => this.changeIncomeItemValue(incomeStatementItem, newValue)}
                />
            </td>
            <td className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.removeIncomeItem(incomeStatementItem, itemIndex)}
                    title={"Delete Line Item"}
                >
                    <i className="fa fa-minus-square"></i>
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
            this.state.appraisal.incomeStatement.incomes.push(newItem);
        }
        else
        {
            this.state.appraisal.incomeStatement.expenses.push(newItem);
        }

        this.setState({appraisal: this.state.appraisal}, () => this.saveDocument(this.state.appraisal));

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



    render() {
        return (
             (this.state.appraisal && this.state.appraisal.incomeStatement) ?
                    <div id={"view-stabilized-statement"} className={"view-stabilized-statement"}>
                        <Row>
                            <Col xs={12} md={10} lg={8} xl={6}>
                                <Card outline color="primary" className="mb-3">
                                    <CardHeader className="text-white bg-primary">Income</CardHeader>
                                    <CardBody>
                                        <Table striped bordered hover responsive>
                                            <tbody>
                                            {
                                                this.state.appraisal.incomeStatement.incomes && this.state.appraisal.incomeStatement.incomes.map((item, itemIndex) => {
                                                    return this.renderIncomeStatementItemRow(item, itemIndex);
                                                })
                                            }
                                            {
                                                this.state.appraisal.incomeStatement.incomes ?
                                                    this.renderNewItemRow('income')
                                                    : null
                                            }
                                            <tr className={"total-row"}>
                                                <td className={"name-column"}>
                                                    <span>Total</span>
                                                </td>
                                                <td className={"amount-column"}>
                                                    <span>
                                                        $<NumberFormat
                                                            value={this.state.incomeTotal}
                                                            displayType={'text'}
                                                            thousandSeparator={', '}
                                                            decimalScale={2}
                                                            fixedDecimalScale={true}
                                                        />
                                                    </span>
                                                </td>
                                                <td>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </Table>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={10} lg={8} xl={6}>
                                <Card outline color="primary" className="mb-3">
                                    <CardHeader className="text-white bg-primary">Expenses</CardHeader>
                                    <CardBody>
                                        <Table striped bordered hover responsive>
                                            <tbody>
                                            {
                                                this.state.appraisal.incomeStatement.expenses && this.state.appraisal.incomeStatement.expenses.map((item, itemIndex) => {
                                                    return this.renderIncomeStatementItemRow(item, itemIndex);
                                                })
                                            }
                                            {
                                                this.state.appraisal.incomeStatement.expenses ?
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
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={10} lg={8} xl={6}>
                                <Card outline color="primary" className="mb-3">
                                    <CardHeader className="text-white bg-primary">Total</CardHeader>
                                    <CardBody>
                                        <Table striped bordered hover responsive>
                                            <tbody>
                                                <tr>
                                                    <td className={"name-column"}>
                                                        <span>Total Income</span>
                                                    </td>
                                                    <td className={"amount-column"}>
                                                            <span>
                                                                $<NumberFormat value={this.state.incomeTotal}
                                                                              displayType={'text'}
                                                                              thousandSeparator={', '}
                                                                              decimalScale={2}
                                                                              fixedDecimalScale={true}/>
                                                            </span>
                                                    </td>
                                                    <td>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className={"name-column"}>
                                                        <span>Total Expenses</span>
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
                                                <tr>
                                                    <td className={"name-column"}>
                                                        <span>Operating Income</span>
                                                    </td>
                                                    <td className={"amount-column"}>
                                                            <span>
                                                                $<NumberFormat value={this.state.operatingIncome}
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
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={10} lg={8} xl={6}>
                                <Card outline color="primary" className="mb-3">
                                    <CardHeader className="text-white bg-primary">Valuation</CardHeader>
                                    <CardBody>
                                        <Table striped bordered hover responsive>
                                            <tbody>
                                            <tr>
                                                <td className={"name-column"}>
                                                    <span>Capitalization Rate</span>
                                                </td>
                                                <td className={"amount-column"}>
                                                    <span>
                                                        <input
                                                            type="number"
                                                            value={this.state.capitalizationRate}
                                                            onChange={this.changeCapitalization.bind(this)}
                                                            min={0.1}
                                                            step={0.1}
                                                        />
                                                    </span>
                                                </td>
                                                <td>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className={"name-column"}>
                                                    <span>Valuation</span>
                                                </td>
                                                <td className={"amount-column"}>
                                                            <span>
                                                                $<NumberFormat value={this.state.valuation}
                                                                              displayType={'text'}
                                                                              thousandSeparator={', '}
                                                                              decimalScale={2}
                                                                              fixedDecimalScale={true}
                                                                />
                                                            </span>
                                                </td>
                                                <td>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </Table>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                : null
        );
    }
}

export default ViewStabilizedStatementValuation;
