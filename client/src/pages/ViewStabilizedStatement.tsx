import { reportUrl } from "@api/client";
import React from 'react';
import {Row, Col, Card, CardBody, Table} from 'reactstrap';
import {Link} from 'react-router';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import AreaFormat from "./components/AreaFormat";
import PercentFormat from "./components/PercentFormat";
import CurrencyFormat from "./components/CurrencyFormat";
import StructuralAllowanceCalculationPopoverWrapper from "./components/StructuralAllowanceCalculationPopoverWrapper";
import TotalRecoverableIncomePopoverWrapper from "./components/TotalRecoverableIncomePopoverWrapper";
import StabilizedStatementInputsPanel from './components/StabilizedStatementInputsPanel';
import StabilizedStatementDownloadMenu from './components/StabilizedStatementDownloadMenu';
import StabilizedStatementUnitsSection from './components/StabilizedStatementUnitsSection';
import StabilizedStatementEditableRows from './components/StabilizedStatementEditableRows';
import {navigateBrowserLocation} from '../components/platform/browserActions';
import {appraisalBuildingSize} from '../domain/appraisal';
import type {UnitDTO} from '../api/types';
import {
    type EditableStabilizedStatementAppraisal,
    isStabilizedStatementItemValue,
    createIncomeStatementItem,
    stabilizedStatementAppraisalYear,
    stabilizedStatementItemFieldValue,
    stabilizedStatementItemTaxonomy,
} from '../domain/stabilizedStatement';

type StabilizedStatementAppraisal = EditableStabilizedStatementAppraisal;

interface ViewStabilizedStatementProps {
    appraisal: StabilizedStatementAppraisal;
    appraisalId?: string;
    expenses?: unknown[];
    navigate?(path: string): void;
    saveAppraisal(appraisal: StabilizedStatementAppraisal): void;
}

interface StabilizedStatementState {
    capitalizationRate: number;
    downloadDropdownOpen?: boolean;
}

function ViewStabilizedStatement(props: ViewStabilizedStatementProps)
{
    const [state, setState] = React.useState<StabilizedStatementState>({capitalizationRate: 8.4});
    const sizeOfBuilding = appraisalBuildingSize(props.appraisal as never);
    const appraisalYear = stabilizedStatementAppraisalYear(props.appraisal.effectiveDate);
    const changeStabilizedInput = (field: string, newValue: unknown) => {
        props.appraisal.stabilizedStatementInputs[field] = newValue;
        props.saveAppraisal(props.appraisal);
    };
    const changeManagementExpenseCalculationRuleField = (field: string, newValue: unknown) => {
        props.appraisal.stabilizedStatementInputs.managementExpenseCalculationRule[field] = newValue;
        props.saveAppraisal(props.appraisal);
    };
    const toggleDownloadDropdown = () => setState((currentState) => ({
        ...currentState,
        downloadDropdownOpen: !currentState.downloadDropdownOpen,
    }));
    const downloadWordSummary = () => {
        navigateBrowserLocation(reportUrl(props.appraisal._id, "stabilized_statement", "word"));
    };
    const onUnitClicked = (_unit: UnitDTO, unitIndex: number) => {
        if (props.appraisal.appraisalType === 'detailed')
        {
            props.navigate!(`/appraisal/${props.appraisal._id}/tenants/rent_roll?unit=${unitIndex}`);
        }
    };
    const onRemoveUnit = (unitIndex: number) => {
        props.appraisal.units.splice(unitIndex, 1);
        props.saveAppraisal(props.appraisal);
    };
    const onCreateUnit = (newUnit: UnitDTO) => {
        props.appraisal.units.push(newUnit);
        props.saveAppraisal(props.appraisal);
    };
    const onUnitChanged = (unitIndex: number, newUnit: UnitDTO) => {
        props.appraisal.units[unitIndex] = newUnit;
        props.saveAppraisal(props.appraisal);
    };
    const onChangeUnitOrder = (newUnits: UnitDTO[]) => {
        props.appraisal.units = newUnits;
        props.saveAppraisal(props.appraisal);
    };
    const createNewIncomeStatementItem = (field: string, value: unknown, incomeField: 'incomes' | 'expenses') => {
        if (isStabilizedStatementItemValue(value))
        {
            value = stabilizedStatementItemFieldValue(field, value, appraisalYear);
            const {cashFlowType, incomeStatementItemType} = stabilizedStatementItemTaxonomy(incomeField);
            const newItem = createIncomeStatementItem({cashFlowType, incomeStatementItemType});

            if (field)
            {
                newItem[field] = value;
            }
            if (newItem.yearlyAmounts === undefined)
            {
                newItem.yearlyAmounts = {};
            }
            if (newItem.name === undefined)
            {
                newItem.name = 'New Item';
            }

            props.appraisal[incomeField].items.push(newItem);
            props.saveAppraisal(props.appraisal);
        }
    };
    const changeIncomeStatementItem = (index: number, field: string, value: unknown, incomeField: 'incomes' | 'expenses') => {
        if (field === 'yearlyAmounts' && value === null)
        {
            props.appraisal[incomeField].items.splice(index, 1);
            props.saveAppraisal(props.appraisal);
        }
        else
        {
            if (field === 'yearlyAmounts')
            {
                value = stabilizedStatementItemFieldValue(field, value, appraisalYear);
            }
            const incomeItem = props.appraisal[incomeField].items[index];
            incomeItem[field] = value;
            props.appraisal[incomeField].items[index] = incomeItem;
            props.saveAppraisal(props.appraisal);
        }
    };
    const changeRecoveryStructureField = (field: string, newValue: unknown) => {
        const recoveryStructure = props.appraisal.recoveryStructures[0];
        if (newValue !== recoveryStructure[field])
        {
            recoveryStructure[field] = newValue;
            props.saveAppraisal(props.appraisal);
        }
    };

        return [
            <AppraisalContentHeader key="header" appraisal={props.appraisal} title="Stabilized Statement Valuation"/>,
            <Row key="body" className={"view-stabilized-statement"}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <StabilizedStatementDownloadMenu
                                isOpen={state.downloadDropdownOpen}
                                onToggle={toggleDownloadDropdown}
                                onDownloadWord={downloadWordSummary}
                            />

                            <StabilizedStatementUnitsSection
                                appraisal={props.appraisal}
                                onUnitClicked={onUnitClicked}
                                onRemoveUnit={onRemoveUnit}
                                onCreateUnit={onCreateUnit}
                                onUnitChanged={onUnitChanged}
                                onChangeUnitOrder={onChangeUnitOrder}
                            />
                            <Row>
                                <Col xs={12} lg={8}>
                                    <div className={"stabilized-statement-centered"}>
                                        <br/>
                                        <div className="valuation-table-scroll">
                                        <Table className={"statement-table"}>
                                            <tbody>
                                            <tr className={"title-row"}>
                                                <td className={"label-column"}><span className={"title"}>Revenue</span></td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}/>
                                            </tr>
                                            {
                                                props.appraisal.appraisalType === 'detailed' ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}><Link to={`/appraisal/${props.appraisal._id}/tenants/rent_roll`}>Stabilized
                                                            Rental Income</Link></td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${props.appraisal._id}/tenants/rent_roll`}><CurrencyFormat
                                                                value={props.appraisal.stabilizedStatement.rentalIncome}/></Link>
                                                        </td>
                                                        <td/>
                                                    </tr> : null
                                            }
                                            {
                                                props.appraisal.appraisalType === 'simple' ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}>Rental Income</td>
                                                        <td className={"amount-column"}><CurrencyFormat value={props.appraisal.stabilizedStatement.rentalIncome}/>
                                                        </td>
                                                        <td/>
                                                    </tr> : null
                                            }
                                            {
                                                props.appraisal.appraisalType === 'detailed' && props.appraisal.stabilizedStatement.additionalIncome ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}>
                                                            <Link to={`/appraisal/${props.appraisal._id}/additional_income`}>Additional Income</Link>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${props.appraisal._id}/additional_income`}>
                                                                <CurrencyFormat value={props.appraisal.stabilizedStatement.additionalIncome} />
                                                            </Link>
                                                        </td>
                                                        <td className={"amount-total-column"}/>
                                                    </tr> : null
                                            }

                                            <StabilizedStatementEditableRows
                                                appraisalType={props.appraisal.appraisalType}
                                                incomeField="incomes"
                                                appraisalYear={appraisalYear}
                                                label="Income"
                                                showEmptyRowWhenHidden={true}
                                                statement={props.appraisal.incomeStatement}
                                                onChange={changeIncomeStatementItem}
                                                onCreate={createNewIncomeStatementItem}
                                            />
                                            {
                                                props.appraisal.appraisalType === 'detailed' ? props.appraisal.stabilizedStatement.recoverableIncome ?
                                                    <tr className={"statement-sum-after-row data-row"}>
                                                        <td className={"label-column"}>
                                                            <Link to={`/appraisal/${props.appraisal._id}/tenants/recovery_structures`}>Recoverable Income</Link>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${props.appraisal._id}/tenants/recovery_structures`}><CurrencyFormat value={props.appraisal.stabilizedStatement.recoverableIncome}/></Link>
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
                                                props.appraisal.appraisalType === 'simple' ? props.appraisal.stabilizedStatement.recoverableIncome ?
                                                    <tr className={"statement-sum-after-row data-row"}>
                                                        <td className={"label-column"}>
                                                            <TotalRecoverableIncomePopoverWrapper appraisal={props.appraisal as never} recovery={props.appraisal.recoveryStructures[0] as never}>
                                                                <span>Recoverable Income</span>
                                                            </TotalRecoverableIncomePopoverWrapper>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <TotalRecoverableIncomePopoverWrapper appraisal={props.appraisal as never} recovery={props.appraisal.recoveryStructures[0] as never}>
                                                                <CurrencyFormat value={props.appraisal.stabilizedStatement.recoverableIncome}/>
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
                                                    <CurrencyFormat value={props.appraisal.stabilizedStatement.potentialGrossIncome}/>
                                                </td>
                                                <td className={"amount-total-column"}/>
                                            </tr>
                                            <tr className={"statement-sum-after-row data-row vacancy-row"}>
                                                <td className={"label-column"}>
                                                    <span>Less Vacancy @ <PercentFormat value={props.appraisal.stabilizedStatementInputs ? props.appraisal.stabilizedStatementInputs.vacancyRate : 5.0}/></span>
                                                </td>
                                                <td className={"amount-column"}>
                                                    <CurrencyFormat value={props.appraisal.stabilizedStatement.vacancyDeduction}/>
                                                </td>
                                                <td className={"amount-total-column"}/>
                                            </tr>
                                            <tr className={"statement-sum-row data-row"}>
                                                <td className={"label-column"}>Effective Gross Income</td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={props.appraisal.stabilizedStatement.effectiveGrossIncome}/>
                                                </td>
                                            </tr>
                                            <tr className={"title-row"}>
                                                <td className={"label-column"}><span className={"title"}>Expenses</span></td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}></td>
                                            </tr>
                                            <StabilizedStatementEditableRows
                                                appraisalType={props.appraisal.appraisalType}
                                                hideIconOnNewAmount={true}
                                                incomeField="expenses"
                                                appraisalYear={appraisalYear}
                                                label="Expense"
                                                statement={props.appraisal.expenseStatement}
                                                onChange={changeIncomeStatementItem}
                                                onCreate={createNewIncomeStatementItem}
                                            />
                                            {
                                                props.appraisal.appraisalType === 'detailed' && props.appraisal.stabilizedStatement.operatingExpenses ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}><Link to={`/appraisal/${props.appraisal._id}/expenses`}>Operating Costs</Link></td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${props.appraisal._id}/expenses`}><CurrencyFormat value={props.appraisal.stabilizedStatement.operatingExpenses}/></Link>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                props.appraisal.appraisalType === 'detailed' && props.appraisal.stabilizedStatement.taxes ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}><Link to={`/appraisal/${props.appraisal._id}/expenses`}>Taxes</Link></td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${props.appraisal._id}/expenses`}><CurrencyFormat value={props.appraisal.stabilizedStatement.taxes}/></Link>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                props.appraisal.appraisalType === 'detailed' && props.appraisal.stabilizedStatement.managementExpenses ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}><Link to={`/appraisal/${props.appraisal._id}/expenses`}>
                                                            {
                                                                props.appraisal.stabilizedStatementInputs.managementExpenseMode === 'combined_structural_rule' ?
                                                                    <span>Structural & Mgmt</span> : <span>Management Expenses</span>
                                                            }</Link></td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${props.appraisal._id}/expenses`}><CurrencyFormat value={props.appraisal.stabilizedStatement.managementExpenses}/></Link>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                props.appraisal.appraisalType === 'simple' && props.appraisal.stabilizedStatement.managementExpenses ?
                                                    <tr className={"data-row"}>
                                                        <td className={"label-column"}>
                                                            {
                                                                props.appraisal.stabilizedStatementInputs.managementExpenseMode === 'combined_structural_rule' ?
                                                                    <span>Structural & Mgmt</span> : <span>Management Expenses</span>
                                                            }</td>
                                                        <td className={"amount-column"}>
                                                            <CurrencyFormat value={props.appraisal.stabilizedStatement.managementExpenses}/>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                props.appraisal.stabilizedStatement.tmiTotal ?
                                                    <tr className={"data-row vacancy-row"}>
                                                        <td className={"label-column"}>
                                                            <Link to={`/appraisal/${props.appraisal._id}/expenses_tmi`}>
                                                                <span>TMI</span>&nbsp;
                                                                <AreaFormat spaces={false} value={sizeOfBuilding}/>&nbsp;@&nbsp;
                                                                <CurrencyFormat value={props.appraisal.stabilizedStatementInputs.tmiRatePSF}/>
                                                            </Link>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <Link to={`/appraisal/${props.appraisal._id}/expenses_tmi`}>
                                                                <CurrencyFormat value={props.appraisal.stabilizedStatement.tmiTotal}/>
                                                            </Link>
                                                        </td>
                                                        <td className={"amount-total-column"}></td>
                                                    </tr> : null
                                            }
                                            {
                                                props.appraisal.stabilizedStatement.structuralAllowance ?
                                                    <tr className={"data-row vacancy-row"}>
                                                        <td className={"label-column"}>
                                                            <StructuralAllowanceCalculationPopoverWrapper appraisal={props.appraisal as never}>
                                                                <span>Structural Allowance @ <PercentFormat value={props.appraisal.stabilizedStatementInputs ? props.appraisal.stabilizedStatementInputs.structuralAllowancePercent : 2.0}/></span>
                                                            </StructuralAllowanceCalculationPopoverWrapper>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <StructuralAllowanceCalculationPopoverWrapper appraisal={props.appraisal as never}>
                                                                <CurrencyFormat value={props.appraisal.stabilizedStatement.structuralAllowance}/>
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
                                                    <CurrencyFormat value={props.appraisal.stabilizedStatement.totalExpenses}/>
                                                </td>
                                            </tr>

                                            <tr className={"title-row"}>
                                                <td className={"label-column"}><span className={"title"}>Net Operating Income</span></td>
                                                <td className={"amount-column"} />
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={props.appraisal.stabilizedStatement.netOperatingIncome}/>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </Table>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} lg={4}>
                                    <StabilizedStatementInputsPanel
                                        appraisal={props.appraisal}
                                        expenses={props.expenses}
                                        onStabilizedInputChange={changeStabilizedInput}
                                        onManagementExpenseCalculationRuleChange={changeManagementExpenseCalculationRuleField}
                                        onRecoveryStructureChange={changeRecoveryStructureField}
                                    />
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        ];
}

export default ViewStabilizedStatement;
