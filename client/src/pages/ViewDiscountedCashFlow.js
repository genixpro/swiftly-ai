import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';
import FieldDisplayEdit from "./components/FieldDisplayEdit";


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

    changeDCFInput(field, newValue)
    {
        this.state.appraisal.discountedCashFlowInputs[field] = newValue;
        this.setState({appraisal: this.state.appraisal}, () => this.saveDocument(this.state.appraisal))
    }


    saveDocument(newAppraisal)
    {
        axios.post(`/appraisal/${this.props.match.params.id}`, newAppraisal).then((response) =>
        {
            this.setState({appraisal: response.data.appraisal})
        });
    }

    render() {
        return (
            (this.state.appraisal && this.state.appraisal.discountedCashFlow ) ?
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
                                                        <FieldDisplayEdit value={this.state.appraisal.discountedCashFlowInputs.inflation} onChange={(newValue) => this.changeDCFInput('inflation', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Discount Rate</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit value={this.state.appraisal.discountedCashFlowInputs.discountRate} onChange={(newValue) => this.changeDCFInput('discountRate', newValue)}/>
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
                                                        <strong>Leasing Commission Costs (Per Lease)</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit value={this.state.appraisal.discountedCashFlowInputs.leasingCommission} onChange={(newValue) => this.changeDCFInput('leasingCommission', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Tenant Inducement Costs (Per Square Foot)</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit value={this.state.appraisal.discountedCashFlowInputs.tenantInducementsPSF} onChange={(newValue) => this.changeDCFInput('tenantInducementsPSF', newValue)}/>
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
                                                        <strong>Renewal Period</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit value={this.state.appraisal.discountedCashFlowInputs.renewalPeriod} onChange={(newValue) => this.changeDCFInput('renewalPeriod', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Market Rent (Per Square Foot)</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit value={this.state.appraisal.discountedCashFlowInputs.marketRentPSF} onChange={(newValue) => this.changeDCFInput('marketRentPSF', newValue)}/>
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
