import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import _ from 'underscore';
import FieldDisplayEdit from "./components/FieldDisplayEdit";
import AppraisalContentHeader from "./components/AppraisalContentHeader";


class ViewDiscountedCashFlow extends React.Component
{
    state = {
        capitalizationRate: 8.4,
    };

    componentDidMount()
    {
        this.groupCashFlows();
    }


    groupCashFlows()
    {
        const grouped = _.groupBy(this.props.appraisal.cashFlows, (cashFlow) => cashFlow.name);

        // Now group all of the income and expense cash flows
        const incomes = [];
        const expenses = [];

        Object.values(grouped).forEach((cashFlows) =>
        {
            if (cashFlows[0].cashFlowType === 'income')
            {
                incomes.push(cashFlows);
            }
            else if (cashFlows[0].cashFlowType === 'expense')
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
                this.props.appraisal.discountedCashFlow.cashFlowSummary.years.map((year) => <td className={"amount-column"}>
                    <span><NumberFormat value={cashFlowSummaryItem.amounts[year]} displayType={"text"} decimalScale={2} thousandSeparator={", "} /></span>
                </td>)
            }
        </tr>
    }

    changeDCFInput(field, newValue)
    {
        this.props.appraisal.discountedCashFlowInputs[field] = newValue;
        this.props.saveAppraisal(this.props.appraisal, true);
    }

    render() {
        return [
            <AppraisalContentHeader appraisal={this.props.appraisal} title="Discounted Cash Flow" />,
                <Row>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                {(this.props.appraisal && this.props.appraisal.discountedCashFlow ) ?
                                    <div id={"view-discounted-cash-flow"} className={"view-discounted-cash-flow"}>
                                        <Row>
                                            <Col xs={12} md={12} lg={12} xl={12}>
                                                <Card outline color="primary" className="mb-3">
                                                    <CardHeader className="text-white bg-primary">Inputs</CardHeader>
                                                    <CardBody>
                                                        <Row>
                                                            <Col xs={12} sm={6} md={4}>
                                                                <table className="table">
                                                                    <tbody>
                                                                    <tr>
                                                                        <td>
                                                                            <strong>Inflation Rate</strong>
                                                                        </td>
                                                                        <td>
                                                                            <FieldDisplayEdit value={this.props.appraisal.discountedCashFlowInputs.inflation} onChange={(newValue) => this.changeDCFInput('inflation', newValue)}/>
                                                                        </td>
                                                                    </tr>
                                                                    </tbody>
                                                                </table>
                                                            </Col>
                                                            <Col xs={12} sm={6} md={4}>
                                                                <table className="table">
                                                                    <tbody>
                                                                    <tr>
                                                                        <td>
                                                                            <strong>Discount Rate</strong>
                                                                        </td>
                                                                        <td>
                                                                            <FieldDisplayEdit value={this.props.appraisal.discountedCashFlowInputs.discountRate} onChange={(newValue) => this.changeDCFInput('discountRate', newValue)}/>
                                                                        </td>
                                                                    </tr>
                                                                    </tbody>
                                                                </table>
                                                            </Col>
                                                        </Row>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>
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
                                                                this.props.appraisal.discountedCashFlow.cashFlowSummary.incomes.length > 0 && this.props.appraisal.discountedCashFlow.cashFlowSummary.incomes.map((item, itemIndex) => {
                                                                    return this.formatCashFlowRow(item, itemIndex, false);
                                                                })
                                                            }
                                                            {
                                                                this.props.appraisal.discountedCashFlow.cashFlowSummary.years.length > 0 ?
                                                                    this.formatCashFlowRow(this.props.appraisal.discountedCashFlow.cashFlowSummary.incomeTotal, 0, true)
                                                                    : null
                                                            }
                                                            {
                                                                this.props.appraisal.discountedCashFlow.cashFlowSummary.expenses.length > 0 && this.props.appraisal.discountedCashFlow.cashFlowSummary.expenses.map((item, itemIndex) => {
                                                                    return this.formatCashFlowRow(item, itemIndex, false);
                                                                })
                                                            }
                                                            {
                                                                this.props.appraisal.discountedCashFlow.cashFlowSummary.years.length > 0 ?
                                                                    this.formatCashFlowRow(this.props.appraisal.discountedCashFlow.cashFlowSummary.expenseTotal, 0, true)
                                                                    : null
                                                            }
                                                            {
                                                                this.props.appraisal.discountedCashFlow.cashFlowSummary.years.length > 0 ?
                                                                    this.formatCashFlowRow(this.props.appraisal.discountedCashFlow.cashFlowSummary.netOperatingIncome, 0, true)
                                                                    : null
                                                            }
                                                            {
                                                                this.props.appraisal.discountedCashFlow.cashFlowSummary.years.length > 0
                                                                    ? this.formatCashFlowRow(this.props.appraisal.discountedCashFlow.cashFlowSummary.presentValue, 0, true)
                                                                    : null
                                                            }
                                                            </tbody>
                                                        </Table>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </div>
                                    : null}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
        ];
    }
}

export default ViewDiscountedCashFlow;
