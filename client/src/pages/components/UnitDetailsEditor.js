import React from 'react';
import {Row, Col, Button, DropdownItem, DropdownToggle, Dropdown, DropdownMenu, Alert, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import NumberFormat from 'react-number-format';
import {Link} from "react-router-dom";
import _ from 'underscore';
import FieldDisplayEdit from './FieldDisplayEdit';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css'
import UnitsTable from "./UnitsTable";
import Auth from "../../Auth";
import {TenancyModel, UnitModel} from "../../models/UnitModel";
import CurrencyFormat from "./CurrencyFormat";
import IntegerFormat from "./IntegerFormat";
import moment from "moment/moment";
import PercentFormat from "./PercentFormat";
import AreaFormat from "./AreaFormat";
import Moment from "react-moment";
import PropTypes from "prop-types";
import LeasingCostStructureModel from "../../models/LeasingCostStructureModel";

class UnitDetailsEditor extends React.Component
{
    static instance = 0;

    state = {};

    static propTypes = {
        unit: PropTypes.instanceOf(UnitModel).isRequired
    };

    removeTenancy(tenancyInfo, tenancyIndex)
    {
        this.props.unit.tenancies.splice(tenancyIndex, 1);
        this.props.onChange(this.props.unit);
    }

    renderTenancy(tenantInfo, tenancyIndex)
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
                    onChange={(newValue) => this.changeTenancyField(tenantInfo, 'name', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='date'
                    hideIcon={true}
                    value={tenantInfo.startDate}
                    placeholder={"Start Date"}
                    onChange={(newValue) => this.changeTenancyField(tenantInfo, 'startDate', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='date'
                    hideIcon={true}
                    value={tenantInfo.endDate}
                    placeholder={"End Date"}
                    onChange={(newValue) => this.changeTenancyField(tenantInfo, 'endDate', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='rentType'
                    hideIcon={true}
                    value={tenantInfo.rentType}
                    placeholder={"gross/net"}
                    onChange={(newValue) => this.changeTenancyField(tenantInfo, 'rentType', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='currency'
                    hideIcon={true}
                    value={tenantInfo.yearlyRentPSF}
                    placeholder={"yearly rent (psf)"}
                    onChange={(newValue) => this.changeTenancyField(tenantInfo, 'yearlyRentPSF', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='currency'
                    hideIcon={true}
                    value={tenantInfo.yearlyRent}
                    placeholder={"yearly rent"}
                    onChange={(newValue) => this.changeTenancyField(tenantInfo, 'yearlyRent', newValue)}/>
            </td>
            <td className={"action-column"}>
                {
                    tenancyIndex !== 0 ? <Button
                        color="secondary"
                        onClick={(evt) => this.removeTenancy(tenantInfo, tenancyIndex)}
                        title={"New Tenancy"}
                    >
                        <i className="fa fa-trash-alt"></i>
                    </Button> : null
                }
            </td>
        </tr>;
    }


    createNewTenancy(field, value)
    {
        const newTenancy = TenancyModel.create({}, this.props.unit, "tenancies");

        if (field)
        {
            newTenancy[field] = value;
        }

        this.props.unit.tenancies.push(newTenancy);
        this.props.onChange(this.props.unit);
    }


    renderNewTenancyRow()
    {
        return <tr className={"tenant-row"}
                   key={this.props.unit.tenancies.length}>
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    placeholder={"Name"}
                    onChange={_.once((newValue) => this.createNewTenancy("name", newValue))}
                />
            </td>

            <td>
                <FieldDisplayEdit
                    type='date'
                    placeholder={"Start Date"}
                    hideIcon={true}

                    onChange={(newValue) => newValue.toDate ? this.createNewTenancy('startDate', newValue.toDate()) : null}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type='date'
                    placeholder={"End Date"}
                    hideIcon={true}
                    onChange={(newValue) => newValue.toDate ? this.createNewTenancy('endDate', newValue.toDate()) : null}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type='rentType'
                    value={""}
                    placeholder={"Net vs Gross"}
                    hideIcon={true}
                    onChange={(newValue) => this.createNewTenancy('rentType', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='currency'
                    value={""}
                    placeholder={"Annual rent psf"}
                    hideIcon={true}
                    onChange={(newValue) => this.createNewTenancy('yearlyRentPSF', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='currency'
                    value={""}
                    placeholder={"Annual rent"}
                    hideIcon={true}
                    onChange={(newValue) => this.createNewTenancy('yearlyRent', newValue)}/>
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

    changeUnitField(field, newValue)
    {
        this.props.unit[field] = newValue;

        this.props.onChange(this.props.unit);
    }

    getUnitLeasingCosts()
    {
        for (let leasingCosts of this.props.appraisal.leasingCosts)
        {
            if (leasingCosts.name === this.props.unit.leasingCostStructure)
            {
                return leasingCosts;
            }
        }

        for (let leasingCosts of this.props.appraisal.leasingCosts)
        {
            if (leasingCosts.name === LeasingCostStructureModel.defaultLeasingCostName)
            {
                return leasingCosts;
            }
        }
    }

    ensureUniqueLeasingCosts()
    {
        const currentLeasingCosts = this.getUnitLeasingCosts();
        if (currentLeasingCosts.isDefault)
        {
            // alert("ensuring unique");
            const newLeasingCosts = LeasingCostStructureModel.create({
                name: "New Leasing Structure " + (this.props.appraisal.leasingCosts.length + 1).toString(),
                leasingCommissionPSF: currentLeasingCosts.leasingCommissionPSF,
                tenantInducementsPSF: currentLeasingCosts.tenantInducementsPSF,
                renewalPeriod: currentLeasingCosts.renewalPeriod,
                leasingPeriod: currentLeasingCosts.leasingPeriod
            }, this.props.appraisal.stabilizedStatement, 'leasingCosts');

            this.props.appraisal.leasingCosts.push(newLeasingCosts);
            this.props.unit.leasingCostStructure = newLeasingCosts.name;
            this.props.onChange(this.props.unit);
        }
    }


    changeLeasingCostField(field, newValue)
    {
        this.ensureUniqueLeasingCosts();

        const leasingCostStructure = this.getUnitLeasingCosts();

        console.log(leasingCostStructure);

        leasingCostStructure[field] = newValue;

        this.props.onChange(this.props.unit);
    }

    changeAllTenantField(tenantInfo, field, newValue)
    {
        this.props.appraisal.units.forEach((unit) =>
        {
            if (unit.unitNumber === this.props.unit.unitNumber)
            {
                this.props.unit.tenancies.forEach((tenancy) =>
                {
                    tenancy[field] = newValue;
                });
                this.props.unit.currentTenancy[field] = newValue;
            }
        });

        this.props.onChange(this.props.unit);
    }


    changeTenancyField(tenantInfo, field, newValue)
    {
        tenantInfo[field] = newValue;

        // this.props.appraisal.units.forEach((unit) =>
        // {
        //     if (unit.unitNumber === this.props.unit.unitNumber)
        //     {
        //         this.props.unit.tenancies.forEach((tenancy) =>
        //         {
        //             tenancy[field] = newValue;
        //         });
        //         this.props.unit.currentTenancy[field] = newValue;
        //     }
        // });

        this.props.onChange(this.props.unit);
    }

    calculateDifferentialMonths()
    {
        if (!this.props.unit || this.state.selectedUnitIndex === null)
        {
            return null;
        }

        const marketRentDifferentialStateDate = moment(this.props.appraisal.getEffectiveDate());
        const marketRentDifferentialEndDate = moment(this.props.unit.currentTenancy.endDate);

        const differentialMonths = [];

        const currentDate = marketRentDifferentialStateDate;

        const presentDifferentialPSF = (this.props.unit.currentTenancy.yearlyRent / this.props.unit.squareFootage) - this.props.unit.marketRentAmount;

        const monthlyDifferentialCashflow = (presentDifferentialPSF * this.props.unit.squareFootage) / 12.0;

        const monthlyDiscount = Math.pow(1.0 + (this.props.appraisal.stabilizedStatementInputs.marketRentDifferentialDiscountRate / 100), 1 / 12.0);

        let month = 0;

        while (currentDate.toDate().getTime() <= marketRentDifferentialEndDate.toDate().getTime())
        {
            const totalDiscount = monthlyDiscount ** month;

            const presentValue = monthlyDifferentialCashflow / totalDiscount;

            differentialMonths.push({
                date: currentDate.clone().toDate(),
                month: month,
                currentRent: this.props.unit.currentTenancy.yearlyRent / 12,
                marketRent: this.props.unit.marketRentAmount * this.props.unit.squareFootage / 12,
                presentMonthlyCashFlow: monthlyDifferentialCashflow,
                discount: totalDiscount,
                presentValue: presentValue,

            });

            currentDate.add(1, "months");
            month += 1;
        }

        return differentialMonths;
    }

    render()
    {
        const popoverId = `market-rent-differential-popover`;

        const differentialMonths = this.calculateDifferentialMonths();

        return <Col className={"unit-details-editor"}>

            {
                this.props.appraisal.appraisalType === "detailed" ?
                    <div>
                        {/*<Card outline color="primary" className="mb-3">*/}
                        <h3>Tenancy & Escalation Schedule</h3>
                        {/*<CardHeader className="text-white bg-primary">Tenancy & Escalation Schedule</CardHeader>*/}
                        {/*<CardBody>*/}
                        <table className="table tenancies-table">
                            <thead>
                            <tr>
                                <td>Tenant Name</td>
                                <td>Term Start</td>
                                <td>Term End</td>
                                <td>Net / Gross</td>
                                <td>Annual Rent (psf)</td>
                                <td>Annual Rent</td>
                                <td className="action-column"/>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.props.unit.tenancies.map((tenancy, tenancyIndex) =>
                                {
                                    return this.renderTenancy(tenancy, tenancyIndex);
                                }).concat([this.renderNewTenancyRow()])
                            }
                            </tbody>

                        </table>
                    </div> : null
            }
            <br/>
            <h3>Tenant Information</h3>
            {/*<CardHeader className="text-white bg-primary">Tenant Information</CardHeader>*/}
            {/*<CardBody>*/}
            <table className="table tenant-information-table">
                <tbody>
                <tr>
                    <td>
                        <strong>Unit Number</strong>
                    </td>
                    <td>
                        <FieldDisplayEdit placeholder={"Unit Number"}
                                          value={this.props.unit.unitNumber}
                                          type={"text"}
                                          onChange={(newValue) => this.changeUnitField('unitNumber', newValue)}/>
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Floor Number</strong>
                    </td>
                    <td>
                        <FieldDisplayEdit
                            placeholder={"Floor Number"}
                            value={this.props.unit.floorNumber}
                            onChange={(newValue) => this.changeUnitField('floorNumber', newValue)}
                            type={"number"}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Unit Size</strong>
                    </td>
                    <td>
                        <FieldDisplayEdit type="area" placeholder={"Unit Size"} value={this.props.unit.squareFootage}
                                          onChange={(newValue) => this.changeUnitField('squareFootage', newValue)}/>
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Tenant Name</strong>
                    </td>
                    <td>
                        <FieldDisplayEdit placeholder={"Tenant Name"} value={this.props.unit.currentTenancy.name}
                                          onChange={(newValue) => this.changeAllTenantField(this.props.unit.currentTenancy, 'name', newValue)}/>
                    </td>
                </tr>
                {
                    this.props.appraisal.appraisalType === "simple" ?
                        <tr>
                            <td>
                                <strong>Yearly Rent</strong>
                            </td>
                            <td>
                                <FieldDisplayEdit placeholder={"Yearly Rent"}
                                                  value={this.props.unit.currentTenancy.yearlyRent}
                                                  type={"currency"}
                                                  onChange={(newValue) => this.changeAllTenantField(this.props.unit.currentTenancy, 'yearlyRent', newValue)}/>
                            </td>
                        </tr> : null
                }
                <tr>
                    <td>
                        <strong>Net / Gross</strong>
                    </td>
                    <td>
                        <FieldDisplayEdit type="rentType" value={this.props.unit.currentTenancy.rentType}
                                          onChange={(newValue) => this.changeAllTenantField(this.props.unit.currentTenancy, 'rentType', newValue)}/>
                    </td>
                </tr>
                {
                    this.props.appraisal.appraisalType === "detailed" ?
                        <tr>
                            <td>
                                <strong>Market Rent</strong>
                            </td>
                            <td>
                                <FieldDisplayEdit type="marketRent" placeholder={"Market Rent"} marketRents={this.props.appraisal.marketRents}
                                                  value={this.props.unit.marketRent}
                                                  onChange={(newValue) => this.changeUnitField('marketRent', newValue)}/>
                            </td>
                        </tr> : null
                }
                {
                    this.props.appraisal.appraisalType === "detailed" ?
                        <tr>
                            <td>
                                <strong>Free Rent Period (months)</strong>
                            </td>
                            <td>
                                <FieldDisplayEdit type="months" placeholder={"Free Rent Period (months)"}
                                                  value={this.props.unit.currentTenancy.freeRentMonths}
                                                  onChange={(newValue) => this.changeTenancyField(this.props.unit.currentTenancy, 'freeRentMonths', newValue)}/>
                            </td>
                        </tr> : null
                }
                {
                    this.props.appraisal.appraisalType === "detailed" ?
                        <tr>
                            <td>
                                <strong>Free Rent Type</strong>
                            </td>
                            <td>
                                <FieldDisplayEdit type="rentType"
                                                  value={this.props.unit.currentTenancy.freeRentType}
                                                  onChange={(newValue) => this.changeAllTenantField(this.props.unit.currentTenancy, 'freeRentType', newValue)}/>
                            </td>
                        </tr> : null
                }
                {
                    this.props.appraisal.appraisalType === "detailed" ?
                        <tr>
                            <td>
                                <strong>Recovery Structure</strong>
                            </td>
                            <td>
                                <FieldDisplayEdit type="recoveryStructure" placeholder={"Recovery Structure"}
                                                  recoveryStructures={this.props.appraisal.recoveryStructures}
                                                  value={this.props.unit.currentTenancy.recoveryStructure}
                                                  onChange={(newValue) => this.changeAllTenantField(this.props.unit.currentTenancy, 'recoveryStructure', newValue)}/>
                            </td>
                        </tr> : null
                }
                {
                    this.props.appraisal.appraisalType === "detailed" ?
                        <tr>
                            <td>
                                <strong>Leasing Cost Structure</strong>
                            </td>
                            <td>
                                <FieldDisplayEdit type="leasingCostStructure" placeholder={"Leasing Cost Structure"}
                                                  leasingCostStructures={this.props.appraisal.leasingCosts}
                                                  value={this.props.unit.leasingCostStructure}
                                                  onChange={(newValue) => this.changeUnitField('leasingCostStructure', newValue)}/>
                            </td>
                        </tr> : null
                }
                <tr>
                    <td>
                        <strong>Remarks</strong>
                    </td>
                    <td>
                        <FieldDisplayEdit value={this.props.unit.remarks} placeholder={"Remarks"}
                                          onChange={(newValue) => this.changeUnitField('remarks', newValue)}/>
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Consider as Vacant Unit</strong>
                    </td>
                    <td style={{"paddingTop": "10px", "paddingLeft": "15px", "paddingBottom": "10px"}}>
                        <FieldDisplayEdit
                            value={this.props.unit.isVacantForStabilizedStatement}
                            type={"boolean"}
                            hideIcon={true}
                            placeholder={"Treat Unit as Vacant?"}
                            onChange={(newValue) => this.changeUnitField('shouldTreatAsVacant', newValue)}
                        />
                    </td>
                </tr>
                {
                    this.props.appraisal.appraisalType === 'simple' && this.props.unit.isVacantForStabilizedStatement ?
                        <tr>
                            <td>
                                <strong>Leasing Costs (psf)</strong>
                            </td>
                            <td>
                                <FieldDisplayEdit placeholder={"Leasing Costs (psf)"}
                                                  value={this.getUnitLeasingCosts().leasingCommissionPSF}
                                                  type={"currency"}
                                                  onChange={(newValue) => this.changeLeasingCostField('leasingCommissionPSF', newValue)}/>
                            </td>
                        </tr> : null
                }
                {
                    this.props.appraisal.appraisalType === 'simple' && this.props.unit.isVacantForStabilizedStatement ?
                        <tr>
                            <td>
                                <strong>Tenant Inducements (psf)</strong>
                            </td>
                            <td>
                                <FieldDisplayEdit placeholder={"Leasing Costs (psf)"}
                                                  value={this.getUnitLeasingCosts().tenantInducementsPSF}
                                                  type={"currency"}
                                                  onChange={(newValue) => this.changeLeasingCostField('tenantInducementsPSF', newValue)}/>
                            </td>
                        </tr> : null
                }
                {
                    this.props.appraisal.appraisalType === 'simple' && this.props.unit.isVacantForStabilizedStatement ?
                        <tr>
                            <td>
                                <strong>Renewal Period</strong>
                            </td>
                            <td>
                                <FieldDisplayEdit placeholder={"Leasing Renewal Period"}
                                                  value={this.getUnitLeasingCosts().renewalPeriod}
                                                  type={"months"}
                                                  onChange={(newValue) => this.changeLeasingCostField('renewalPeriod', newValue)}/>
                            </td>
                        </tr> : null
                }
                <tr>
                    <td colSpan={2}>
                        <br/>
                        <h3>Financials</h3>
                    </td>
                </tr>
                <tr className={"stats-row"}>
                    <td>
                        <strong>Stabilized Annual Rent</strong>
                    </td>
                    <td className={"stabilized-rent-column"}>
                                                        <span style={{"marginLeft": "10px"}}>
                                                            <CurrencyFormat value={this.props.unit.stabilizedRent} cents={false}/>
                                                        </span>

                        <div className={"use-market-rent-selector-container"}>
                            {
                                this.props.unit.marketRent ?
                                    <div className={"use-market-rent-selector"}>
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        <strong>Apply Market Rent</strong>
                                        <FieldDisplayEdit hideIcon={true} type="boolean"
                                                          placeholder={"Use Market Rent for Stabilized Statement?"}
                                                          value={this.props.unit.shouldUseMarketRent}
                                                          onChange={(newValue) => this.changeUnitField('shouldUseMarketRent', newValue)}/>
                                        <br/>
                                    </div> : null
                            }
                            {
                                this.props.unit.marketRent ?
                                    <div className={"use-market-rent-selector"}>
                                        <strong>Apply Market Rent Differential</strong>
                                        <FieldDisplayEdit hideIcon={true} type="boolean" placeholder={"Apply Market Rent Differential?"}
                                                          value={this.props.unit.shouldApplyMarketRentDifferential}
                                                          onChange={(newValue) => this.changeUnitField('shouldApplyMarketRentDifferential', newValue)}/>
                                    </div> : null
                            }
                        </div>
                    </td>
                </tr>
                {
                    this.props.unit.calculatedManagementRecovery ?
                        <tr className={"stats-row"}>
                            <td>
                                {
                                    this.props.appraisal.appraisalType === 'detailed' ?
                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                            <strong>Calculated Management Recovery</strong>
                                        </Link> :
                                        <strong>Calculated Management Recovery</strong>
                                }
                            </td>
                            <td>
                                    <span style={{"marginLeft": "10px"}}>
                                    {
                                        this.props.appraisal.appraisalType === 'detailed' ?
                                            <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                                <CurrencyFormat value={this.props.unit.calculatedManagementRecovery}/>
                                            </Link> :
                                            <CurrencyFormat value={this.props.unit.calculatedManagementRecovery}/>
                                    }
                                    </span>
                            </td>
                        </tr> : null
                }

                {
                    this.props.unit.calculatedExpenseRecovery ?
                        <tr className={"stats-row"}>
                            <td>
                                {
                                    this.props.appraisal.appraisalType === 'detailed' ?
                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                            <strong>Calculated Operating Expense Recovery</strong>
                                        </Link> :
                                        <strong>Calculated Operating Expense Recovery</strong>
                                }
                            </td>
                            <td>
                                                        <span style={{"marginLeft": "10px"}}>
                                                        {this.props.appraisal.appraisalType === 'detailed' ?
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                                                <CurrencyFormat
                                                                    value={this.props.unit.calculatedExpenseRecovery}/>
                                                            </Link> :
                                                            <CurrencyFormat
                                                                value={this.props.unit.calculatedExpenseRecovery}/>
                                                        }
                                                        </span>
                            </td>
                        </tr> : null
                }
                {
                    this.props.unit.calculatedTaxRecovery ?
                        <tr className={"stats-row"}>
                            <td>
                                {
                                    this.props.appraisal.appraisalType === 'detailed' ?
                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                            <strong>Calculated Tax Recovery</strong>
                                        </Link> :
                                        <strong>Calculated Tax Recovery</strong>
                                }
                            </td>
                            <td>
                                {
                                    this.props.appraisal.appraisalType === 'detailed' ?
                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                                        <span style={{"marginLeft": "10px"}}>
                                                            <CurrencyFormat
                                                                value={this.props.unit.calculatedTaxRecovery}/>
                                                        </span>
                                        </Link> :
                                        <span style={{"marginLeft": "10px"}}>
                                                            <CurrencyFormat
                                                                value={this.props.unit.calculatedTaxRecovery}/>
                                                        </span>
                                }
                            </td>
                        </tr> : null
                }
                {
                    this.props.unit.calculatedMarketRentDifferential ?
                        <tr className={"stats-row"}>
                            <td>
                                <a onClick={() => this.setState({marketRentDifferentialPopoverOpen: !this.state.marketRentDifferentialPopoverOpen})}>
                                    <strong>Calculated Market Rent Differential</strong>
                                </a>
                            </td>
                            <td>

                                <a id={popoverId}
                                   onClick={() => this.setState({marketRentDifferentialPopoverOpen: !this.state.marketRentDifferentialPopoverOpen})}>
                                                        <span style={{"marginLeft": "10px"}}>
                                                            <CurrencyFormat
                                                                value={this.props.unit.calculatedMarketRentDifferential}/>
                                                        </span>
                                </a>
                                <Popover placement="bottom" isOpen={this.state.marketRentDifferentialPopoverOpen} target={popoverId}
                                         toggle={() => this.setState({marketRentDifferentialPopoverOpen: !this.state.marketRentDifferentialPopoverOpen})}>
                                    <PopoverHeader>Unit {this.props.unit.unitNumber} - Market Rent Differential</PopoverHeader>
                                    <PopoverBody>
                                        <table className={"explanation-popover-table"}>
                                            <thead>
                                            <tr className={"total-row"}>
                                                <td colSpan={2}></td>
                                                <td colSpan={2}>
                                                    PSF
                                                </td>
                                                <td>Annual</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr className={"total-row"}>
                                                <td colSpan={2}>Contract Rent</td>
                                                <td colSpan={2}>
                                                    <CurrencyFormat value={differentialMonths[0].currentRent * 12 / this.props.unit.squareFootage}/>
                                                </td>
                                                <td>
                                                    <CurrencyFormat value={differentialMonths[0].currentRent * 12}/>
                                                </td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr className={"total-row"}>
                                                <td colSpan={2}>Market Rent</td>
                                                <td colSpan={2}>
                                                    <CurrencyFormat value={differentialMonths[0].marketRent * 12 / this.props.unit.squareFootage}/>
                                                </td>
                                                <td>
                                                    <CurrencyFormat value={differentialMonths[0].marketRent * 12}/>
                                                </td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr className={"total-row"}>
                                                <td colSpan={2}>Differential</td>
                                                <td colSpan={2}>
                                                    <CurrencyFormat value={differentialMonths[0].presentMonthlyCashFlow * 12 / this.props.unit.squareFootage}/>
                                                </td>
                                                <td>
                                                    <CurrencyFormat value={differentialMonths[0].presentMonthlyCashFlow * 12}/>
                                                </td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr className={"total-row"}>
                                                <td colSpan={2}><strong>Present Value</strong></td>
                                                <td colSpan={3}><CurrencyFormat value={this.props.unit.calculatedMarketRentDifferential}/></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr className={"total-row"}>
                                                <td colSpan={2}>Discount Rate</td>
                                                <td colSpan={3}>
                                                    <FieldDisplayEdit
                                                        type={"percent"}
                                                        placeholder={"Market Rent Differential Discount Rate"}
                                                        value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.marketRentDifferentialDiscountRate : 5.0}
                                                        onChange={(newValue) => this.changeStabilizedInput("marketRentDifferentialDiscountRate", newValue)}
                                                    />
                                                </td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    Date
                                                </td>
                                                <td>
                                                    Month
                                                </td>
                                                <td>
                                                    Actual Rent
                                                </td>
                                                <td>
                                                    Market Rent
                                                </td>
                                                <td>
                                                    Differential
                                                </td>
                                                <td>
                                                    Present Value
                                                </td>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                differentialMonths.map((differential, index) =>
                                                {
                                                    let className = "";

                                                    if (index === differentialMonths.length - 1)
                                                    {
                                                        className = "underline";
                                                    }

                                                    return <tr key={index}>
                                                        <td>
                                                            <Moment date={differential.date} format="MMM YYYY"/>
                                                        </td>
                                                        <td>
                                                            <IntegerFormat value={differential.month}/>
                                                        </td>
                                                        <td>
                                                            <CurrencyFormat value={differential.currentRent}/>
                                                        </td>
                                                        <td>
                                                            <CurrencyFormat value={differential.marketRent}/>
                                                        </td>
                                                        <td>
                                                            <CurrencyFormat value={differential.presentMonthlyCashFlow}/>
                                                        </td>
                                                        <td className={className}>
                                                            <CurrencyFormat value={differential.presentValue}/>
                                                        </td>
                                                    </tr>
                                                })
                                            }
                                            <tr className={"total-row"}>
                                                <td></td>
                                                <td></td>
                                                <td colSpan={3}><strong>Present Value</strong></td>
                                                <td><CurrencyFormat value={this.props.unit.calculatedMarketRentDifferential}/></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </PopoverBody>
                                </Popover>
                            </td>
                        </tr> : null
                }
                {
                    this.props.unit.calculatedFreeRentLoss ?
                        <tr className={"stats-row"}>
                            <td>
                                <a onClick={() => this.setState({freeRentLossPopoverOpen: !this.state.freeRentLossPopoverOpen})}>
                                    <strong>Calculated Free Rent Loss</strong>
                                </a>
                            </td>
                            <td>
                                    <span style={{"marginLeft": "10px"}}>
                                        <a id={"free-rent-loss-popover"}
                                           onClick={() => this.setState({freeRentLossPopoverOpen: !this.state.freeRentLossPopoverOpen})}>
                                            {
                                                this.props.unit.calculatedFreeRentLoss ?
                                                    <CurrencyFormat value={this.props.unit.calculatedFreeRentLoss}/>
                                                    : null
                                            }
                                        </a>
                                        <Popover placement="bottom" isOpen={this.state.freeRentLossPopoverOpen} target={"free-rent-loss-popover"}
                                                 toggle={() => this.setState({freeRentLossPopoverOpen: !this.state.freeRentLossPopoverOpen})}>
                                            <PopoverHeader>Free Rent Loss</PopoverHeader>
                                            <PopoverBody>
                                                <table className={"explanation-popover-table"}>
                                                    <tbody>
                                                    <tr className={"total-row"}>
                                                        <td>Free Rent Loss</td>
                                                        <td><IntegerFormat value={this.props.unit.calculatedFreeRentMonths}/> months remaining</td>
                                                        <td>/</td>
                                                        <td>12</td>
                                                        <td>*</td>
                                                        <td><CurrencyFormat value={this.props.unit.calculatedFreeRentNetAmount}/></td>
                                                        <td>=</td>
                                                        <td><CurrencyFormat value={this.props.unit.calculatedFreeRentLoss} cents={false}/></td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </PopoverBody>
                                        </Popover>
                                    </span>
                            </td>
                        </tr> : null
                }
                {
                    this.props.unit.calculatedVacantUnitRentLoss ?
                        <tr className={"stats-row"}>
                            <td>
                                {
                                    this.props.appraisal.appraisalType === 'detailed' ?
                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                            <strong>Calculated Vacant Unit Rent Loss</strong>
                                        </Link> :
                                        <strong>Calculated Vacant Unit Rent Loss</strong>
                                }
                            </td>
                            <td>
                                {
                                    this.props.appraisal.appraisalType === 'detailed' ?
                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                            <span style={{"marginLeft": "10px"}}>
                                                <CurrencyFormat value={this.props.unit.calculatedVacantUnitRentLoss}/>
                                            </span>
                                        </Link> :
                                        <span style={{"marginLeft": "10px"}}>
                                            <CurrencyFormat value={this.props.unit.calculatedVacantUnitRentLoss}/>
                                        </span>
                                }
                            </td>
                        </tr> : null
                }
                {
                    this.props.unit.calculatedVacantUnitLeasupCosts ?
                        <tr className={"stats-row"}>
                            <td>
                                {
                                    this.props.appraisal.appraisalType === 'detailed' ?
                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                            <strong>Calculated Vacant Unit Leaseup Costs</strong>
                                        </Link> :
                                        <strong>Calculated Vacant Unit Leaseup Costs</strong>
                                }
                            </td>
                            <td>
                                {
                                    this.props.appraisal.appraisalType === 'detailed' ?
                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                                        <span style={{"marginLeft": "10px"}}>
                                                            <CurrencyFormat
                                                                value={this.props.unit.calculatedVacantUnitLeasupCosts}/>
                                                        </span>
                                        </Link> :
                                        <span style={{"marginLeft": "10px"}}>
                                                            <CurrencyFormat
                                                                value={this.props.unit.calculatedVacantUnitLeasupCosts}/>
                                                        </span>
                                }

                            </td>
                        </tr> : null
                }
                </tbody>
            </table>
            {/*</CardBody>*/}
            {/*</Card>*/}
            {/*<Card outline color="primary" className="mb-3">*/}
            {/*</CardBody>*/}
            {/*</Card>*/}
        </Col>
    }
}

export default UnitDetailsEditor;
