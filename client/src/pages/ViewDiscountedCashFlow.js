import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';



class ViewDiscountedCashFlow extends React.Component
{
    state = {
        capitalizationRate: 8.4
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.match.params.id}`).then((response) =>
        {
            this.setState({appraisal: response.data.appraisal}, () => this.groupCashFlows())
        });
    }


    groupCashFlows()
    {
        const grouped = _.groupBy(this.state.appraisal.cashFlows, (cashFlow) => cashFlow.name);

        // Now group all of the income and expense cash flows
        const incomes = [];
        const expenses = [];

        Object.values(grouped).map((cashFlows) =>
        {
            if (cashFlows[0].type === 'income')
            {
                incomes.push(cashFlows);
            }
            else if (cashFlows[0].type === 'expense')
            {
                expenses.push(cashFlows);
            }
        });

        this.setState({
            "rows": Object.values(grouped),
            "incomes": incomes,
            "expenses": expenses
        });
    }



    render() {
        return (
            (this.state.appraisal) ?
                <div id={"view-discounted-cash-flow"} className={"view-discounted-cash-flow"}>
                    <Row>
                        <Col xs={12} md={12} lg={12} xl={12}>
                            <Card outline color="primary" className="mb-3">
                                <CardHeader className="text-white bg-primary">Discounted Cash Flow</CardHeader>
                                <CardBody>
                                    <Table hover responsive>
                                        <thead>
                                            <tr className={"header-row"}>
                                                <td />
                                                {
                                                    this.state.rows && this.state.rows.length > 0 && this.state.rows[0].map((cashFlow) => <td className={"amount-column"}>
                                                        <span><NumberFormat value={cashFlow['year']} displayType={"text"} /></span>
                                                    </td>)
                                                }
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            this.state.incomes && this.state.incomes.length > 0 && this.state.incomes.map((item, itemIndex) => {
                                                return <tr key={itemIndex}>
                                                    <td className={"name-column"}>
                                                        <span>{item[0].name}</span>
                                                    </td>
                                                    {
                                                        item.map((cashFlow) => <td className={"amount-column"}>
                                                            <span><NumberFormat value={cashFlow['amount']} displayType={"text"} decimalScale={2} thousandSeparator={", "} /></span>
                                                        </td>)
                                                    }
                                                </tr>
                                            })
                                        }
                                        {
                                            this.state.appraisal && this.state.appraisal.cashFlowSummary.years.length > 0 &&
                                                <tr className={"total-row"}>
                                                    <td className={"name-column"}>
                                                        <span>Net Revenues</span>
                                                    </td>
                                                    {
                                                        this.state.appraisal.cashFlowSummary.years.map((year) => {
                                                            return  <td className={"amount-column"}>
                                                                <span><NumberFormat value={this.state.appraisal.cashFlowSummary.income[year]} displayType={"text"} decimalScale={2} thousandSeparator={", "} /></span>
                                                            </td>;
                                                        })
                                                    }
                                                </tr>
                                        }
                                        {
                                            this.state.expenses && this.state.expenses.length > 0 && this.state.expenses.map((item, itemIndex) => {
                                                return <tr key={itemIndex}>
                                                    <td className={"name-column"}>
                                                        <span>{item[0].name}</span>
                                                    </td>
                                                    {
                                                        item.map((cashFlow) => <td className={"amount-column"}>
                                                            <span><NumberFormat value={cashFlow['amount']} displayType={"text"} decimalScale={2} thousandSeparator={", "} /></span>
                                                        </td>)
                                                    }
                                                </tr>
                                            })
                                        }
                                        {
                                            this.state.appraisal && this.state.appraisal.cashFlowSummary.years.length > 0 &&
                                            <tr className={"total-row"}>
                                                <td className={"name-column"}>
                                                    <span>Operating Expenses</span>
                                                </td>
                                                {
                                                    this.state.appraisal.cashFlowSummary.years.map((year) => {
                                                        return <td className={"amount-column"}>
                                                            <span><NumberFormat
                                                                value={this.state.appraisal.cashFlowSummary.expense[year]}
                                                                displayType={"text"} decimalScale={2}
                                                                thousandSeparator={", "}/></span>
                                                        </td>;
                                                    })
                                                }
                                            </tr>
                                        }
                                        {
                                            this.state.appraisal && this.state.appraisal.cashFlowSummary.years.length > 0 &&
                                            <tr className={"total-row"}>
                                                <td className={"name-column"}>
                                                    <span>Net Operating Income</span>
                                                </td>
                                                {
                                                    this.state.appraisal.cashFlowSummary.years.map((year) => {
                                                        return <td className={"amount-column"}>
                                                            <span><NumberFormat
                                                                value={this.state.appraisal.cashFlowSummary.netOperatingIncome[year]}
                                                                displayType={"text"} decimalScale={2}
                                                                thousandSeparator={", "}/></span>
                                                        </td>;
                                                    })
                                                }
                                            </tr>
                                        }
                                        {
                                            this.state.appraisal && this.state.appraisal.cashFlowSummary.years.length > 0 &&
                                            <tr className={"total-row"}>
                                                <td className={"name-column"}>
                                                    <span>Present Value</span>
                                                </td>
                                                {
                                                    this.state.appraisal.cashFlowSummary.years.map((year) => {
                                                        return <td className={"amount-column"}>
                                                            <span><NumberFormat
                                                                value={this.state.appraisal.cashFlowSummary.presentValue[year]}
                                                                displayType={"text"} decimalScale={2}
                                                                thousandSeparator={", "}/></span>
                                                        </td>;
                                                    })
                                                }
                                            </tr>
                                        }
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

export default ViewDiscountedCashFlow;
