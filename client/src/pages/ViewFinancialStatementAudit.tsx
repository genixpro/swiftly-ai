import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import FinancialStatementFields from "./FinancialStatementFields";
import NumberFormat from '@components/Common/NumberFormatCompat';
import {
    computeGroupTotals,
    initializeIncludedLines,
    type FinancialStatementAudit,
    type FinancialStatementAuditLine,
    type LegacyAuditTotal,
} from '../domain/financialStatementAudit';
import type {FinancialStatementFieldGroup} from './FinancialStatementFields';

interface AuditLine extends FinancialStatementAuditLine {
    expense_name?: React.ReactNode;
    income_name?: React.ReactNode;
    lineNumber?: number | string;
}

export interface AuditFinancialStatement extends FinancialStatementAudit {
    extractedData: FinancialStatementAudit['extractedData'] & {
        expense?: AuditLine[];
        income?: AuditLine[];
    };
    words?: unknown[];
}

type AuditGroups = Record<string, FinancialStatementFieldGroup & {field: string}>;

interface AuditState {
    expenseTotal?: LegacyAuditTotal;
    financialStatement: AuditFinancialStatement;
    groups?: AuditGroups;
    height: number;
    incomeTotal?: LegacyAuditTotal;
    width: number;
}

interface ViewFinancialStatementAuditProps {
    financialStatement: AuditFinancialStatement;
    saveFinancialStatementData(financialStatement: AuditFinancialStatement): void;
}

function ViewFinancialStatementAudit(props: ViewFinancialStatementAuditProps)
{
    const [state, setState] = React.useState<AuditState>({
        width: 0,
        height: 0,
        financialStatement: {
            extractedData:{},
            words: []
        }
    });
    const financialStatementRef = React.useRef(props.financialStatement);
    const groupsRef = React.useRef(FinancialStatementFields.reduce<AuditGroups>((groups, group) => {
        groups[group.field ?? 'undefined'] = group as FinancialStatementFieldGroup & {field: string};
        return groups;
    }, {}));
    const changeInclude = (item: AuditLine) => {
        const newInclude = !item.include;
        const newFinancialStatement = state.financialStatement;
        newFinancialStatement.extractedData.income!.forEach((income) => {
            if (income.lineNumber === item.lineNumber)
            {
                income.include = newInclude;
            }
        });
        newFinancialStatement.extractedData.expense!.forEach((expense) => {
            if (expense.lineNumber === item.lineNumber)
            {
                expense.include = newInclude;
            }
        });

        props.saveFinancialStatementData(newFinancialStatement);
        setState((currentState) => ({
            ...currentState,
            financialStatement: newFinancialStatement,
            ...computeGroupTotals(newFinancialStatement),
        }));
    };

    React.useEffect(() => {
        const financialStatement = financialStatementRef.current;
        initializeIncludedLines(financialStatement);
        setState((currentState) => ({
            ...currentState,
            financialStatement,
            groups: groupsRef.current,
            ...computeGroupTotals(financialStatement),
        }));
    }, []);

        const auditItems = state.groups
            ? state.financialStatement.extractedData[state.groups['items'].field] as AuditLine[] | undefined
            : undefined;

        return (
            state.groups ?
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
                                            auditItems && auditItems.map((item) => {
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
                                                            onClick={() => changeInclude(item)}
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
                                                        value={state.incomeTotal}
                                                        displayType={'text'}
                                                        thousandSeparator={','}
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
                                            auditItems && auditItems.map((item) => {
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
                                                            onClick={() => changeInclude(item)}
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
                                                        value={state.expenseTotal}
                                                        displayType={'text'}
                                                        thousandSeparator={','}
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

export default ViewFinancialStatementAudit;
/*
;
 */
