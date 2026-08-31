import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from '@components/Common/NumberFormatCompat';
import FieldDisplayEdit from "./components/FieldDisplayEdit";
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import {groupCashFlows, type CashFlow} from '../domain/discountedCashFlow';
import type {AppraisalDTO} from '../api/types';

interface CashFlowSummaryItem {
    name: string;
    amounts: Record<number, number | string | null | undefined>;
}

interface DiscountedCashFlowSummary {
    years: number[];
    incomes: CashFlowSummaryItem[];
    expenses: CashFlowSummaryItem[];
    incomeTotal: CashFlowSummaryItem;
    expenseTotal: CashFlowSummaryItem;
    netOperatingIncome: CashFlowSummaryItem;
    presentValue: CashFlowSummaryItem;
}

interface DiscountedCashFlowAppraisal extends AppraisalDTO {
    _id: string;
    cashFlows?: CashFlow[];
    discountedCashFlowInputs: Record<string, unknown>;
    discountedCashFlow: {cashFlowSummary: DiscountedCashFlowSummary};
}

interface ViewDiscountedCashFlowProps {
    appraisal: DiscountedCashFlowAppraisal;
    saveAppraisal(appraisal: DiscountedCashFlowAppraisal): void;
}

function ViewDiscountedCashFlow(props: ViewDiscountedCashFlowProps)
{
    const appraisal = props.appraisal;
    const [, setMountGroups] = React.useState<unknown>({capitalizationRate: 8.4});

    // This stays mount-only to retain the componentDidMount grouping pass.
    React.useEffect(() => {
        setMountGroups(groupCashFlows(appraisal.cashFlows));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    function formatCashFlowRow(cashFlowSummaryItem: CashFlowSummaryItem, rowKey: string, isTotal: boolean)
    {
        let className = "";
        if (isTotal)
        {
            className = "total-row";
        }

        return <tr key={rowKey} className={className}>
            <td className={"name-column"}>
                <span>{cashFlowSummaryItem.name}</span>
            </td>
            {
                appraisal.discountedCashFlow.cashFlowSummary.years.map((year) => <td key={year} className={"amount-column"}>
                    <span><NumberFormat value={cashFlowSummaryItem.amounts[year]} displayType={"text"} decimalScale={2} thousandSeparator={","} /></span>
                </td>)
            }
        </tr>
    }

    function changeDCFInput(field: string, newValue: unknown)
    {
        appraisal.discountedCashFlowInputs[field] = newValue;
        props.saveAppraisal(appraisal);
    }

    return [
            <AppraisalContentHeader key="header" appraisal={appraisal} title="Discounted Cash Flow" />,
                <Row key="body">
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                {(appraisal && appraisal.discountedCashFlow ) ?
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
                                                                            <FieldDisplayEdit value={appraisal.discountedCashFlowInputs.inflation} onChange={(newValue: unknown) => changeDCFInput('inflation', newValue)}/>
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
                                                                            <FieldDisplayEdit value={appraisal.discountedCashFlowInputs.discountRate} onChange={(newValue: unknown) => changeDCFInput('discountRate', newValue)}/>
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
                                                                    {appraisal.discountedCashFlow.cashFlowSummary.years.map((year) =>
                                                                        <th className={"amount-column"} key={year} scope="col">
                                                                            <NumberFormat value={year} displayType={"text"} />
                                                                        </th>
                                                                    )}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                            {
                                                                appraisal.discountedCashFlow.cashFlowSummary.incomes.length > 0 && appraisal.discountedCashFlow.cashFlowSummary.incomes.map((item, itemIndex) => {
                                                                    return formatCashFlowRow(item, `income-${itemIndex}`, false);
                                                                })
                                                            }
                                                            {
                                                                appraisal.discountedCashFlow.cashFlowSummary.years.length > 0 ?
                                                                    formatCashFlowRow(appraisal.discountedCashFlow.cashFlowSummary.incomeTotal, 'income-total', true)
                                                                    : null
                                                            }
                                                            {
                                                                appraisal.discountedCashFlow.cashFlowSummary.expenses.length > 0 && appraisal.discountedCashFlow.cashFlowSummary.expenses.map((item, itemIndex) => {
                                                                    return formatCashFlowRow(item, `expense-${itemIndex}`, false);
                                                                })
                                                            }
                                                            {
                                                                appraisal.discountedCashFlow.cashFlowSummary.years.length > 0 ?
                                                                    formatCashFlowRow(appraisal.discountedCashFlow.cashFlowSummary.expenseTotal, 'expense-total', true)
                                                                    : null
                                                            }
                                                            {
                                                                appraisal.discountedCashFlow.cashFlowSummary.years.length > 0 ?
                                                                    formatCashFlowRow(appraisal.discountedCashFlow.cashFlowSummary.netOperatingIncome, 'net-operating-income', true)
                                                                    : null
                                                            }
                                                            {
                                                                appraisal.discountedCashFlow.cashFlowSummary.years.length > 0
                                                                    ? formatCashFlowRow(appraisal.discountedCashFlow.cashFlowSummary.presentValue, 'present-value', true)
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

export default ViewDiscountedCashFlow;
