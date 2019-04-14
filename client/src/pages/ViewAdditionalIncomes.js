import React from 'react';
import {Badge, Row, Col, Card, CardBody, CardHeader, Table, Button, Popover, PopoverHeader, PopoverBody, DropdownItem, DropdownToggle, Dropdown, DropdownMenu } from 'reactstrap';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import IncomeStatementEditor from './components/IncomeStatementEditor';
import _ from 'underscore';
import AppraisalContentHeader from "./components/AppraisalContentHeader";


class ViewAdditionalIncomes extends React.Component
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

    downloadWordAdditionalIncomes()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/additional_incomes/word`;
    }

    downloadExcelAdditionalIncomes()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/additional_incomes/excel`;
    }

    render()
    {
        return (
            <div className={"view-additional-incomes"}>
                <AppraisalContentHeader appraisal={this.props.appraisal} title="Additional Incomes"/>,
                <Row>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                {/*{(this.props.appraisal && this.props.appraisal.incomeStatement) ?*/}
                                <div id={"view-additional-incomes-body"} className={"view-additional-incomes-body"}>
                                    <Row>
                                        <Col xs={10}>
                                            <h3>Additional Incomes</h3>
                                        </Col>
                                        <Col xs={2}>
                                            <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggleDownload.bind(this)}>
                                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                                    Download
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    <DropdownItem onClick={() => this.downloadWordAdditionalIncomes()}>Additional Income Summary (docx)</DropdownItem>
                                                    <DropdownItem onClick={() => this.downloadExcelAdditionalIncomes()}>Additioanl Income Spreadsheet (xlsx)</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </Col>
                                    </Row>

                                    <IncomeStatementEditor
                                        appraisal={this.props.appraisal}
                                        field={"incomes"}
                                        groups={{
                                            "additional_income": "Additional Income"
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

export default ViewAdditionalIncomes;
