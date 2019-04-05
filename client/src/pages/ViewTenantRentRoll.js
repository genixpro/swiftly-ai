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
import UnitsTable from "./components/UnitsTable";

class ViewTenantsRentRoll extends React.Component
{
    state = {
        selectedUnit: null
    };

    onUnitClicked(unit)
    {
        this.setState({selectedUnit: unit})
    }

    onRemoveUnit(unitIndex)
    {
        this.props.appraisal.units.splice(unitIndex, 1);
        this.props.saveDocument(this.props.appraisal);
    }


    onCreateUnit(newUnit)
    {
        this.props.appraisal.units.push(newUnit);
        this.props.saveDocument(this.props.appraisal);

    }

    removeTenancy(unitInfo, tenancyInfo, tenancyIndex)
    {
        unitInfo.tenancies.splice(tenancyIndex, 1);
        this.props.saveDocument(this.props.appraisal);
    }

    renderTenancy(unitInfo, tenantInfo, tenancyIndex)
    {
        return <tr
            className={"tenant-row"}
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
                    type='rentType'
                    value={tenantInfo.rentType}
                    placeholder={"gross/net"}
                    onChange={(newValue) => this.changeTenancyField(this.state.selectedUnit, tenantInfo, 'rentType', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='currency'
                    value={tenantInfo.yearlyRentPSF}
                    placeholder={"yearly rent (psf)"}
                    onChange={(newValue) => this.changeTenancyField(this.state.selectedUnit, tenantInfo, 'yearlyRentPSF', newValue)}/>
            </td>

            <td className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.removeTenancy(unitInfo, tenantInfo, tenancyIndex)}
                    title={"New Tenancy"}
                >
                    <i className="fa fa-trash-alt"></i>
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
        this.props.saveDocument(this.props.appraisal);
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

    changeUnitField(unitInfo, field, newValue)
    {
        this.props.appraisal.units.forEach((unit) =>
        {
            if (unit.unitNumber === unitInfo.unitNumber)
            {
                unit[field] = newValue;
            }
        });

        this.props.saveDocument(this.props.appraisal);
    }

    changeAllTenantField(unitInfo, tenantInfo, field, newValue)
    {
        this.props.appraisal.units.forEach((unit) =>
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

        this.props.saveDocument(this.props.appraisal);
    }

    changeTenancyField(unitInfo, tenantInfo, field, newValue)
    {
        tenantInfo[field] = newValue;

        // this.props.appraisal.units.forEach((unit) =>
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

        this.props.saveDocument(this.props.appraisal);
    }

    render() {
        return (
            (this.props.appraisal) ?
                <div id={"view-tenants-rent-roll"} className={"view-tenants-rent-roll"}>
                    <Row>
                        <Col xs={5} md={5} lg={5} xl={5}>
                            <UnitsTable
                                appraisal={this.props.appraisal}
                                selectedUnit={this.state.selectedUnit}
                                onUnitClicked={(unit) => this.onUnitClicked(unit)}
                                onRemoveUnit={(unitIndex) => this.onRemoveUnit(unitIndex)}
                                onCreateUnit={(newUnit) => this.onCreateUnit(newUnit)}
                            />
                        </Col>
                        {
                            this.state.selectedUnit ?
                                <Col xs={7} md={7} lg={7} xl={7}>
                                    {/*<Card outline color="primary" className="mb-3">*/}
                                    <h3>Tenant Information</h3>
                                        {/*<CardHeader className="text-white bg-primary">Tenant Information</CardHeader>*/}
                                        {/*<CardBody>*/}
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
                                                        <strong>Rent Type</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit type="rentType" value={this.state.selectedUnit.currentTenancy.rentType} onChange={(newValue) => this.changeAllTenantField(this.state.selectedUnit, this.state.selectedUnit.currentTenancy, 'rentType', newValue)}/>
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
                                                        <strong>Current Yearly Rent (psf)</strong>
                                                    </td>
                                                    <td>
                                                        $<NumberFormat
                                                        value={this.state.selectedUnit.currentTenancy.yearlyRentPSF}
                                                        displayType={'text'}
                                                        thousandSeparator={', '}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                    />
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        {/*</CardBody>*/}
                                    {/*</Card>*/}
                                    {/*<Card outline color="primary" className="mb-3">*/}
                                    <br/>
                                    <h3>Tenancy & Esclation Schedule</h3>
                                        {/*<CardHeader className="text-white bg-primary">Tenancy & Escalation Schedule</CardHeader>*/}
                                        {/*<CardBody>*/}
                                            <table className="table tenancies-table">
                                                <thead>
                                                <tr>
                                                    <td>Tenant Name</td>
                                                    <td>Term Start</td>
                                                    <td>Term End</td>
                                                    <td>Net / Gross</td>
                                                    <td>Yearly Rent (psf)</td>
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
                                        {/*</CardBody>*/}
                                    {/*</Card>*/}
                                </Col> : null
                        }
                    </Row>
                </div>
                : null
        );
    }
}

export default ViewTenantsRentRoll;
