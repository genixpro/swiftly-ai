import React from 'react';
import { Row, Col, Button, DropdownItem, DropdownToggle, Dropdown, DropdownMenu, Alert } from 'reactstrap';
import NumberFormat from 'react-number-format';
import _ from 'underscore';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css'
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
        this.props.saveAppraisal(this.props.appraisal);
    }


    onCreateUnit(newUnit)
    {
        this.props.appraisal.units.push(newUnit);
        this.props.saveAppraisal(this.props.appraisal);

    }

    removeTenancy(unitInfo, tenancyInfo, tenancyIndex)
    {
        unitInfo.tenancies.splice(tenancyIndex, 1);
        this.props.saveAppraisal(this.props.appraisal);
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
                    hideIcon={true}
                    value={tenantInfo.name}
                    placeholder={"name"}
                    onChange={(newValue) => this.changeTenancyField(this.state.selectedUnit, tenantInfo, 'name', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='date'
                    hideIcon={true}
                    value={tenantInfo.startDate}
                    placeholder={"Start Date"}
                    onChange={(newValue) => this.changeTenancyField(this.state.selectedUnit, tenantInfo, 'startDate', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='date'
                    hideIcon={true}
                    value={tenantInfo.endDate}
                    placeholder={"End Date"}
                    onChange={(newValue) => this.changeTenancyField(this.state.selectedUnit, tenantInfo, 'endDate', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='rentType'
                    hideIcon={true}
                    value={tenantInfo.rentType}
                    placeholder={"gross/net"}
                    onChange={(newValue) => this.changeTenancyField(this.state.selectedUnit, tenantInfo, 'rentType', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='currency'
                    hideIcon={true}
                    value={tenantInfo.yearlyRentPSF}
                    placeholder={"yearly rent (psf)"}
                    onChange={(newValue) => this.changeTenancyField(this.state.selectedUnit, tenantInfo, 'yearlyRentPSF', newValue)}/>
            </td>

            <td className={"action-column"}>
                <Button
                    color="secondary"
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

        if (_.isUndefined(newTenancy['rentType']))
        {
            newTenancy['rentType'] = 'net';
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
        this.props.saveAppraisal(this.props.appraisal);
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
                <FieldDisplayEdit
                    type='date'
                    placeholder={"Start Date"}
                    hideIcon={true}

                    onChange={(newValue) => newValue.toDate ? this.createNewTenancy('startDate', newValue.toDate()) : null }
                    />
            </td>
            <td>
                <FieldDisplayEdit
                    type='date'
                    placeholder={"End Date"}
                    hideIcon={true}
                    onChange={(newValue) => newValue.toDate ? this.createNewTenancy('endDate', newValue.toDate()) : null }
                    />
            </td>
            <td>
                <FieldDisplayEdit
                    type='currency'
                    value={""}
                    placeholder={"monthly rent"}
                    hideIcon={true}
                    onChange={(newValue) => this.createNewTenancy('monthlyRent', newValue)}/>
            </td>

            <td className={"action-column"}>
                <Button
                    color="secondary"
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

        this.props.saveAppraisal(this.props.appraisal);
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

        this.props.saveAppraisal(this.props.appraisal);
    }

    toggleDownload()
    {
        this.setState({downloadDropdownOpen: !this.state.downloadDropdownOpen})
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

        this.props.saveAppraisal(this.props.appraisal);
    }

    downloadWordRentRoll()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/rent_roll/word`;
    }

    downloadExcelRentRoll()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/rent_roll/excel`;
    }


    render() {
        return (
            (this.props.appraisal) ?
                <div id={"view-tenants-rent-roll"} className={"view-tenants-rent-roll"}>
                    <Row>
                        <Col xs={10}>
                            <h3>View Tenants</h3>
                        </Col>
                        <Col xs={2}>
                            <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggleDownload.bind(this)}>
                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                    Download
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => this.downloadWordRentRoll()}>Rent Roll Summary (docx)</DropdownItem>
                                    <DropdownItem onClick={() => this.downloadExcelRentRoll()}>Rent Roll Spreadsheet (xlsx)</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </Col>
                    </Row>
                    {
                        this.props.appraisal.units.length === 0 ?

                            <Alert color="danger">
                                There is no Rent Roll on file.
                            </Alert>
                             : null
                    }
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
                                                        <FieldDisplayEdit placeholder={"Unit Number"} value={this.state.selectedUnit.unitNumber} onChange={(newValue) => this.changeUnitField(this.state.selectedUnit, 'unitNumber', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Floor Number</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit placeholder={"Floor Number"} value={this.state.selectedUnit.floorNumber} onChange={(newValue) => this.changeUnitField(this.state.selectedUnit, 'floorNumber', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Unit Size</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit placeholder={"Unit Size"} value={this.state.selectedUnit.squareFootage} onChange={(newValue) => this.changeUnitField(this.state.selectedUnit, 'squareFootage', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Tenant Name</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit placeholder={"Tenant Name"} value={this.state.selectedUnit.currentTenancy.name} onChange={(newValue) => this.changeAllTenantField(this.state.selectedUnit, this.state.selectedUnit.currentTenancy, 'name', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Net / Gross</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit type="rentType" value={this.state.selectedUnit.currentTenancy.rentType} onChange={(newValue) => this.changeAllTenantField(this.state.selectedUnit, this.state.selectedUnit.currentTenancy, 'rentType', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Market Rent</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit type="marketRent" placeholder={"Market Rent"} marketRents={this.props.appraisal.marketRents} value={this.state.selectedUnit.marketRent} onChange={(newValue) => this.changeUnitField(this.state.selectedUnit, 'marketRent', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Free Rent Period (months)</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit type="number" placeholder={"Free Rent Period (months)"} value={this.state.selectedUnit.currentTenancy.freeRentMonths} onChange={(newValue) => this.changeTenancyField(this.state.selectedUnit, this.state.selectedUnit.currentTenancy, 'freeRentMonths', newValue)}/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Recovery Structure</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit type="recoveryStructure" placeholder={"Recovery Structure"} recoveryStructures={this.props.appraisal.recoveryStructures} value={this.state.selectedUnit.currentTenancy.recoveryStructure} onChange={(newValue) => this.changeAllTenantField(this.state.selectedUnit, this.state.selectedUnit.currentTenancy, 'recoveryStructure', newValue)} />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Leasing Cost Structure</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit type="leasingCostStructure" placeholder={"Leasing Cost Structure"} leasingCostStructures={this.props.appraisal.leasingCosts} value={this.state.selectedUnit.leasingCostStructure} onChange={(newValue) => this.changeUnitField(this.state.selectedUnit, 'leasingCostStructure', newValue)} />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Remarks</strong>
                                                    </td>
                                                    <td>
                                                        <FieldDisplayEdit value={this.state.selectedUnit.remarks} placeholder={"Remarks"} onChange={(newValue) => this.changeUnitField(this.state.selectedUnit, 'remarks', newValue)}/>
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
