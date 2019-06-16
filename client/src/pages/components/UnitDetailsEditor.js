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
import PropTypes from "prop-types";
import LeasingCostStructureModel from "../../models/LeasingCostStructureModel";
import MarketRentModel from "../../models/MarketRentModel";
import LeasingCostsForUnitCalculationPopoverWrapper from "./LeasingCostsForUnitCalculationPopoverWrapper";
import VacantRentLossForUnitCalculationPopoverWrapper from "./VacantRentLossForUnitCalculationPopoverWrapper";
import MarketRentDifferentialForUnitCalculationPopoverWrapper from "./MarketRentDifferentialForUnitCalculationPopoverWrapper";
import FreeRentLossForUnitCalculationPopoverWrapper from "./FreeRentLossForUnitCalculationPopoverWrapper";
import ExpenseRecoveryForUnitCalculationPopoverWrapper from "./ExpenseRecoveryForUnitCalculationPopoverWrapper";
import ManagementRecoveriesForUnitCalculationPopoverWrapper from "./ManagementRecoveriesForUnitCalculationPopoverWrapper";

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


    getUnitMarketRent()
    {
        for (let marketRent of this.props.appraisal.marketRents)
        {
            if (marketRent.name === this.props.unit.marketRent)
            {
                return marketRent;
            }
        }

        return null;
    }

    ensureUniqueMarketRent()
    {
        const currentMarketRent = this.getUnitMarketRent();
        if (currentMarketRent === null)
        {
            // alert("ensuring unique");
            const marketRent = MarketRentModel.create({
                name: "New Leasing Structure " + (this.props.appraisal.leasingCosts.length + 1).toString(),
                amountPSF: this.props.unit.currentTenancy.yearlyRent / this.props.unit.squareFootage
            }, this.props.appraisal.stabilizedStatement, 'marketRents');

            this.props.appraisal.marketRents.push(marketRent);
            this.props.unit.marketRent = marketRent.name;
            this.props.onChange(this.props.unit);
        }
    }


    changeMarketRentField(field, newValue)
    {
        this.ensureUniqueMarketRent();

        if (field === 'amountPSF' && newValue === null)
        {
            for (let marketRent of this.props.appraisal.marketRents)
            {
                if (marketRent.name === this.props.unit.marketRent)
                {
                    this.props.appraisal.marketRents.splice(this.props.appraisal.marketRents.indexOf(marketRent), 1);
                }
            }
            this.props.unit.marketRent = null;

            this.props.onChange(this.props.unit);
        }
        else
        {
            const marketRent = this.getUnitMarketRent();

            marketRent[field] = newValue;

            this.props.onChange(this.props.unit);
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
            }, this.props.appraisal, 'leasingCosts');

            this.props.appraisal.leasingCosts.push(newLeasingCosts);
            this.props.unit.leasingCostStructure = newLeasingCosts.name;
            this.props.onChange(this.props.unit);
        }
    }


    changeLeasingCostField(field, newValue)
    {
        this.ensureUniqueLeasingCosts();

        const leasingCostStructure = this.getUnitLeasingCosts();

        leasingCostStructure[field] = newValue;

        this.props.onChange(this.props.unit);
    }

    changeAllTenantField(field, newValue)
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

    changeStabilizedInput(field, newValue)
    {
        this.props.appraisal.stabilizedStatementInputs[field] = newValue;
        this.props.onChange(this.props.unit);
    }


    render()
    {
        const popoverId = `market-rent-differential-popover`;

        return <Col className={"unit-details-editor"}>
                <div>
                    {/*<Card outline color="primary" className="mb-3">*/}
                    <h4 className={"unit-section-title"}>Tenancy & Escalation Schedule</h4>
                </div>
                <table>
                    <tbody>
                    <tr className={"stats-row"}>
                        <td>
                            <strong>Current Annual Rent (psf)</strong>
                        </td>
                        <td className={"stabilized-rent-column"}>
                                                            <span style={{"marginLeft": "10px"}}>
                                                                <CurrencyFormat value={this.props.unit.squareFootage ? this.props.unit.stabilizedRent / this.props.unit.squareFootage : null} cents={true}/>
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
                            </div>
                        </td>
                    </tr>
                    <tr className={"stats-row"}>
                        <td>
                            <strong>Current Annual Rent</strong>
                        </td>
                        <td className={"stabilized-rent-column"}>
                                                            <span style={{"marginLeft": "10px"}}>
                                                                <CurrencyFormat value={this.props.unit.stabilizedRent} cents={false}/>
                                                            </span>

                            <div className={"use-market-rent-selector-container"}>
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
                    </tbody>
                </table>
                <br/>
                <div>
                    {/*<Card outline color="primary" className="mb-3">*/}
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
                </div>
            <br/>
            <h4 className={"unit-section-title"}>Tenant Information</h4>
            {/*<CardHeader className="text-white bg-primary">Tenant Information</CardHeader>*/}
            {/*<CardBody>*/}
            <table className="table tenant-information-table">
                <tbody>
                <tr>
                    <td>
                        <strong>Tenant Name</strong>
                    </td>
                    <td>
                        <FieldDisplayEdit placeholder={"Tenant Name"} value={this.props.unit.currentTenancy.name}
                                          onChange={(newValue) => this.changeAllTenantField('name', newValue)}/>
                    </td>
                </tr>
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
                        <strong>Net / Gross</strong>
                    </td>
                    <td>
                        <FieldDisplayEdit type="rentType" value={this.props.unit.currentTenancy.rentType}
                                          onChange={(newValue) => this.changeAllTenantField('rentType', newValue)}/>
                    </td>
                </tr>
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
                                                  onChange={(newValue) => this.changeAllTenantField('freeRentType', newValue)}/>
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
                                                  onChange={(newValue) => this.changeAllTenantField('recoveryStructure', newValue)}/>
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
                                <strong>Leasing Commission</strong>
                            </td>
                            <td className={"leasing-commission-line"}>
                                {
                                    this.getUnitLeasingCosts().leasingCommissionMode === 'psf' ?
                                        <FieldDisplayEdit
                                            type="currency"
                                            value={this.getUnitLeasingCosts().leasingCommissionPSF}
                                            hideInput={true}
                                            hideIcon={true}
                                            onChange={(newValue) => this.changeLeasingCostField('leasingCommissionPSF', newValue)}
                                        /> : null
                                }
                                <FieldDisplayEdit
                                    type="leasingCommissionMode"
                                    value={this.getUnitLeasingCosts().leasingCommissionMode}
                                    hideInput={true}
                                    hideIcon={true}
                                    onChange={(newValue) => this.changeLeasingCostField('leasingCommissionMode', newValue)}
                                />
                            </td>
                        </tr> : null
                }
                {
                    this.props.appraisal.appraisalType === 'simple' && this.props.unit.isVacantForStabilizedStatement && this.getUnitLeasingCosts().leasingCommissionMode === 'percent_of_rent' ?
                        <tr>
                            <td>
                                <strong>Leasing Commission - Year 1</strong>
                            </td>
                            <td>
                                <FieldDisplayEdit
                                    type="percent"
                                    value={this.getUnitLeasingCosts().leasingCommissionPercentYearOne}
                                    hideInput={true}
                                    hideIcon={true}
                                    onChange={(newValue) => this.changeLeasingCostField('leasingCommissionPercentYearOne', newValue)}
                                />
                            </td>
                        </tr> : null
                }
                {
                    this.props.appraisal.appraisalType === 'simple' && this.props.unit.isVacantForStabilizedStatement && this.getUnitLeasingCosts().leasingCommissionMode === 'percent_of_rent' ?
                        <tr>
                            <td>
                                <strong>Leasing Commission - Remaining Years</strong>
                            </td>
                            <td>
                                <FieldDisplayEdit
                                    type="percent"
                                    value={this.getUnitLeasingCosts().leasingCommissionPercentRemainingYears}
                                    hideInput={true}
                                    hideIcon={true}
                                    onChange={(newValue) => this.changeLeasingCostField('leasingCommissionPercentRemainingYears', newValue)}
                                />
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
                        <h4 className={"unit-section-title"}>Financials</h4>
                    </td>
                </tr>
                {
                    this.props.appraisal.appraisalType === "simple" ?
                        <tr>
                            <td>
                                <strong>Market Rent (psf)</strong>
                            </td>
                            <td>
                                <FieldDisplayEdit placeholder={"Market Rent (psf)"}
                                                  value={this.getUnitMarketRent() ? this.getUnitMarketRent().amountPSF : null}
                                                  type={"currency"}
                                                  onChange={(newValue) => this.changeMarketRentField('amountPSF', newValue)}/>
                            </td>
                        </tr> : null
                }
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
                    this.props.unit.calculatedManagementRecovery ?
                        <tr className={"stats-row"}>
                            <td>
                                {
                                    this.props.appraisal.appraisalType === 'detailed' ?
                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                            <strong>Calculated Management Recovery</strong>
                                        </Link> :
                                        <ManagementRecoveriesForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit}>
                                            <strong>Calculated Management Recovery</strong>
                                        </ManagementRecoveriesForUnitCalculationPopoverWrapper>
                                }
                            </td>
                            <td>
                                    <span style={{"marginLeft": "10px"}}>
                                    {
                                        this.props.appraisal.appraisalType === 'detailed' ?
                                            <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                                <CurrencyFormat value={this.props.unit.calculatedManagementRecovery}/>
                                            </Link> :
                                            <ManagementRecoveriesForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit}>
                                                <CurrencyFormat value={this.props.unit.calculatedManagementRecovery}/>
                                            </ManagementRecoveriesForUnitCalculationPopoverWrapper>
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
                                        <ExpenseRecoveryForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit} incomeStatementItemType={"operating_expense"}>
                                            <strong>Calculated Operating Expense Recovery</strong>
                                        </ExpenseRecoveryForUnitCalculationPopoverWrapper>
                                }
                            </td>
                            <td>
                                                        <span style={{"marginLeft": "10px"}}>
                                                        {this.props.appraisal.appraisalType === 'detailed' ?
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                                                <CurrencyFormat
                                                                    value={this.props.unit.calculatedExpenseRecovery}/>
                                                            </Link> :
                                                            <ExpenseRecoveryForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit} incomeStatementItemType={"operating_expense"}>
                                                                <CurrencyFormat
                                                                    value={this.props.unit.calculatedExpenseRecovery}/>
                                                            </ExpenseRecoveryForUnitCalculationPopoverWrapper>
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
                                        <ExpenseRecoveryForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit} incomeStatementItemType={"taxes"}>
                                            <strong>Calculated Tax Recovery</strong>
                                        </ExpenseRecoveryForUnitCalculationPopoverWrapper>
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
                                        <ExpenseRecoveryForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit} incomeStatementItemType={"taxes"}>
                                            <span style={{"marginLeft": "10px"}}>
                                                                <CurrencyFormat
                                                                    value={this.props.unit.calculatedTaxRecovery}/>
                                                            </span>
                                        </ExpenseRecoveryForUnitCalculationPopoverWrapper>

                                }
                            </td>
                        </tr> : null
                }
                {
                    this.props.unit.calculatedMarketRentDifferential ?
                        <tr className={"stats-row"}>
                            <td>
                                <MarketRentDifferentialForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit}>
                                    <strong>Calculated Market Rent Differential</strong>
                                </MarketRentDifferentialForUnitCalculationPopoverWrapper>
                            </td>
                            <td>
                                <MarketRentDifferentialForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit}>
                                    <span style={{"marginLeft": "10px"}}>
                                        <CurrencyFormat value={this.props.unit.calculatedMarketRentDifferential}/>
                                    </span>
                                </MarketRentDifferentialForUnitCalculationPopoverWrapper>
                            </td>
                        </tr> : null
                }
                {
                    this.props.unit.calculatedFreeRentLoss ?
                        <tr className={"stats-row"}>
                            <td>
                                <FreeRentLossForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit}>
                                    <strong>Calculated Free Rent Loss</strong>
                                </FreeRentLossForUnitCalculationPopoverWrapper>
                            </td>
                            <td>
                                    <span style={{"marginLeft": "10px"}}>
                                        <FreeRentLossForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit}>
                                            {
                                                this.props.unit.calculatedFreeRentLoss ?
                                                    <CurrencyFormat value={this.props.unit.calculatedFreeRentLoss}/>
                                                    : null
                                            }
                                        </FreeRentLossForUnitCalculationPopoverWrapper>
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
                                        <VacantRentLossForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit}>
                                            <span style={{"marginLeft": "10px"}}>
                                                <CurrencyFormat value={this.props.unit.calculatedVacantUnitRentLoss}/>
                                            </span>
                                        </VacantRentLossForUnitCalculationPopoverWrapper>

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
                                        <LeasingCostsForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit}>
                                            <strong>Calculated Vacant Unit Leaseup Costs</strong>
                                        </LeasingCostsForUnitCalculationPopoverWrapper>
                                }
                            </td>
                            <td>
                                {
                                    this.props.appraisal.appraisalType === 'detailed' ?
                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                            <span style={{"marginLeft": "10px"}}>
                                                <CurrencyFormat value={this.props.unit.calculatedVacantUnitLeasupCosts}/>
                                            </span>
                                        </Link> :
                                        <LeasingCostsForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit}>
                                            <span style={{"marginLeft": "10px"}}>
                                                <CurrencyFormat value={this.props.unit.calculatedVacantUnitLeasupCosts}/>
                                            </span>
                                        </LeasingCostsForUnitCalculationPopoverWrapper>
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
