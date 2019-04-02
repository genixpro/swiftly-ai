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

    onTenantClicked(unitNum)
    {
        this.props.appraisal.units.forEach((unit) =>
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
            selectedClass = " selected-unit-row";
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
                    <i className="fa fa-trash-alt"></i>
                </Button>
            </td>
        </tr>;
    }

    removeUnit(unitInfo, unitIndex)
    {
        this.props.appraisal.units.splice(unitIndex, 1);
        this.props.saveDocument(this.props.appraisal);
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

        this.props.appraisal.units.push(newUnit);
        this.props.saveDocument(this.props.appraisal);

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
        this.props.saveDocument(this.props.appraisal);
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

    getTotalSize()
    {
        let total = 0;
        for(let unit of this.props.appraisal.units)
        {
            total += unit.squareFootage;
        }
        return total;
    }

    getAverageSize()
    {
        let total = 0;
        let count = 0;
        for(let unit of this.props.appraisal.units)
        {
            if (unit.squareFootage !== 0)
            {
                total += unit.squareFootage;
                count += 1;
            }
        }
        return total / count;
    }

    getAverageRentPSF()
    {
        let total = 0;
        let count = 0;
        for(let unit of this.props.appraisal.units)
        {
            if (unit.currentTenancy.yearlyRent !== 0)
            {
                total += unit.currentTenancy.yearlyRent / unit.squareFootage;
                count += 1;
            }
        }
        return total / count;
    }

    getMinimumSize()
    {
        let minSize = null;
        for(let unit of this.props.appraisal.units)
        {
            if (unit.squareFootage !== 0)
            {
                if (minSize === null || unit.squareFootage < minSize)
                {
                    minSize = unit.squareFootage;
                }
            }
        }
        return minSize;
    }

    getMaximumSize()
    {
        let maxSize = null;
        for(let unit of this.props.appraisal.units)
        {
            if (unit.squareFootage !== 0)
            {
                if (maxSize === null || unit.squareFootage > maxSize)
                {
                    maxSize = unit.squareFootage;
                }
            }
        }
        return maxSize;
    }

    getMinimumRentPSF()
    {
        let minRentPSF = null;
        for(let unit of this.props.appraisal.units)
        {
            if (unit.currentTenancy.yearlyRent !== 0)
            {
                const rentPSF = unit.currentTenancy.yearlyRent / unit.squareFootage;
                if (minRentPSF === null || rentPSF < minRentPSF)
                {
                    minRentPSF = rentPSF;
                }
            }
        }
        return minRentPSF;
    }

    getMaximumRentPSF()
    {
        let maxRentPSF = null;
        for(let unit of this.props.appraisal.units)
        {
            if (unit.currentTenancy.yearlyRent !== 0)
            {
                const rentPSF = unit.currentTenancy.yearlyRent / unit.squareFootage;
                if (maxRentPSF === null || rentPSF > maxRentPSF)
                {
                    maxRentPSF = rentPSF;
                }
            }
        }
        return maxRentPSF;
    }


    render() {
        return (
            (this.props.appraisal) ?
                <div id={"view-tenants-rent-roll"} className={"view-tenants-rent-roll"}>
                    <Row>
                        <Col xs={5} md={5} lg={5} xl={5}>
                            {/*<Card outline color="primary" className="mb-3">*/}
                                {/*<CardHeader className="text-white bg-primary">Units</CardHeader>*/}
                                {/*<CardBody>*/}
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
                                            this.props.appraisal && this.props.appraisal.units && Object.values(this.props.appraisal.units).map((unit, unitIndex) => {
                                                return this.renderUnitRow(unit, unitIndex);
                                            })
                                        }
                                        {
                                            this.props.appraisal ?
                                                this.renderNewUnitRow()
                                                : null
                                        }
                                        <tr>
                                            <td></td>
                                            <td><strong>Total</strong></td>
                                            <td>
                                                <NumberFormat
                                                    value={this.getTotalSize()}
                                                    displayType={'text'}
                                                    thousandSeparator={', '}
                                                    decimalScale={0}
                                                    fixedDecimalScale={true}
                                                />
                                            </td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td><strong>Average</strong></td>
                                            <td>
                                                <NumberFormat
                                                value={this.getAverageSize()}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={0}
                                                fixedDecimalScale={true}
                                            />
                                            </td>
                                            <td>
                                                $<NumberFormat
                                                value={this.getAverageRentPSF()}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td><strong>Range</strong></td>
                                            <td>
                                                <NumberFormat
                                                value={this.getMinimumSize()}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={0}
                                                fixedDecimalScale={true}
                                            />&nbsp;-&nbsp;
                                                <NumberFormat
                                                value={this.getMaximumSize()}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={0}
                                                fixedDecimalScale={true}
                                            />
                                            </td>
                                            <td>
                                                $<NumberFormat
                                                value={this.getMinimumRentPSF()}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />&nbsp;-&nbsp;
                                                $<NumberFormat
                                                value={this.getMaximumRentPSF()}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />
                                            </td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                {/*</CardBody>*/}
                            {/*</Card>*/}
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
                                        {/*</CardBody>*/}
                                    {/*</Card>*/}
                                    {/*<Card outline color="primary" className="mb-3">*/}
                                    <br/>
                                    <h3>Tenancy & Esclation Schedule</h3>
                                        {/*<CardHeader className="text-white bg-primary">Tenancy & Escalation Schedule</CardHeader>*/}
                                        {/*<CardBody>*/}
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