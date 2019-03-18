import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table, Button } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';
import Moment from 'react-moment';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';

class ViewTenants extends React.Component
{
    state = {
        capitalizationRate: 8.4,
        selectedUnit: null
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.match.params.id}`).then((response) =>
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
            <td>{unitInfo.floorNumber}</td>
            <td><NumberFormat
                value={unitInfo.squareFootage}
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
        return <tr>
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
                    onChange={_.once((newValue) => this.createNewUnit("floorNumber", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewUnit("squareFootage", newValue))}
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

    renderTenancy(unitInfo, tenantInfo)
    {
        return <tr onClick={(evt) => this.onTenantClicked(unitInfo.unitNumber)} className={"tenant-row"}>
            <td>{tenantInfo.name}</td>
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
                <div id={"view-tenants"} className={"view-tenants"}>
                    <Row>
                        <Col xs={4} md={4} lg={4} xl={4}>
                            <Card outline color="primary" className="mb-3">
                                <CardHeader className="text-white bg-primary">Units</CardHeader>
                                <CardBody>
                                    <Table hover responsive>
                                        <thead>
                                            <tr>
                                                <td><strong>Unit Number</strong></td>
                                                <td><strong>Floor</strong></td>
                                                <td><strong>Size</strong></td>
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
                                        </tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </Col>
                        {
                            this.state.selectedUnit ?
                                <Col xs={8} md={8} lg={8} xl={8}>
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
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                {
                                                    this.state.selectedUnit.tenancies.map((tenancy) => {
                                                        return this.renderTenancy(this.state.selectedUnit, tenancy);
                                                    })
                                                }
                                                </tbody>

                                            </table>
                                        </CardBody>
                                    </Card>
                                </Col> : null
                        }
                    </Row>
                </div>
                : null
        );
    }
}

export default ViewTenants;
