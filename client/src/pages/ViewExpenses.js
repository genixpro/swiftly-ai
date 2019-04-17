import React from 'react';
import { Row, Col, Card, CardBody, Button, ButtonGroup, DropdownItem, DropdownToggle, Dropdown, DropdownMenu, Alert } from 'reactstrap';
import IncomeStatementEditor from './components/IncomeStatementEditor';
import AppraisalContentHeader from "./components/AppraisalContentHeader";


class ViewExpenses extends React.Component
{
    state = {
    };

    componentDidMount()
    {
        if (this.props.appraisal.stabilizedStatementInputs.expensesMode === 'tmi')
        {
            this.props.history.push(`/appraisal/${this.props.appraisal._id}/expenses_tmi`);
        }
    }

    toggleDownload()
    {
        this.setState({downloadDropdownOpen: !this.state.downloadDropdownOpen})
    }

    downloadWordExpenses()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/expenses/word`;
    }

    downloadExcelExpenses()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/expenses/excel`;
    }

    changeExpenseMode()
    {
        this.props.appraisal.stabilizedStatementInputs.expensesMode = "tmi";
        this.props.saveAppraisal(this.props.appraisal);
        this.props.history.push(`/appraisal/${this.props.appraisal._id}/expenses_tmi`);
    }

    render()
    {
        return (
            <div className={"view-expenses"}>
                <AppraisalContentHeader appraisal={this.props.appraisal} title="Expenses"/>
                <Row>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                {
                                    !this.props.appraisal.validationResult.hasExpenses ?
                                        <Alert color={"warning"}>
                                            <span>You have not uploaded any expenses for this appraisal. Would you like to set expenses based on TMI rates?</span>
                                            &nbsp;
                                            &nbsp;
                                            &nbsp;
                                            <Button color={"primary"} onClick={() => this.changeExpenseMode()}>Set Expenses Based on TMI</Button>
                                        </Alert>
                                        : null
                                }
                                {/*{(this.props.appraisal && this.props.appraisal.incomeStatement) ?*/}
                                <div id={"view-expenses-body"} className={"view-expenses-body"}>
                                    <Row>
                                        <Col xs={9}>
                                            <h3>Expenses</h3>
                                        </Col>
                                        <Col xs={3}>
                                            <ButtonGroup style={{"float": "right"}}>
                                                <Button color={"primary"} onClick={() => this.changeExpenseMode()}>Set Expenses Based on TMI</Button>
                                                &nbsp;
                                                <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggleDownload.bind(this)}>
                                                    <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                                        Download
                                                    </DropdownToggle>
                                                    <DropdownMenu>
                                                        <DropdownItem onClick={() => this.downloadWordExpenses()}>Expenses Summary (docx)</DropdownItem>
                                                        <DropdownItem onClick={() => this.downloadExcelExpenses()}>Expenses Spreadsheet (xlsx)</DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </ButtonGroup>
                                        </Col>
                                    </Row>

                                    <IncomeStatementEditor
                                        appraisal={this.props.appraisal}
                                        field={"expenses"}
                                        groups={{
                                            "operating_expense": "Operating Expense",
                                            "management_expense": "Management Expense",
                                            "taxes": "Taxes"
                                        }}
                                        saveAppraisal={this.props.saveAppraisal}
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
}

export default ViewExpenses;
