import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import FieldDisplayEdit from './components/FieldDisplayEdit';


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
                                                    return <tr key={itemIndex}>
                                                        <td className={"name-column"}>
                                                            <FieldDisplayEdit
                                                                hideIcon={true}
                                                                value={item.name}
                                                                onChange={(newValue) => this.changeIncomeItemName(item, newValue)}
                                                            />
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <span>
                                                                <FieldDisplayEdit
                                                                    type="currency"
                                                                    hideIcon={true}
                                                                    value={item.yearlyAmount}
                                                                    onChange={(newValue) => this.changeIncomeItemValue(item, newValue)}
                                                                />
                                                            </span>
                                                        </td>
                                                    </tr>
                                                })
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
                                                this.state.appraisal.incomeStatement.expenses && this.state.appraisal.incomeStatement.expenses.map((item) => {
                                                    return <tr key={item.name}>
                                                        <td className={"name-column"}>
                                                            <FieldDisplayEdit
                                                                hideIcon={true}
                                                                value={item.name}
                                                                onChange={(newValue) => this.changeIncomeItemName(item, newValue)}
                                                            />
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <span>
                                                                <FieldDisplayEdit
                                                                    type="currency"
                                                                    hideIcon={true}
                                                                    value={item.yearlyAmount}
                                                                    onChange={(newValue) => this.changeIncomeItemValue(item, newValue)}
                                                                />
                                                            </span>
                                                        </td>
                                                    </tr>
                                                })
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
