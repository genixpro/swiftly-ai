import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table, Button, NavItem, Nav, Navbar, NavLink } from 'reactstrap';
import { NavLink as RRNavLink } from 'react-router-dom';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';
import Moment from 'react-moment';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css'
import { Switch, Route } from 'react-router-dom';

class ViewTenantsRentRoll extends React.Component
{
    state = {
        capitalizationRate: 8.4,
        selectedUnit: null
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.appraisalId}`).then((response) =>
        {
            this.setState({appraisal: response.data.appraisal})
        });
    }

    onTenantClicked(unitNum)
    {
        this.state.appraisal.units.forEach((unit) =>
        {
            if (unit.unitNumber === unitNum)
            {
                this.setState({selectedUnit: unit})
            }
        });
    }

    renderUnitRow(unitInfo, unitIndex)
    {
        let selectedClass = "";
        if (this.state.selectedUnit && unitInfo.unitNumber === this.state.selectedUnit.unitNumber)
        {
            selectedClass = " selected-tenant-row";
        }

        return <tr onClick={(evt) => this.onTenantClicked(unitInfo.unitNumber)} className={"unit-row " + selectedClass} key={unitIndex}>
            <td>{unitInfo.unitNumber}</td>
            <td>{unitInfo.currentTenancy.name}</td>
            <td><NumberFormat
                value={unitInfo.squareFootage}
                displayType={'text'}
                thousandSeparator={', '}
                decimalScale={0}
                fixedDecimalScale={true}
            /></td>
            <td>$<NumberFormat
                value={unitInfo.currentTenancy.yearlyRent / unitInfo.squareFootage}
                displayType={'text'}
                thousandSeparator={', '}
                decimalScale={2}
                fixedDecimalScale={true}
            /></td>
            <td className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.removeUnit(unitInfo, unitIndex)}
                    title={"Delete Unit"}
                >
                    <i className="fa fa-minus-square"></i>
                </Button>
            </td>
        </tr>;
    }

    removeUnit(unitInfo, unitIndex)
    {
        this.state.appraisal.units.splice(unitIndex, 1);
        this.setState({appraisal: this.state.appraisal}, () => this.saveDocument(this.state.appraisal));
    }


    createNewUnit(field, value)
    {
        const newUnit = {
            tenancies: [],
            currentTenancy: {}
        };

        if (field)
        {
            newUnit[field] = value;
        }

        if (_.isUndefined(newUnit['unitNumber']))
        {
            newUnit['unitNumber'] = 'new';
        }

        if (_.isUndefined(newUnit['floorNumber']))
        {
            newUnit['floorNumber'] = 1;
        }

        if (_.isUndefined(newUnit['squareFootage']))
        {
            newUnit['squareFootage'] = 1;
        }

        this.state.appraisal.units.push(newUnit);
        this.setState({appraisal: this.state.appraisal}, () => this.saveDocument(this.state.appraisal));

    }


    renderNewUnitRow()
    {
        return <tr className={"unit-row"}>
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewUnit("unitNumber", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewUnit("tenantName", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewUnit("squareFootage", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewUnit("monthlyRent", newValue))}
                />
            </td>
            <td className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.createNewUnit()}
                    title={"New Unit"}
                >
                    <i className="fa fa-plus-square"></i>
                </Button>
            </td>
        </tr>;
    }

    removeTenancy(unitInfo, tenancyInfo, tenancyIndex)
    {
        unitInfo.tenancies.splice(tenancyIndex, 1);
        this.setState({appraisal: this.state.appraisal}, () => this.saveDocument(this.state.appraisal));
    }

    renderTenancy(unitInfo, tenantInfo, tenancyIndex)
    {
        return <tr
            onClick={(evt) => this.onTenantClicked(unitInfo.unitNumber)} className={"tenant-row"}
            key={tenancyIndex}
        >
            <td>
                <FieldDisplayEdit
                    type='text'
                    value={tenantInfo.name}
                    placeholder={"name"}
                    onChange={(newValue) => this.changeTenancyField(this.state.selectedUnit, tenantInfo, 'name', newValue)}/>
            </td>
            <td>
                {
                    tenantInfo.startDate ? <Datetime
                        inputProps={{className: 'form-control'}}
                        dateFormat={"YYYY/MM/DD"}
                        timeFormat={false}
                        onChange={(newValue) => newValue.toDate ? this.changeTenancyField(this.state.selectedUnit, tenantInfo, 'startDate', newValue.toDate()) : null }
                        value={tenantInfo.startDate.$date || tenantInfo.startDate}
                    /> : null
                }
            </td>
            <td>
                {
                    tenantInfo.endDate ? <Datetime
                        inputProps={{className: 'form-control'}}
                        dateFormat={"YYYY/MM/DD"}
                        timeFormat={false}
                        onChange={(newValue) => newValue.toDate ? this.changeTenancyField(this.state.selectedUnit, tenantInfo, 'endDate', newValue.toDate()) : null }
                        value={tenantInfo.endDate.$date || tenantInfo.endDate}/> : null
                }
            </td>
            <td>
                <FieldDisplayEdit
                    type='currency'
                    value={tenantInfo.monthlyRent}
                    placeholder={"monthly rent"}
                    onChange={(newValue) => this.changeTenancyField(this.state.selectedUnit, tenantInfo, 'monthlyRent', newValue)}/>
            </td>

            <td className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.removeTenancy(unitInfo, tenantInfo, tenancyIndex)}
                    title={"New Tenancy"}
                >
                    <i className="fa fa-minus-square"></i>
                </Button>
            </td>
        </tr>;
    }


    createNewTenancy(field, value)
    {
        const newTenancy = {
        };

        if (field)
        {
            newTenancy[field] = value;
        }

        if (_.isUndefined(newTenancy['name']))
        {
            newTenancy['name'] = 'New Tenant';
        }

        if (_.isUndefined(newTenancy['monthlyRent']))
        {
            newTenancy['monthlyRent'] = 0;
        }

        if (_.isUndefined(newTenancy['yearlyRent']))
        {
            newTenancy['yearlyRent'] = 0;
        }

        if (_.isUndefined(newTenancy['startDate']))
        {
            newTenancy['startDate'] = new Date();
        }

        if (_.isUndefined(newTenancy['endDate']))
        {
            newTenancy['endDate'] = new Date();
        }

        this.state.selectedUnit.tenancies.push(newTenancy);
        this.setState({appraisal: this.state.appraisal}, () => this.saveDocument(this.state.appraisal));
    }



    renderNewTenancyRow()
    {
        return <tr className={"tenant-row"}>
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    placeholder={"name"}
                    onChange={_.once((newValue) => this.createNewTenancy("name", newValue))}
                />
            </td>
            <td>
                {
                    <Datetime
                        inputProps={{className: 'form-control'}}
                        dateFormat={"YYYY/MM/DD"}
                        timeFormat={false}
                        onChange={(newValue) => newValue.toDate ? this.createNewTenancy('startDate', newValue.toDate()) : null }
                    />
                }
            </td>
            <td>
                {
                    <Datetime
                        inputProps={{className: 'form-control'}}
                        dateFormat={"YYYY/MM/DD"}
                        timeFormat={false}
                        onChange={(newValue) => newValue.toDate ? this.createNewTenancy('endDate', newValue.toDate()) : null }
                    />
                }
            </td>
            <td>
                <FieldDisplayEdit
                    type='currency'
                    value={""}
                    placeholder={"monthly rent"}
                    onChange={(newValue) => this.createNewTenancy('monthlyRent', newValue)}/>
            </td>

            <td className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.createNewTenancy()}
                    title={"New Tenancy"}
                >
                    <i className="fa fa-plus-square"></i>
                </Button>
            </td>
        </tr>;
    }

    saveDocument(newAppraisal)
    {
        axios.post(`/appraisal/${this.props.match.params.id}`, newAppraisal).then((response) =>
        {
            // this.setState({financialStatement: newLease})
        });
    }

    changeUnitField(unitInfo, field, newValue)
    {
        this.state.appraisal.units.forEach((unit) =>
        {
            if (unit.unitNumber === unitInfo.unitNumber)
            {
                unit[field] = newValue;
            }
        });

        this.saveDocument(this.state.appraisal);
        this.setState({appraisal: this.state.appraisal});
    }

    changeAllTenantField(unitInfo, tenantInfo, field, newValue)
    {
        this.state.appraisal.units.forEach((unit) =>
        {
            if (unit.unitNumber === unitInfo.unitNumber)
            {
                unitInfo.tenancies.forEach((tenancy) =>
                {
                    tenancy[field] = newValue;
                });
                unitInfo.currentTenancy[field] = newValue;
            }
        });

        this.saveDocument(this.state.appraisal);
        this.setState({appraisal: this.state.appraisal});
    }

    changeTenancyField(unitInfo, tenantInfo, field, newValue)
    {
        tenantInfo[field] = newValue;

        // this.state.appraisal.units.forEach((unit) =>
        // {
        //     if (unit.unitNumber === unitInfo.unitNumber)
        //     {
        //         unitInfo.tenancies.forEach((tenancy) =>
        //         {
        //             tenancy[field] = newValue;
        //         });
        //         unitInfo.currentTenancy[field] = newValue;
        //     }
        // });

        this.saveDocument(this.state.appraisal);
        this.setState({appraisal: this.state.appraisal}, () => this.setState({appraisal: this.state.appraisal}));
    }


    render() {
        return (
            (this.state.appraisal) ?
                    <Row>
                        <Col xs={12}>
                            <Card className="card-default">
                                <CardBody>
                                    <div id={"view-tenants"} className={"view-tenants"}>
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
                                            <Col xs={5} md={5} lg={5} xl={5}>
                                                <Card outline color="primary" className="mb-3">
                                                    <CardHeader className="text-white bg-primary">Units</CardHeader>
                                                    <CardBody>
                                                        <Table hover responsive>
                                                            <thead>
                                                            <tr>
                                                                <td><strong>Unit Number</strong></td>
                                                                <td><strong>Tenant Name</strong></td>
                                                                <td><strong>Size (sf)</strong></td>
                                                                <td><strong>Annual Net Rent (psf)</strong></td>
                                                                <td className={"action-column"} />
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {
                                                                this.state.appraisal && this.state.appraisal.units && Object.values(this.state.appraisal.units).map((unit, unitIndex) => {
                                                                    return this.renderUnitRow(unit, unitIndex);
                                                                })
                                                            }
                                                            {
                                                                this.state.appraisal ?
                                                                    this.renderNewUnitRow()
                                                                    : null
                                                            }
                                                            <tr>
                                                                <td>PUT TOTALS HERE</td>
                                                            </tr>
                                                            </tbody>
                                                        </Table>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            {
                                                this.state.selectedUnit ?
                                                    <Col xs={7} md={7} lg={7} xl={7}>
                                                        <Card outline color="primary" className="mb-3">
                                                            <CardHeader className="text-white bg-primary">Tenant Information</CardHeader>
                                                            <CardBody>
                                                                <table className="table">
                                                                    <tbody>
                                                                    <tr>
                                                                        <td>
                                                                            <strong>Unit Number</strong>
                                                                        </td>
                                                                        <td>
                                                                            <FieldDisplayEdit value={this.state.selectedUnit.unitNumber} onChange={(newValue) => this.changeUnitField(this.state.selectedUnit, 'unitNumber', newValue)}/>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <strong>Floor Number</strong>
                                                                        </td>
                                                                        <td>
                                                                            <FieldDisplayEdit value={this.state.selectedUnit.floorNumber} onChange={(newValue) => this.changeUnitField(this.state.selectedUnit, 'floorNumber', newValue)}/>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <strong>Tenant Name</strong>
                                                                        </td>
                                                                        <td>
                                                                            <FieldDisplayEdit value={this.state.selectedUnit.currentTenancy.name} onChange={(newValue) => this.changeAllTenantField(this.state.selectedUnit, this.state.selectedUnit.currentTenancy, 'name', newValue)}/>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <strong>Remarks</strong>
                                                                        </td>
                                                                        <td>
                                                                            <FieldDisplayEdit value={this.state.selectedUnit.remarks} onChange={(newValue) => this.changeUnitField(this.state.selectedUnit, 'remarks', newValue)}/>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <strong>Current Monthly Rent</strong>
                                                                        </td>
                                                                        <td>
                                                                            $<NumberFormat
                                                                            value={this.state.selectedUnit.currentTenancy.monthlyRent}
                                                                            displayType={'text'}
                                                                            thousandSeparator={', '}
                                                                            decimalScale={2}
                                                                            fixedDecimalScale={true}
                                                                        />
                                                                        </td>
                                                                    </tr>
                                                                    </tbody>
                                                                </table>
                                                            </CardBody>
                                                        </Card>
                                                        <Card outline color="primary" className="mb-3">
                                                            <CardHeader className="text-white bg-primary">Tenancy & Escalation Schedule</CardHeader>
                                                            <CardBody>
                                                                <table className="table">
                                                                    <thead>
                                                                    <tr>
                                                                        <td>Tenant Name</td>
                                                                        <td>Term Start</td>
                                                                        <td>Term End</td>
                                                                        <td>Monthly Rent</td>
                                                                        <td className="action-column" />
                                                                    </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                    {
                                                                        this.state.selectedUnit.tenancies.map((tenancy, tenancyIndex) => {
                                                                            return this.renderTenancy(this.state.selectedUnit, tenancy, tenancyIndex);
                                                                        })
                                                                    }
                                                                    {
                                                                        this.renderNewTenancyRow()
                                                                    }
                                                                    </tbody>

                                                                </table>
                                                            </CardBody>
                                                        </Card>
                                                    </Col> : null
                                            }
                                        </Row>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                : null
        );
    }
}

export default ViewTenantsRentRoll;
