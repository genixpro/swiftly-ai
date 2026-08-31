import { reportUrl } from "@api/client";
import React from 'react';
import { Row, Col, Card, CardBody, Button, ButtonGroup, DropdownItem, DropdownToggle, Dropdown, DropdownMenu, Alert } from 'reactstrap';
import IncomeStatementEditor from './components/IncomeStatementEditor';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import type {AppraisalDTO} from '../api/types';
import {navigateBrowserLocation} from '../components/platform/browserActions';

interface ExpensesAppraisal extends AppraisalDTO {
    _id: string;
    stabilizedStatementInputs: {expensesMode?: string};
    validationResult: {hasExpenses?: boolean};
}

interface ViewExpensesProps {
    appraisal: ExpensesAppraisal;
    navigate(path: string): void;
    saveAppraisal(appraisal: ExpensesAppraisal): void;
}

function ViewExpenses(props: ViewExpensesProps)
{
    const [downloadDropdownOpen, setDownloadDropdownOpen] = React.useState<boolean | undefined>();

    React.useEffect(() =>
    {
        if (props.appraisal.stabilizedStatementInputs.expensesMode === 'tmi')
        {
            props.navigate(`/appraisal/${props.appraisal._id}/expenses_tmi`);
        }
    // Intentionally mount-only, matching componentDidMount redirect behavior.
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    function toggleDownload()
    {
        setDownloadDropdownOpen((isOpen) => !isOpen);
    }

    function downloadWordExpenses()
    {
        navigateBrowserLocation(reportUrl(props.appraisal._id, "expenses", "word"));
    }

    function changeExpenseMode()
    {
        props.appraisal.stabilizedStatementInputs.expensesMode = "tmi";
        props.saveAppraisal(props.appraisal);
        props.navigate(`/appraisal/${props.appraisal._id}/expenses_tmi`);
    }

    return (
            <div className={"view-expenses"}>
                <AppraisalContentHeader appraisal={props.appraisal} title="Expenses"/>
                <Row>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                {
                                    !props.appraisal.validationResult.hasExpenses ?
                                        <Alert color={"warning"}>
                                            <span>You have not uploaded any expenses for this appraisal. Would you like to set expenses based on TMI rates?</span>
                                            &nbsp;
                                            &nbsp;
                                            &nbsp;
                                            <Button color={"primary"} onClick={() => changeExpenseMode()}>Set Expenses Based on TMI</Button>
                                        </Alert>
                                        : null
                                }
                                {/*{(this.props.appraisal && this.props.appraisal.incomeStatement) ?*/}
                                <div id={"view-expenses-body"} className={"view-expenses-body"}>
                                    <Row>
                                        <Col xs={12} md={6}>
                                            <h3>Expenses</h3>
                                        </Col>
                                        <Col xs={12} md={6} className="expense-actions">
                                            <ButtonGroup>
                                                {props.appraisal.validationResult.hasExpenses ?
                                                    <Button color={"primary"} onClick={() => changeExpenseMode()}>Set Expenses Based on TMI</Button>
                                                    : null}
                                                &nbsp;
                                                <Dropdown isOpen={downloadDropdownOpen} toggle={toggleDownload}>
                                                    <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                                        Download
                                                    </DropdownToggle>
                                                    <DropdownMenu>
                                                        <DropdownItem onClick={() => downloadWordExpenses()}>Expenses Summary (docx)</DropdownItem>
                                                        {/*<DropdownItem onClick={() => this.downloadExcelExpenses()}>Expenses Spreadsheet (xlsx)</DropdownItem>*/}
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </ButtonGroup>
                                        </Col>
                                    </Row>

                                    <IncomeStatementEditor
                                        appraisal={props.appraisal}
                                        field={"expenseStatement"}
                                        groups={{
                                            "operating_expense": "Operating Expense",
                                            "management_expense": "Management Expense",
                                            "taxes": "Taxes"
                                        }}
                                        saveAppraisal={props.saveAppraisal}
                                    />


                                </div>
                                {/*: null}*/}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
    );
}

export default ViewExpenses;
