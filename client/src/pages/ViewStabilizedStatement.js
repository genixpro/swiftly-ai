import React from 'react';
import {Row, Col, Card, CardBody, Table, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Popover, PopoverHeader, PopoverBody} from 'reactstrap';
import NumberFormat from 'react-number-format';
import {Link} from 'react-router-dom';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import UnitsTable from "./components/UnitsTable";
import AreaFormat from "./components/AreaFormat";
import Auth from "../Auth";
import PercentFormat from "./components/PercentFormat";
import CurrencyFormat from "./components/CurrencyFormat";
import StructuralAllowanceCalculationPopoverWrapper from "./components/StructuralAllowanceCalculationPopoverWrapper";
import {IncomeStatementItemModel} from "../models/IncomeStatementModel";
import _ from "underscore";
import TotalRecoverableIncomePopoverWrapper from "./components/TotalRecoverableIncomePopoverWrapper";

class ViewStabilizedStatement extends React.Component
{
    state = {
        capitalizationRate: 8.4
    };

    componentDidMount()
    {

    }


    changeStabilizedInput(field, newValue)
    {
        this.props.appraisal.stabilizedStatementInputs[field] = newValue;
        this.props.saveAppraisal(this.props.appraisal);
    }


    changeManagementExpenseCalculationRuleField(field, newValue)
    {
        this.props.appraisal.stabilizedStatementInputs.managementExpenseCalculationRule[field] = newValue;
        this.props.saveAppraisal(this.props.appraisal);
    }


    toggle()
    {
        this.setState({downloadDropdownOpen: !this.state.downloadDropdownOpen})
    }


    downloadWordSummary()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/stabilized_statement/word?access_token=${Auth.getAccessToken()}`;
    }


    downloadExcelSummary()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/stabilized_statement/excel?access_token=${Auth.getAccessToken()}`;
    }

    onUnitClicked(unit, unitIndex)
    {
        if (this.props.appraisal.appraisalType === 'detailed')
        {
            this.props.history.push(`/appraisal/${this.props.appraisal._id}/tenants/rent_roll?unit=${unitIndex}`)
        }
        else
        {
            // do nothing
        }
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

    onUnitChanged(unitIndex, newUnit)
    {
        this.props.appraisal.units[unitIndex] = newUnit;
        this.props.saveAppraisal(this.props.appraisal);
    }


    onChangeUnitOrder(newUnits)
    {
        this.props.appraisal.units = newUnits;
        this.props.saveAppraisal(this.props.appraisal);
    }


    createNewIncomeStatementItem(field, value, incomeField)
    {
        if (value !== null && value !== "")
        {
            let appraisalYear = this.getAppraisalYear();
            if (field === 'yearlyAmounts')
            {
                value = {[appraisalYear]: value};
            }


            let cashFlowType = null;
            let incomeStatementItemType = null;

            if (incomeField === 'expenses')
            {
                cashFlowType = 'expense';
                incomeStatementItemType = 'operating_expense';
            }
            else
            {
                cashFlowType = 'income';
                incomeStatementItemType = 'additional_income';
            }

            const newItem = IncomeStatementItemModel.create({
                cashFlowType: cashFlowType,
                incomeStatementItemType: incomeStatementItemType
            }, this.props.appraisal.incomeStatement, "incomes");

            if (field)
            {
                newItem[field] = value;
            }

            if (_.isUndefined(newItem['yearlyAmounts']))
            {
                newItem['yearlyAmounts'] = {};
            }

            if (_.isUndefined(newItem['name']))
            {
                newItem['name'] = 'New Item';
            }

            this.props.appraisal.incomeStatement[incomeField].push(newItem);
            this.props.saveAppraisal(this.props.appraisal);
        }
    }

    changeIncomeStatementItem(index, field, value, incomeField)
    {
        let appraisalYear = this.getAppraisalYear();
        if (field === 'yearlyAmounts' && value === null)
        {
            this.props.appraisal.incomeStatement[incomeField].splice(index, 1);
            this.props.saveAppraisal(this.props.appraisal);
        }
        else
        {
            if (field === 'yearlyAmounts')
            {
                value = {[appraisalYear]: value};
            }
            const incomeItem = this.props.appraisal.incomeStatement[incomeField][index];
            incomeItem[field] = value;
            this.props.appraisal.incomeStatement[incomeField][index] = incomeItem;
            this.props.saveAppraisal(this.props.appraisal);
        }
    }


    getAppraisalYear()
    {
        let appraisalYear;
        if  (this.props.appraisal.effectiveDate)
        {
            appraisalYear = this.props.appraisal.effectiveDate.getFullYear();
        }
        else
        {
            appraisalYear = new Date().getFullYear();
        }
        return appraisalYear;
    }


    changeRecoveryStructureField(field, newValue)
    {
        const recoveryStructure = this.props.appraisal.recoveryStructures[0];

        if (newValue !== recoveryStructure[field])
        {
            recoveryStructure[field] = newValue;
            this.props.saveAppraisal(this.props.appraisal);
        }
    }

    render()
    {
        let appraisalYear = this.getAppraisalYear();

        return [
            <AppraisalContentHeader appraisal={this.props.appraisal} title="Stabilized Statement Valuation"/>,
            <Row className={"view-stabilized-statement"}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggle.bind(this)}>
                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                    Download
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => this.downloadWordSummary()}>Stabilized Statement Summary (docx)</DropdownItem>
                                    <DropdownItem onClick={() => this.downloadExcelSummary()}>Stabilized Statement Spreadsheet (xlsx)</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>

                            <Row>
                                <Col xs={8}>
                                    <div className={"stabilized-statement-centered"}>
                                        <h3>Stabilized Income & Expense Statement</h3>
                                        <h4>{this.props.appraisal.address}</h4>
                                        <UnitsTable
                                            appraisal={this.props.appraisal}
                                            showStabilizedStats={true}
                                            allowSelection={this.props.appraisal.appraisalType === 'simple'}
                                            allowNewUnit={this.props.appraisal.appraisalType === 'simple'}
                                            statsMode={"total"}
                                            onUnitClicked={(unit, unitIndex) => this.onUnitClicked(unit, unitIndex)}
                                            onRemoveUnit={(unitIndex) => this.onRemoveUnit(unitIndex)}
                                            onCreateUnit={(newUnit) => this.onCreateUnit(newUnit)}
                                            onUnitChanged={(unitIndex, newUnit) => this.onUnitChanged(unitIndex, newUnit)}
                                            onChangeUnitOrder={(newUnits) => this.onChangeUnitOrder(newUnits)}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={8}>
                                    <div className={"stabilized-statement-centered"}>
                                        <br/>
                                        <Table className={"statement-table"}>
                                            <tbody>
                                            <tr className={"title-row"}>
                                                <td className={"label-column"}><span className={"title"}>Revenue</span></td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}/>
                                            </tr>
                                            {
                                                this.props.appraisal.appraisalType === 'detailed' ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}><Link to={`/appraisal/${this.props.appraisal._id}/tenants/rent_roll`}>Stabilized
                                                            Rental Income</Link></td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/tenants/rent_roll`}><CurrencyFormat
                                                                value={this.props.appraisal.stabilizedStatement.rentalIncome}/></Link>
                                                        </td>
                                                        <td/>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.appraisalType === 'simple' ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}>Rental Income</td>
                                                        <td className={"amount-column"}><CurrencyFormat value={this.props.appraisal.stabilizedStatement.rentalIncome}/>
                                                        </td>
                                                        <td/>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.appraisalType === 'detailed' && this.props.appraisal.stabilizedStatement.additionalIncome ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/additional_income`}>Additional Income</Link>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/additional_income`}>
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatement.additionalIncome} />
                                                            </Link>
                                                        </td>
                                                        <td className={"amount-total-column"}/>
                                                    </tr> : null
                                            }

                                            {
                                                this.props.appraisal.appraisalType === 'simple' ? (this.props.appraisal.incomeStatement.incomes || []).map((incomeItem, index) =>
                                                {
                                                    return <tr className={"data-row income-row"} key={index}>
                                                        <td className={"label-column"}>
                                                            <span><FieldDisplayEdit
                                                                type={"text"}
                                                                placeholder={"Add/Remove Income"}
                                                                value={incomeItem.name}
                                                                hideIcon={true}
                                                                onChange={(newValue) => this.changeIncomeStatementItem(index, "name", newValue, "incomes")}
                                                            /></span>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <FieldDisplayEdit
                                                                hideIcon={true}
                                                                type={"currency"}
                                                                placeholder={"Amount"}
                                                                value={incomeItem.yearlyAmounts[appraisalYear]}
                                                                onChange={(newValue) => this.changeIncomeStatementItem(index, "yearlyAmounts", newValue, "incomes")}
                                                            />
                                                        </td>
                                                        <td className={"amount-total-column"}>
                                                        </td>
                                                    </tr>
                                                }).concat([
                                                    <tr className={"data-row income-row"} key={(this.props.appraisal.incomeStatement.incomes || []).length}>
                                                        <td className={"label-column"}>
                                                    <span><FieldDisplayEdit
                                                        type={"text"}
                                                        placeholder={"Add/Remove Income"}
                                                        hideIcon={true}
                                                        onChange={(newValue) => this.createNewIncomeStatementItem("name", newValue, "incomes")}
                                                    /></span>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <FieldDisplayEdit
                                                                type={"currency"}
                                                                placeholder={"Amount"}
                                                                hideIcon={true}
                                                                onChange={(newValue) => this.createNewIncomeStatementItem("yearlyAmounts", newValue, "incomes")}
                                                            />
                                                        </td>
                                                        <td className={"amount-total-column"}>
                                                        </td>
                                                    </tr>
                                                ]) : null
                                            }
                                            {
                                                this.props.appraisal.appraisalType === 'detailed' ? this.props.appraisal.stabilizedStatement.recoverableIncome ?
                                                    <tr className={"statement-sum-after-row data-row"}>
                                                        <td className={"label-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}>Recoverable Income</Link>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/tenants/recovery_structures`}><CurrencyFormat value={this.props.appraisal.stabilizedStatement.recoverableIncome}/></Link>
                                                        </td>
                                                        <td className={"amount-total-column"}/>
                                                    </tr> :
                                                    <tr className={"statement-sum-after-row data-row"}>
                                                        <td className={"label-column"}>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                        </td>
                                                        <td className={"amount-total-column"}/>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.appraisalType === 'simple' ? this.props.appraisal.stabilizedStatement.recoverableIncome ?
                                                    <tr className={"statement-sum-after-row data-row"}>
                                                        <td className={"label-column"}>
                                                            <TotalRecoverableIncomePopoverWrapper appraisal={this.props.appraisal} recovery={this.props.appraisal.recoveryStructures[0]}>
                                                                <span>Recoverable Income</span>
                                                            </TotalRecoverableIncomePopoverWrapper>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <TotalRecoverableIncomePopoverWrapper appraisal={this.props.appraisal} recovery={this.props.appraisal.recoveryStructures[0]}>
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatement.recoverableIncome}/>
                                                            </TotalRecoverableIncomePopoverWrapper>
                                                        </td>
                                                        <td className={"amount-total-column"}/>
                                                    </tr> :
                                                    <tr className={"statement-sum-after-row data-row"}>
                                                        <td className={"label-column"}>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                        </td>
                                                        <td className={"amount-total-column"}/>
                                                    </tr> : null
                                            }
                                            <tr className={"statement-sum-row data-row"}>
                                                <td className={"label-column"}>Potential Gross Income</td>
                                                <td className={"amount-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.potentialGrossIncome}/>
                                                </td>
                                                <td className={"amount-total-column"}/>
                                            </tr>
                                            <tr className={"statement-sum-after-row data-row vacancy-row"}>
                                                <td className={"label-column"}>
                                                    <span>Less Vacancy @ <PercentFormat value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.vacancyRate : 5.0}/></span>
                                                </td>
                                                <td className={"amount-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.vacancyDeduction}/>
                                                </td>
                                                <td className={"amount-total-column"}/>
                                            </tr>
                                            <tr className={"statement-sum-row data-row"}>
                                                <td className={"label-column"}>Effective Gross Income</td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.effectiveGrossIncome}/>
                                                </td>
                                            </tr>
                                            <tr className={"title-row"}>
                                                <td className={"label-column"}><span className={"title"}>Expenses</span></td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}></td>
                                            </tr>
                                            {
                                                this.props.appraisal.appraisalType === 'simple' ? (this.props.appraisal.incomeStatement.expenses || []).map((incomeItem, index) =>
                                                {
                                                    return <tr className={"data-row income-row"} key={index}>
                                                        <td className={"label-column"}>
                                                            <span><FieldDisplayEdit
                                                                type={"text"}
                                                                placeholder={"Add/Remove Expense"}
                                                                value={incomeItem.name}
                                                                hideIcon={true}
                                                                onChange={(newValue) => this.changeIncomeStatementItem(index, "name", newValue, "expenses")}
                                                            /></span>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <FieldDisplayEdit
                                                                hideIcon={true}
                                                                type={"currency"}
                                                                placeholder={"Amount"}
                                                                value={incomeItem.yearlyAmounts[appraisalYear]}
                                                                onChange={(newValue) => this.changeIncomeStatementItem(index, "yearlyAmounts", newValue, "expenses")}
                                                            />
                                                        </td>
                                                        <td className={"amount-total-column"}>
                                                        </td>
                                                    </tr>
                                                }).concat([
                                                    <tr className={"data-row income-row"} key={(this.props.appraisal.incomeStatement.expenses || []).length}>
                                                        <td className={"label-column"}>
                                                    <span><FieldDisplayEdit
                                                        type={"text"}
                                                        placeholder={"Add/Remove Expense"}
                                                        hideIcon={true}
                                                        onChange={(newValue) => this.createNewIncomeStatementItem("name", newValue, "expenses")}
                                                    /></span>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <FieldDisplayEdit
                                                                type={"currency"}
                                                                placeholder={"Amount"}
                                                                hideIcon={true}
                                                                onChange={(newValue) => this.createNewIncomeStatementItem("yearlyAmounts", newValue, "expenses")}
                                                            />
                                                        </td>
                                                        <td className={"amount-total-column"}>
                                                        </td>
                                                    </tr>
                                                ]) : null
                                            }
                                            {
                                                this.props.appraisal.appraisalType === 'detailed' && this.props.appraisal.stabilizedStatement.operatingExpenses ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}><Link to={`/appraisal/${this.props.appraisal._id}/expenses`}>Operating Costs</Link></td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/expenses`}><CurrencyFormat value={this.props.appraisal.stabilizedStatement.operatingExpenses}/></Link>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.appraisalType === 'detailed' && this.props.appraisal.stabilizedStatement.taxes ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}><Link to={`/appraisal/${this.props.appraisal._id}/expenses`}>Taxes</Link></td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/expenses`}><CurrencyFormat value={this.props.appraisal.stabilizedStatement.taxes}/></Link>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.appraisalType === 'detailed' && this.props.appraisal.stabilizedStatement.managementExpenses ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}><Link to={`/appraisal/${this.props.appraisal._id}/expenses`}>
                                                            {
                                                                this.props.appraisal.stabilizedStatementInputs.managementExpenseMode === 'combined_structural_rule' ?
                                                                    <span>Structural & Mgmt</span> : <span>Management Expenses</span>
                                                            }</Link></td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/expenses`}><CurrencyFormat value={this.props.appraisal.stabilizedStatement.managementExpenses}/></Link>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.appraisalType === 'simple' && this.props.appraisal.stabilizedStatement.managementExpenses ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}>
                                                            {
                                                                this.props.appraisal.stabilizedStatementInputs.managementExpenseMode === 'combined_structural_rule' ?
                                                                    <span>Structural & Mgmt</span> : <span>Management Expenses</span>
                                                            }</td>
                                                        <td className={"amount-column"}>
                                                            <CurrencyFormat value={this.props.appraisal.stabilizedStatement.managementExpenses}/>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.stabilizedStatement.tmiTotal ?
                                                    <tr className={"data-row vacancy-row"}>
                                                        <td className={"label-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/expenses_tmi`}>
                                                                <span>TMI</span>&nbsp;
                                                                <AreaFormat spaces={false} value={this.props.appraisal.sizeOfBuilding}/>&nbsp;@&nbsp;
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatementInputs.tmiRatePSF}/>
                                                            </Link>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${this.props.appraisal._id}/expenses_tmi`}>
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatement.tmiTotal}/>
                                                            </Link>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                this.props.appraisal.stabilizedStatement.structuralAllowance ?
                                                    <tr className={"data-row vacancy-row"}>
                                                        <td className={"label-column"}>
                                                            <StructuralAllowanceCalculationPopoverWrapper appraisal={this.props.appraisal}>
                                                                <span>Structural Allowance @ <PercentFormat value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.structuralAllowancePercent : 2.0}/></span>
                                                            </StructuralAllowanceCalculationPopoverWrapper>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <StructuralAllowanceCalculationPopoverWrapper appraisal={this.props.appraisal}>
                                                                <CurrencyFormat value={this.props.appraisal.stabilizedStatement.structuralAllowance}/>
                                                            </StructuralAllowanceCalculationPopoverWrapper>
                                                        </td>
                                                        <td className={"amount-total-column"}/>
                                                    </tr> : null
                                            }
                                            <tr className={"statement-sum-after-row data-row"}>
                                                <td className={"label-column"}>
                                                </td>
                                                <td className={"amount-column"}>
                                                </td>
                                                <td className={"amount-total-column"}/>
                                            </tr>
                                            <tr className={"data-row statement-total-sum-row"}>
                                                <td className={"label-column"}>Total Expenses</td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.totalExpenses}/>
                                                </td>
                                            </tr>

                                            <tr className={"title-row"}>
                                                <td className={"label-column"}><span className={"title"}>Net Operating Income</span></td>
                                                <td className={"amount-column"} />
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={this.props.appraisal.stabilizedStatement.netOperatingIncome}/>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                </Col>
                                <Col xs={4}>
                                    <Card className={"stabilized-statement-inputs"} outline>
                                        <CardBody>
                                            <h3>Inputs</h3>

                                            <Table>
                                                <tr>
                                                    <td>Vacancy Rate</td>
                                                    <td>
                                                        <FieldDisplayEdit
                                                            type={"percent"}
                                                            placeholder={"Vacancy Rate"}
                                                            value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.vacancyRate : 5.0}
                                                            onChange={(newValue) => this.changeStabilizedInput("vacancyRate", newValue)}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Management Expense Mode</td>
                                                    <td>
                                                        <FieldDisplayEdit
                                                            type={"managementExpenseMode"}
                                                            placeholder={"Management Expense Mode"}
                                                            value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.managementExpenseMode : null}
                                                            exclude={this.props.appraisal.appraisalType === 'simple' ? ["income_statement"] : []}
                                                            onChange={(newValue) => this.changeStabilizedInput("managementExpenseMode", newValue)}
                                                        />
                                                    </td>
                                                </tr>
                                                {
                                                    this.props.appraisal.stabilizedStatementInputs.managementExpenseMode === 'rule' || this.props.appraisal.stabilizedStatementInputs.managementExpenseMode === 'combined_structural_rule' ?
                                                        <tr>
                                                            <td>
                                                                <span>Management Expense Calculation</span>
                                                            </td>
                                                            <td className={"management-expense-rule"}>
                                                                {
                                                                    this.props.appraisal.stabilizedStatement.calculationErrorFields.indexOf("managementExpenses") !== -1 ?
                                                                        <i className={"fa fa-exclamation-circle"} title={this.props.appraisal.stabilizedStatement.calculationErrors['managementExpenses']} />
                                                                        : null
                                                                }
                                                                <FieldDisplayEdit
                                                                    type={"percent"}
                                                                    placeholder={"Percent Of"}
                                                                    hideIcon={true}
                                                                    value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.percentage : null}
                                                                    onChange={(newValue) => this.changeManagementExpenseCalculationRuleField("percentage", newValue)}
                                                                />
                                                                <span className={"spacer"}>of</span>
                                                                <FieldDisplayEdit
                                                                    type="calculationField"
                                                                    className={"management-expense-mode"}
                                                                    expenses={this.props.appraisal.incomeStatement.expenses}
                                                                    placeholder={"Expense Calculation Field"}
                                                                    value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.field : null}
                                                                    hideIcon={true}
                                                                    onChange={(newValue) => this.changeManagementExpenseCalculationRuleField('field', newValue)}
                                                                />
                                                            </td>
                                                        </tr>
                                                        : null
                                                }
                                                {
                                                    this.props.appraisal.appraisalType === 'simple' ?
                                                        <tr>
                                                            <td>
                                                                <span>Management Recovery Mode</span>
                                                            </td>
                                                            <td className={"management-expense-rule"}>
                                                                {
                                                                    this.props.appraisal.stabilizedStatement.calculationErrorFields.indexOf("managementRecovery") !== -1 ?
                                                                        <i className={"fa fa-exclamation-circle"} title={this.props.appraisal.stabilizedStatement.calculationErrors['managementRecovery']} />
                                                                        : null
                                                                }
                                                                {
                                                                    this.props.appraisal.recoveryStructures[0].managementRecoveryMode !== "custom" && this.props.appraisal.recoveryStructures[0].managementRecoveryMode !== "none" ?
                                                                            <FieldDisplayEdit
                                                                                key={1}
                                                                                type="percent"
                                                                                placeholder={"Management Recovery %"}
                                                                                value={this.props.appraisal.recoveryStructures[0].managementRecoveryOperatingPercentage}
                                                                                hideInput={true}
                                                                                hideIcon={true}
                                                                                onChange={(newValue) => this.changeRecoveryStructureField('managementRecoveryOperatingPercentage', newValue)}
                                                                            />
                                                                        : <span />
                                                                }
                                                                {
                                                                    this.props.appraisal.recoveryStructures[0].managementRecoveryMode !== "custom" && this.props.appraisal.recoveryStructures[0].managementRecoveryMode !== "none" ?
                                                                        <span className={"spacer"}>
                                                                            of
                                                                        </span>
                                                                        : null
                                                                }
                                                                <FieldDisplayEdit
                                                                    type="managementRecoveryMode"
                                                                    className={"management-recovery-mode"}
                                                                    expenses={this.props.expenses}
                                                                    placeholder={"Management Recovery Mode"}
                                                                    value={this.props.appraisal.recoveryStructures[0].managementRecoveryMode}
                                                                    hideInput={true}
                                                                    hideIcon={true}
                                                                    onChange={(newValue) => this.changeRecoveryStructureField('managementRecoveryMode', newValue)}
                                                                />
                                                            </td>
                                                        </tr>
                                                        : null
                                                }
                                                {
                                                    this.props.appraisal.stabilizedStatementInputs.managementExpenseMode === 'rule' || this.props.appraisal.stabilizedStatementInputs.managementExpenseMode === 'income_statement' ?
                                                        <tr>
                                                            <td>Structural Allowance</td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"percent"}
                                                                    placeholder={"Structural Allowance Rate"}
                                                                    value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.structuralAllowancePercent : 2.0}
                                                                    onChange={(newValue) => this.changeStabilizedInput("structuralAllowancePercent", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                                {
                                                    this.props.appraisal.stabilizedStatementInputs.expensesMode === 'tmi'  ?
                                                        <tr className={"data-row vacancy-row"}>
                                                            <td>
                                                                <span>TMI (psf)</span>&nbsp;

                                                            </td>
                                                            <td>
                                                                <FieldDisplayEdit
                                                                    type={"currency"}
                                                                    placeholder={"TMI Rate (psf)"}
                                                                    value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.tmiRatePSF : 0}
                                                                    onChange={(newValue) => this.changeStabilizedInput("tmiRatePSF", newValue)}
                                                                />
                                                            </td>
                                                        </tr> : null
                                                }
                                            </Table>

                                        </CardBody>
                                    </Card>

                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        ];
    }
}

export default ViewStabilizedStatement;
