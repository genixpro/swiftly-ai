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

    formatCashFlowRow(cashFlowSummaryItem, index, isTotal)
    {
        let className = "";
        if (isTotal)
        {
            className = "total-row";
        }

        return <tr key={index} className={className}>
            <td className={"name-column"}>
                <span>{cashFlowSummaryItem.name}</span>
            </td>
            {
                this.state.appraisal.discountedCashFlow.cashFlowSummary.years.map((year) => <td className={"amount-column"}>
                    <span><NumberFormat value={cashFlowSummaryItem.amounts[year]} displayType={"text"} decimalScale={2} thousandSeparator={", "} /></span>
                </td>)
            }
        </tr>
    }


    render() {
        return (
            (this.state.appraisal && this.state.appraisal.discountedCashFlow ) ?
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
                                            this.state.appraisal.discountedCashFlow.cashFlowSummary.incomes.length > 0 && this.state.appraisal.discountedCashFlow.cashFlowSummary.incomes.map((item, itemIndex) => {
                                                return this.formatCashFlowRow(item, itemIndex, false);
                                            })
                                        }
                                        {
                                            this.state.appraisal.discountedCashFlow.cashFlowSummary.years.length > 0 ?
                                                this.formatCashFlowRow(this.state.appraisal.discountedCashFlow.cashFlowSummary.incomeTotal, 0, true)
                                                : null
                                        }
                                        {
                                            this.state.appraisal.discountedCashFlow.cashFlowSummary.expenses.length > 0 && this.state.appraisal.discountedCashFlow.cashFlowSummary.expenses.map((item, itemIndex) => {
                                                return this.formatCashFlowRow(item, itemIndex, false);
                                            })
                                        }
                                        {
                                            this.state.appraisal.discountedCashFlow.cashFlowSummary.years.length > 0 ?
                                                this.formatCashFlowRow(this.state.appraisal.discountedCashFlow.cashFlowSummary.expenseTotal, 0, true)
                                                : null
                                        }
                                        {
                                            this.state.appraisal.discountedCashFlow.cashFlowSummary.years.length > 0 ?
                                                this.formatCashFlowRow(this.state.appraisal.discountedCashFlow.cashFlowSummary.netOperatingIncome, 0, true)
                                                : null
                                        }
                                        {
                                            this.state.appraisal.discountedCashFlow.cashFlowSummary.years.length > 0
                                                ? this.formatCashFlowRow(this.state.appraisal.discountedCashFlow.cashFlowSummary.presentValue, 0, true)
                                                : null
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
