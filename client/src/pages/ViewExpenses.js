import React from 'react';
import {Badge, Row, Col, Card, CardBody, CardHeader, Table, Button, Popover, PopoverHeader, PopoverBody, DropdownItem, DropdownToggle, Dropdown, DropdownMenu } from 'reactstrap';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import IncomeStatementEditor from './components/IncomeStatementEditor';
import _ from 'underscore';
import AppraisalContentHeader from "./components/AppraisalContentHeader";


class ViewExpenses extends React.Component
{
    state = {
    };

    constructor()
    {
        super();

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

    render()
    {
        return (
            <div className={"view-expenses"}>
                <AppraisalContentHeader appraisal={this.props.appraisal} title="Expenses"/>
                <Row>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                {/*{(this.props.appraisal && this.props.appraisal.incomeStatement) ?*/}
                                <div id={"view-expenses-body"} className={"view-expenses-body"}>
                                    <Row>
                                        <Col xs={10}>
                                            <h3>Expenses</h3>
                                        </Col>
                                        <Col xs={2}>
                                            <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggleDownload.bind(this)}>
                                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                                    Download
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    <DropdownItem onClick={() => this.downloadWordExpenses()}>Expenses Summary (docx)</DropdownItem>
                                                    <DropdownItem onClick={() => this.downloadExcelExpenses()}>Expenses Spreadsheet (xlsx)</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
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
                                        saveDocument={this.props.saveDocument}
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
