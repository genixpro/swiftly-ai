import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import FinancialStatementFields from "./FinancialStatementFields";
import _ from 'underscore';
import NumberFormat from 'react-number-format';
import AnnotationUtilities from './AnnotationUtilities';

class ViewFinancialStatementAudit extends React.Component
{
    state = {
        width: 0,
        height: 0,
        financialStatement: {
            extractedData:{},
            words: []
        }
    };

    componentDidMount()
    {
        if (this.props.financialStatement.extractedData.income) {
            this.props.financialStatement.extractedData.income.forEach((income) => {
                if (_.isUndefined(income.include)) {
                    income.include = true;
                }
            });
        }

        if (this.props.financialStatement.extractedData.expense) {
            this.props.financialStatement.extractedData.expense.forEach((expense) => {
                if (_.isUndefined(expense.include)) {
                    expense.include = true;
                }
            });
        }

        this.setState({"financialStatement": this.props.financialStatement}, () => this.computeGroupTotals());

        const groups = {};
        FinancialStatementFields.forEach((group) =>
        {
            groups[group.field] = group;
        });
        
        this.setState({groups});
    }

    componentDidUpdate()
    {
        
    }

    computeGroupTotals()
    {
        let incomeTotal = 0;
        let expenseTotal = 0;

        if (this.state.financialStatement.extractedData.income)
        {
            this.state.financialStatement.extractedData.income.forEach((income) =>
            {
                if (income.include)
                {
                    incomeTotal += AnnotationUtilities.cleanAmount(income.income_amount);
                }
            });
        }

        if (this.state.financialStatement.extractedData.expense)
        {
            this.state.financialStatement.extractedData.expense.forEach((expense) =>
            {
                if (expense.include)
                {
                    expenseTotal += AnnotationUtilities.cleanAmount(expense.expense_amount);
                }
            });
        }

        this.setState({incomeTotal, expenseTotal});
    }


    changeInclude(item)
    {
        const newInclude = !item.include;

        const newFinancialStatement = this.state.financialStatement;
        newFinancialStatement.extractedData.income.forEach((income) => {
            if (income.lineNumber === item.lineNumber)
            {
                income.include = newInclude;
            }
        });
        newFinancialStatement.extractedData.expense.forEach((expense) => {
            if (expense.lineNumber === item.lineNumber)
            {
                expense.include = newInclude;
            }
        });

        this.props.saveFinancialStatementData(newFinancialStatement);
        this.setState({financialStatement: newFinancialStatement}, () => this.computeGroupTotals());
    }


    render() {
        return (
            this.state.groups ?
                <div id={"view-financial-statement-audit-classification"} className={"view-financial-statement-audit-classification"}>
                    <Row>
                        <Col xs={12} md={10} lg={8} xl={6}>
                            <Card outline color="primary" className="mb-3">
                                <CardHeader className="text-white bg-primary">Income</CardHeader>
                                <CardBody>
                                    <Table striped bordered hover responsive>
                                        <thead>
                                        <tr>
                                            <th className={"name-column"} />
                                            <th className={"amount-column"} />
                                            <th className={"include-column"}>Include in Stabilized Statement?</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            this.state.financialStatement.extractedData[this.state.groups['items'].field] && this.state.financialStatement.extractedData[this.state.groups['items'].field].map((item) => {
                                                return <tr key={item.lineNumber} className={`${!item.include ? 'excluded-item' : ''}`}>
                                                    <td className={"name-column"}>
                                                        <span>{item['income_name']}</span>
                                                    </td>
                                                    <td className={"amount-column"}>
                                                        <span>{item['income_amount']}</span>
                                                    </td>
                                                    <td className={"include-column"}>
                                                        <input
                                                            checked={item['include']}
                                                            onClick={() => this.changeInclude(item)}
                                                            type={"checkbox"} />
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
                                                    <NumberFormat
                                                        value={this.state.incomeTotal}
                                                        displayType={'text'}
                                                        thousandSeparator={', '}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                    />
                                                </span>
                                            </td>
                                            <td />
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
                                        <thead>
                                        <tr>
                                            <th className={"name-column"} />
                                            <th className={"amount-column"} />
                                            <th className={"include-column"}>Include in Stabilized Statement?</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            this.state.financialStatement.extractedData[this.state.groups['items'].field] && this.state.financialStatement.extractedData[this.state.groups['items'].field].map((item) => {
                                                return <tr key={item.lineNumber} className={`${!item.include ? 'excluded-item' : ''}`}>
                                                    <td className={"name-column"}>
                                                        <span>{item['expense_name']}</span>
                                                    </td>
                                                    <td className={"amount-column"}>
                                                        <span>{item['expense_amount']}</span>
                                                    </td>
                                                    <td className={"include-column"}>
                                                        <input
                                                            checked={item['include']}
                                                            onClick={() => this.changeInclude(item)}
                                                            type={"checkbox"} />
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
                                                    <NumberFormat
                                                        value={this.state.expenseTotal}
                                                        displayType={'text'}
                                                        thousandSeparator={', '}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                    />
                                                </span>
                                            </td>
                                            <td />
                                        </tr>

                                        </tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div> : null);
    }
}

export default ViewFinancialStatementAudit;
/*
;
 */