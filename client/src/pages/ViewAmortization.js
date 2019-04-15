import React from 'react';
import { Row, Col, Card, CardBody, Button } from 'reactstrap';
import _ from 'underscore';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import 'react-datetime/css/react-datetime.css'
import AppraisalContentHeader from "./components/AppraisalContentHeader";

class ViewAmortization extends React.Component
{
    state = {
        selectedUnit: null
    };

    removeAmortization(amortizationIndex)
    {
        this.props.appraisal.amortizationSchedule.items.splice(amortizationIndex, 1);
        this.props.saveDocument(this.props.appraisal);
    }

    renderAmortization(amortization, amortizationIndex)
    {
        return <tr
            className={"tenant-row"}
            key={amortizationIndex}
        >
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={amortization.name}
                    placeholder={"name"}
                    onChange={_.once((newValue) => this.changeAmortizationField(amortization, "name", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"currency"}
                    hideIcon={true}
                    value={amortization.amount}
                    placeholder={"Amount"}
                    onChange={_.once((newValue) => this.changeAmortizationField(amortization, "amount", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"percent"}
                    hideIcon={true}
                    value={amortization.interest}
                    placeholder={"Interest"}
                    onChange={_.once((newValue) => this.changeAmortizationField(amortization, "interest", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"percent"}
                    hideIcon={true}
                    value={amortization.discountRate}
                    placeholder={"Discount Rate"}
                    onChange={_.once((newValue) => this.changeAmortizationField(amortization, "discountRate", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"date"}
                    hideIcon={true}
                    value={amortization.startDate}
                    placeholder={"Start Date"}
                    onChange={_.once((newValue) => this.changeAmortizationField(amortization, "startDate", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type='number'
                    value={amortization.periodMonths}
                    placeholder={"Period (months)"}
                    onChange={(newValue) => this.changeAmortizationField(amortization, 'periodMonths', newValue)}/>
            </td>

            <td className={"action-column"}>
                <Button
                    color="secondary"
                    onClick={(evt) => this.removeAmortization(amortizationIndex)}
                    title={"New Amortization"}
                >
                    <i className="fa fa-trash-alt"></i>
                </Button>
            </td>
        </tr>;
    }


    createNewAmortization(field, value)
    {
        const newAmortization = {
        };

        if (field)
        {
            newAmortization[field] = value;
        }

        if (_.isUndefined(newAmortization['name']))
        {
            newAmortization['name'] = 'New Tenant';
        }

        if (_.isUndefined(newAmortization['amount']))
        {
            newAmortization['amount'] = 0;
        }

        if (_.isUndefined(newAmortization['interest']))
        {
            newAmortization['interest'] = 3;
        }

        if (_.isUndefined(newAmortization['discountRate']))
        {
            newAmortization['discountRate'] = 8;
        }

        if (_.isUndefined(newAmortization['startDate']))
        {
            newAmortization['startDate'] = new Date();
        }

        if (_.isUndefined(newAmortization['periodMonths']))
        {
            newAmortization['periodMonths'] = 1;
        }

        this.props.appraisal.amortizationSchedule.items.push(newAmortization);
        this.props.saveDocument(this.props.appraisal);
    }



    renderNewAmortization()
    {
        return <tr className={"tenant-row"}>
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    placeholder={"name"}
                    onChange={_.once((newValue) => this.createNewAmortization("name", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"currency"}
                    hideIcon={true}
                    value={""}
                    placeholder={"Amount"}
                    onChange={_.once((newValue) => this.createNewAmortization("amount", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"percent"}
                    hideIcon={true}
                    value={""}
                    placeholder={"Interest"}
                    onChange={_.once((newValue) => this.createNewAmortization("interest", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"percent"}
                    hideIcon={true}
                    value={""}
                    placeholder={"Discount Rate"}
                    onChange={_.once((newValue) => this.createNewAmortization("discountRate", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"date"}
                    hideIcon={true}
                    value={""}
                    placeholder={"Date"}
                    onChange={_.once((newValue) => this.createNewAmortization("date", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type='number'
                    value={""}
                    placeholder={"Period (months)"}
                    onChange={(newValue) => this.createNewAmortization('periodMonths', newValue)}/>
            </td>

            <td className={"action-column"}>
                <Button
                    color="secondary"
                    onClick={(evt) => this.createNewAmortization()}
                    title={"New Amortization Item"}
                >
                    <i className="fa fa-plus-square"></i>
                </Button>
            </td>
        </tr>;
    }

    toggleDownload()
    {
        this.setState({downloadDropdownOpen: !this.state.downloadDropdownOpen})
    }


    changeAmortizationField(amortization, field, newValue)
    {
        amortization[field] = newValue;

        this.props.saveDocument(this.props.appraisal);
    }


    render() {
        return (
            <div id={"view-amortization"} className={"view-amortization"}>
                <AppraisalContentHeader key={1} appraisal={this.props.appraisal} title="Amortization Schedule" />
                <Row key={3}>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>

                                <Row>
                                    <Col xs={10}>
                                        <h3>Amortization Schedule</h3>
                                    </Col>
                                    {/*<Col xs={2}>*/}
                                        {/*<Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggleDownload.bind(this)}>*/}
                                            {/*<DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>*/}
                                                {/*Download*/}
                                            {/*</DropdownToggle>*/}
                                            {/*<DropdownMenu>*/}
                                                {/*<DropdownItem onClick={() => this.downloadWordRentRoll()}>Rent Roll Summary (docx)</DropdownItem>*/}
                                                {/*<DropdownItem onClick={() => this.downloadExcelRentRoll()}>Rent Roll Spreadsheet (xlsx)</DropdownItem>*/}
                                            {/*</DropdownMenu>*/}
                                        {/*</Dropdown>*/}
                                    {/*</Col>*/}
                                </Row>
                                <Row>
                                    <Col xs={12} md={12} lg={12} xl={12}>
                                        <table className="table tenancies-table">
                                            <thead>
                                                <tr>
                                                    <td>Name</td>
                                                    <td>Amount</td>
                                                    <td>Interest</td>
                                                    <td>Discount Rate</td>
                                                    <td>Start Date</td>
                                                    <td>Period</td>
                                                    <td className="action-column" />
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                this.props.appraisal.amortizationSchedule.items.map((item, tenancyIndex) => {
                                                    return this.renderAmortization(item, tenancyIndex);
                                                })
                                            }
                                            {
                                                this.renderNewAmortization()
                                            }
                                            </tbody>

                                        </table>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ViewAmortization;
