import React from 'react';
import {Row, Col, Button, DropdownItem, DropdownToggle, Dropdown, DropdownMenu, Alert, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import NumberFormat from 'react-number-format';
import {Link} from "react-router-dom";
import _ from 'underscore';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css'
import UnitsTable from "./components/UnitsTable";
import Auth from "../Auth";
import {TenancyModel} from "../models/UnitModel";
import CurrencyFormat from "./components/CurrencyFormat";
import IntegerFormat from "./components/IntegerFormat";
import moment from "moment/moment";
import PercentFormat from "./components/PercentFormat";
import AreaFormat from "./components/AreaFormat";
import Moment from "react-moment";

class ViewTenantsRentRoll extends React.Component
{
    state = {
        selectedUnitIndex: null
    };

    componentDidMount()
    {
        if (this.getQueryVariable("unit"))
        {
            this.setState({selectedUnitIndex: this.getQueryVariable("unit")})
        }
    }

    getQueryVariable(variable)
    {
        let query = this.props.history.location.search.substring(1);
        let vars = query.split('&');
        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        console.log('Query variable %s not found', variable);
    }

    onUnitClicked(unitIndex)
    {
        this.setState({selectedUnitIndex: unitIndex})
    }

    onRemoveUnit(unitIndex)
    {
        if (unitIndex === this.state.selectedUnitIndex)
        {
            this.setState({selectedUnitIndex: null});
        }

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
                    onChange={(newValue) => this.changeTenancyField(this.props.appraisal.units[this.state.selectedUnitIndex], tenantInfo, 'name', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='date'
                    hideIcon={true}
                    value={tenantInfo.startDate}
                    placeholder={"Start Date"}
                    onChange={(newValue) => this.changeTenancyField(this.props.appraisal.units[this.state.selectedUnitIndex], tenantInfo, 'startDate', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='date'
                    hideIcon={true}
                    value={tenantInfo.endDate}
                    placeholder={"End Date"}
                    onChange={(newValue) => this.changeTenancyField(this.props.appraisal.units[this.state.selectedUnitIndex], tenantInfo, 'endDate', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='rentType'
                    hideIcon={true}
                    value={tenantInfo.rentType}
                    placeholder={"gross/net"}
                    onChange={(newValue) => this.changeTenancyField(this.props.appraisal.units[this.state.selectedUnitIndex], tenantInfo, 'rentType', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='currency'
                    hideIcon={true}
                    value={tenantInfo.yearlyRentPSF}
                    placeholder={"yearly rent (psf)"}
                    onChange={(newValue) => this.changeTenancyField(this.props.appraisal.units[this.state.selectedUnitIndex], tenantInfo, 'yearlyRentPSF', newValue)}/>
            </td>
            <td>
                <FieldDisplayEdit
                    type='currency'
                    hideIcon={true}
                    value={tenantInfo.yearlyRent}
                    placeholder={"yearly rent"}
                    onChange={(newValue) => this.changeTenancyField(this.props.appraisal.units[this.state.selectedUnitIndex], tenantInfo, 'yearlyRent', newValue)}/>
            </td>
            <td className={"action-column"}>
                {
                    tenancyIndex !== 0 ? <Button
                        color="secondary"
                        onClick={(evt) => this.removeTenancy(unitInfo, tenantInfo, tenancyIndex)}
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
        const newTenancy = TenancyModel.create({}, this.props.appraisal.units[this.state.selectedUnitIndex], "tenancies");

        if (field)
        {
            newTenancy[field] = value;
        }

        this.props.appraisal.units[this.state.selectedUnitIndex].tenancies.push(newTenancy);
        this.props.saveAppraisal(this.props.appraisal);
    }


    renderNewTenancyRow()
    {
        return <tr className={"tenant-row"}>
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
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/rent_roll/word?access_token=${Auth.getAccessToken()}`;
    }

    downloadExcelRentRoll()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/rent_roll/excel?access_token=${Auth.getAccessToken()}`;
    }

    calculateDifferentialMonths()
    {
        if (!this.props.appraisal.units[this.state.selectedUnitIndex] || this.state.selectedUnitIndex === null)
        {
            return null;
        }

        const marketRentDifferentialStateDate = moment(this.props.appraisal.getEffectiveDate());
        const marketRentDifferentialEndDate = moment(this.props.appraisal.units[this.state.selectedUnitIndex].currentTenancy.endDate);

        const differentialMonths = [];

        const currentDate = marketRentDifferentialStateDate;

        const presentDifferentialPSF = (this.props.appraisal.units[this.state.selectedUnitIndex].currentTenancy.yearlyRent / this.props.appraisal.units[this.state.selectedUnitIndex].squareFootage) - this.props.appraisal.units[this.state.selectedUnitIndex].marketRentAmount;

        const monthlyDifferentialCashflow = (presentDifferentialPSF * this.props.appraisal.units[this.state.selectedUnitIndex].squareFootage) / 12.0;

        const monthlyDiscount = Math.pow(1.0 + (this.props.appraisal.stabilizedStatementInputs.marketRentDifferentialDiscountRate / 100), 1 / 12.0);

        let month = 0;

        while(currentDate.toDate().getTime() <= marketRentDifferentialEndDate.toDate().getTime())
        {
            const totalDiscount = monthlyDiscount ** month;

            const presentValue = monthlyDifferentialCashflow / totalDiscount;

            differentialMonths.push({
                date: currentDate.clone().toDate(),
                month: month,
                currentRent: this.props.appraisal.units[this.state.selectedUnitIndex].currentTenancy.yearlyRent / 12,
                marketRent: this.props.appraisal.units[this.state.selectedUnitIndex].marketRentAmount * this.props.appraisal.units[this.state.selectedUnitIndex].squareFootage / 12,
                presentMonthlyCashFlow: monthlyDifferentialCashflow,
                discount: totalDiscount,
                presentValue: presentValue,

            });

            currentDate.add(1, "months");
            month += 1;
        }

        return differentialMonths;
    }


    changeStabilizedInput(field, newValue)
    {
        this.props.appraisal.stabilizedStatementInputs[field] = newValue;
        this.props.saveAppraisal(this.props.appraisal);
    }

    render()
    {
        const popoverId = `market-rent-differential-popover`;

        const differentialMonths = this.calculateDifferentialMonths();

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
                                selectedUnit={this.props.appraisal.units[this.state.selectedUnitIndex]}
                                onUnitClicked={(unit, unitIndex) => this.onUnitClicked(unitIndex)}
                                onRemoveUnit={(unitIndex) => this.onRemoveUnit(unitIndex)}
                                onCreateUnit={(newUnit) => this.onCreateUnit(newUnit)}
                            />
                        </Col>
                        {
                            this.state.selectedUnitIndex !== null ?
                                <Col xs={7} md={7} lg={7} xl={7}>
                                    {/*<Card outline color="primary" className="mb-3">*/}
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
                                                                  value={this.props.appraisal.units[this.state.selectedUnitIndex].unitNumber}
                                                                  onChange={(newValue) => this.changeUnitField(this.props.appraisal.units[this.state.selectedUnitIndex], 'unitNumber', newValue)}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Floor Number</strong>
                                            </td>
                                            <td>
                                                <FieldDisplayEdit placeholder={"Floor Number"} value={this.props.appraisal.units[this.state.selectedUnitIndex].floorNumber}
                                                                  onChange={(newValue) => this.changeUnitField(this.props.appraisal.units[this.state.selectedUnitIndex], 'floorNumber', newValue)}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Unit Size</strong>
                                            </td>
                                            <td>
                                                <FieldDisplayEdit type="area" placeholder={"Unit Size"} value={this.props.appraisal.units[this.state.selectedUnitIndex].squareFootage}
                                                                  onChange={(newValue) => this.changeUnitField(this.props.appraisal.units[this.state.selectedUnitIndex], 'squareFootage', newValue)}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Tenant Name</strong>
                                            </td>
                                            <td>
                                                <FieldDisplayEdit placeholder={"Tenant Name"} value={this.props.appraisal.units[this.state.selectedUnitIndex].currentTenancy.name}
                                                                  onChange={(newValue) => this.changeAllTenantField(this.props.appraisal.units[this.state.selectedUnitIndex], this.props.appraisal.units[this.state.selectedUnitIndex].currentTenancy, 'name', newValue)}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Net / Gross</strong>
                                            </td>
                                            <td>
                                                <FieldDisplayEdit type="rentType" value={this.props.appraisal.units[this.state.selectedUnitIndex].currentTenancy.rentType}
                                                                  onChange={(newValue) => this.changeAllTenantField(this.props.appraisal.units[this.state.selectedUnitIndex], this.props.appraisal.units[this.state.selectedUnitIndex].currentTenancy, 'rentType', newValue)}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Market Rent</strong>
                                            </td>
                                            <td>
                                                <FieldDisplayEdit type="marketRent" placeholder={"Market Rent"} marketRents={this.props.appraisal.marketRents}
                                                                  value={this.props.appraisal.units[this.state.selectedUnitIndex].marketRent}
                                                                  onChange={(newValue) => this.changeUnitField(this.props.appraisal.units[this.state.selectedUnitIndex], 'marketRent', newValue)}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Free Rent Period (months)</strong>
                                            </td>
                                            <td>
                                                <FieldDisplayEdit type="months" placeholder={"Free Rent Period (months)"}
                                                                  value={this.props.appraisal.units[this.state.selectedUnitIndex].currentTenancy.freeRentMonths}
                                                                  onChange={(newValue) => this.changeTenancyField(this.props.appraisal.units[this.state.selectedUnitIndex], this.props.appraisal.units[this.state.selectedUnitIndex].currentTenancy, 'freeRentMonths', newValue)}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Free Rent Type</strong>
                                            </td>
                                            <td>
                                                <FieldDisplayEdit type="rentType"
                                                                  value={this.props.appraisal.units[this.state.selectedUnitIndex].currentTenancy.freeRentType}
                                                                  onChange={(newValue) => this.changeAllTenantField(this.props.appraisal.units[this.state.selectedUnitIndex], this.props.appraisal.units[this.state.selectedUnitIndex].currentTenancy, 'freeRentType', newValue)}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Recovery Structure</strong>
                                            </td>
                                            <td>
                                                <FieldDisplayEdit type="recoveryStructure" placeholder={"Recovery Structure"}
                                                                  recoveryStructures={this.props.appraisal.recoveryStructures}
                                                                  value={this.props.appraisal.units[this.state.selectedUnitIndex].currentTenancy.recoveryStructure}
                                                                  onChange={(newValue) => this.changeAllTenantField(this.props.appraisal.units[this.state.selectedUnitIndex], this.props.appraisal.units[this.state.selectedUnitIndex].currentTenancy, 'recoveryStructure', newValue)}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Leasing Cost Structure</strong>
                                            </td>
                                            <td>
                                                <FieldDisplayEdit type="leasingCostStructure" placeholder={"Leasing Cost Structure"}
                                                                  leasingCostStructures={this.props.appraisal.leasingCosts}
                                                                  value={this.props.appraisal.units[this.state.selectedUnitIndex].leasingCostStructure}
                                                                  onChange={(newValue) => this.changeUnitField(this.props.appraisal.units[this.state.selectedUnitIndex], 'leasingCostStructure', newValue)}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Remarks</strong>
                                            </td>
                                            <td>
                                                <FieldDisplayEdit value={this.props.appraisal.units[this.state.selectedUnitIndex].remarks} placeholder={"Remarks"}
                                                                  onChange={(newValue) => this.changeUnitField(this.props.appraisal.units[this.state.selectedUnitIndex], 'remarks', newValue)}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Consider as Vacant Unit</strong>
                                            </td>
                                            <td style={{"paddingTop": "10px", "paddingLeft": "10px", "paddingBottom": "10px"}}>
                                                <FieldDisplayEdit
                                                    value={this.props.appraisal.units[this.state.selectedUnitIndex].isVacantForStabilizedStatement}
                                                    type={"boolean"}
                                                    hideIcon={true}
                                                    placeholder={"Treat Unit as Vacant?"}
                                                    onChange={(newValue) => this.changeUnitField(this.props.appraisal.units[this.state.selectedUnitIndex], 'shouldTreatAsVacant', newValue)}
                                                />
                                            </td>
                                        </tr>
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
                                                            <CurrencyFormat value={this.props.appraisal.units[this.state.selectedUnitIndex].stabilizedRent} cents={false}/>
                                                        </span>

                                                <div className={"use-market-rent-selector-container"}>
                                                    {
                                                        this.props.appraisal.units[this.state.selectedUnitIndex].marketRent ?
                                                            <div className={"use-market-rent-selector"}>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                    <strong>Apply Market Rent</strong>
                                                                    <FieldDisplayEdit hideIcon={true} type="boolean"
                                                                                      placeholder={"Use Market Rent for Stabilized Statement?"}
                                                                                      value={this.props.appraisal.units[this.state.selectedUnitIndex].shouldUseMarketRent}
                                                                                      onChange={(newValue) => this.changeUnitField(this.props.appraisal.units[this.state.selectedUnitIndex], 'shouldUseMarketRent', newValue)}/>
                                                                <br/>
                                                            </div> : null
                                                    }
                                                    {
                                                        this.props.appraisal.units[this.state.selectedUnitIndex].marketRent ?
                                                            <div className={"use-market-rent-selector"}>
                                                                    <strong>Apply Market Rent Differential</strong>
                                                                    <FieldDisplayEdit hideIcon={true} type="boolean" placeholder={"Apply Market Rent Differential?"}
                                                                                      value={this.props.appraisal.units[this.state.selectedUnitIndex].shouldApplyMarketRentDifferential}
                                                                                      onChange={(newValue) => this.changeUnitField(this.props.appraisal.units[this.state.selectedUnitIndex], 'shouldApplyMarketRentDifferential', newValue)}/>
                                                            </div> : null
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                        {
                                            this.props.appraisal.units[this.state.selectedUnitIndex].calculatedManagementRecovery ?
                                                <tr className={"stats-row"}>
                                                    <td>
                                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                                            <strong>Calculated Management Recovery</strong>
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        <span style={{"marginLeft": "10px"}}>
                                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                                            <CurrencyFormat value={this.props.appraisal.units[this.state.selectedUnitIndex].calculatedManagementRecovery}/>
                                                        </Link>
                                                        </span>
                                                    </td>
                                                </tr> : null
                                        }

                                        {
                                            this.props.appraisal.units[this.state.selectedUnitIndex].calculatedExpenseRecovery ?
                                                <tr className={"stats-row"}>
                                                    <td>
                                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                                            <strong>Calculated Operating Expense Recovery</strong>
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        <span style={{"marginLeft": "10px"}}>
                                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                                            <CurrencyFormat
                                                                value={this.props.appraisal.units[this.state.selectedUnitIndex].calculatedExpenseRecovery}/>
                                                        </Link>
                                                        </span>
                                                    </td>
                                                </tr> : null
                                        }
                                        {
                                            this.props.appraisal.units[this.state.selectedUnitIndex].calculatedTaxRecovery ?
                                                <tr className={"stats-row"}>
                                                    <td>
                                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                                            <strong>Calculated Tax Recovery</strong>
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>
                                                        <span style={{"marginLeft": "10px"}}>
                                                            <CurrencyFormat
                                                                value={this.props.appraisal.units[this.state.selectedUnitIndex].calculatedTaxRecovery}/>
                                                        </span>
                                                        </Link>
                                                    </td>
                                                </tr> : null
                                        }
                                        {
                                            this.props.appraisal.units[this.state.selectedUnitIndex].calculatedMarketRentDifferential ?
                                                <tr className={"stats-row"}>
                                                    <td>
                                                        <a onClick={() => this.setState({marketRentDifferentialPopoverOpen: !this.state.marketRentDifferentialPopoverOpen})}>
                                                            <strong>Calculated Market Rent Differential</strong>
                                                        </a>
                                                    </td>
                                                    <td>

                                                        <a id={popoverId} onClick={() => this.setState({marketRentDifferentialPopoverOpen: !this.state.marketRentDifferentialPopoverOpen})}>
                                                        <span style={{"marginLeft": "10px"}}>
                                                            <CurrencyFormat
                                                                value={this.props.appraisal.units[this.state.selectedUnitIndex].calculatedMarketRentDifferential}/>
                                                        </span>
                                                        </a>
                                                        <Popover placement="bottom" isOpen={this.state.marketRentDifferentialPopoverOpen} target={popoverId} toggle={() => this.setState({marketRentDifferentialPopoverOpen: !this.state.marketRentDifferentialPopoverOpen})}>
                                                            <PopoverHeader>Unit {this.props.appraisal.units[this.state.selectedUnitIndex].unitNumber} - Market Rent Differential</PopoverHeader>
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
                                                                            <CurrencyFormat value={differentialMonths[0].currentRent * 12 / this.props.appraisal.units[this.state.selectedUnitIndex].squareFootage}/>
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
                                                                            <CurrencyFormat value={differentialMonths[0].marketRent * 12 / this.props.appraisal.units[this.state.selectedUnitIndex].squareFootage}/>
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
                                                                            <CurrencyFormat value={differentialMonths[0].presentMonthlyCashFlow * 12 / this.props.appraisal.units[this.state.selectedUnitIndex].squareFootage}/>
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
                                                                        <td colSpan={3}><CurrencyFormat value={this.props.appraisal.units[this.state.selectedUnitIndex].calculatedMarketRentDifferential} /></td>
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
                                                                                    <Moment date={differential.date} format="MMM YYYY" />
                                                                                </td>
                                                                                <td>
                                                                                    <IntegerFormat value={differential.month} />
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
                                                                        <td><CurrencyFormat value={this.props.appraisal.units[this.state.selectedUnitIndex].calculatedMarketRentDifferential} /></td>
                                                                    </tr>
                                                                    </tbody>
                                                                </table>
                                                            </PopoverBody>
                                                        </Popover>
                                                    </td>
                                                </tr> : null
                                        }
                                        {
                                            this.props.appraisal.units[this.state.selectedUnitIndex].calculatedFreeRentLoss ?
                                                <tr className={"stats-row"}>
                                                    <td>
                                                        <a onClick={() => this.setState({freeRentLossPopoverOpen: !this.state.freeRentLossPopoverOpen})}>
                                                            <strong>Calculated Free Rent Loss</strong>
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <span style={{"marginLeft": "10px"}}>
                                                            <a id={"free-rent-loss-popover"} onClick={() => this.setState({freeRentLossPopoverOpen: !this.state.freeRentLossPopoverOpen})}>
                                                                {
                                                                        this.props.appraisal.units[this.state.selectedUnitIndex].calculatedFreeRentLoss ?
                                                                            <CurrencyFormat value={this.props.appraisal.units[this.state.selectedUnitIndex].calculatedFreeRentLoss}/>
                                                                            : null
                                                                }
                                                            </a>
                                                            <Popover placement="bottom" isOpen={this.state.freeRentLossPopoverOpen} target={"free-rent-loss-popover"} toggle={() => this.setState({freeRentLossPopoverOpen: !this.state.freeRentLossPopoverOpen})}>
                                                                <PopoverHeader>Free Rent Loss</PopoverHeader>
                                                                <PopoverBody>
                                                                    <table className={"explanation-popover-table"}>
                                                                        <tbody>
                                                                        <tr className={"total-row"}>
                                                                            <td>Free Rent Loss</td>
                                                                            <td><IntegerFormat value={this.props.appraisal.units[this.state.selectedUnitIndex].calculatedFreeRentMonths}/> months remaining</td>
                                                                            <td>/</td>
                                                                            <td>12</td>
                                                                            <td>*</td>
                                                                            <td><CurrencyFormat value={this.props.appraisal.units[this.state.selectedUnitIndex].calculatedFreeRentNetAmount}/></td>
                                                                            <td>=</td>
                                                                            <td><CurrencyFormat value={this.props.appraisal.units[this.state.selectedUnitIndex].calculatedFreeRentLoss} cents={false}/></td>
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
                                            this.props.appraisal.units[this.state.selectedUnitIndex].calculatedVacantUnitRentLoss ?
                                                <tr className={"stats-row"}>
                                                    <td>
                                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                                            <strong>Calculated Vacant Unit Rent Loss</strong>
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                                        <span style={{"marginLeft": "10px"}}>
                                                            <CurrencyFormat
                                                                value={this.props.appraisal.units[this.state.selectedUnitIndex].calculatedVacantUnitRentLoss}/>
                                                        </span>
                                                        </Link>
                                                    </td>
                                                </tr> : null
                                        }
                                        {
                                            this.props.appraisal.units[this.state.selectedUnitIndex].calculatedVacantUnitLeasupCosts ?
                                                <tr className={"stats-row"}>
                                                    <td>
                                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                                            <strong>Calculated Vacant Unit Leaseup Costs</strong>
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        <Link to={`/appraisal/${this.props.appraisal._id}/tenants/leasing_costs`}>
                                                        <span style={{"marginLeft": "10px"}}>
                                                            <CurrencyFormat
                                                                value={this.props.appraisal.units[this.state.selectedUnitIndex].calculatedVacantUnitLeasupCosts}/>
                                                        </span>
                                                        </Link>
                                                    </td>
                                                </tr> : null
                                        }
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
                                            <td>Annual Rent (psf)</td>
                                            <td>Annual Rent</td>
                                            <td className="action-column"/>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            this.props.appraisal.units[this.state.selectedUnitIndex].tenancies.map((tenancy, tenancyIndex) =>
                                            {
                                                return this.renderTenancy(this.props.appraisal.units[this.state.selectedUnitIndex], tenancy, tenancyIndex);
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
