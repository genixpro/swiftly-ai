import { reportUrl } from "@api/client";
import React from 'react';
import {Row, Col, Card, CardBody, Table, Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import {Link} from 'react-router';
import {useComparableSalesByIds} from '@api/hooks';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import ComparableSaleList from "./components/ComparableSaleList";
import CapitalizationInputsPanel from './components/CapitalizationInputsPanel';
import CapitalizationModifierRows from './components/CapitalizationModifierRows';
import PercentFormat from "./components/PercentFormat";
import CurrencyFormat from "./components/CurrencyFormat";
import TotalMarketRentDifferentialCalculationPopoverWrapper from "./components/TotalMarketRentDifferentialCalculationPopoverWrapper";
import TotalRemainingFreeRentPopoverWrapper from "./components/TotalRemainingFreeRentPopoverWrapper";
import TotalLeasingCostsCalculationPopoverWrapper from "./components/TotalLeasingCostsCalculationPopoverWrapper";
import TotalVacantUnitRentLossCalculationPopoverWrapper from "./components/TotalVacantUnitRentLossCalculationPopoverWrapper";
import {capitalizationComparableColumns, createCapitalizationModifier} from '../domain/capitalization';
import {sortComparables} from '../domain/comparables';
import type {CapitalizationInputs, CapitalizationStatement} from '../domain/capitalization';
import type {AppraisalDTO, ComparableSaleDTO} from '../api/types';
import {navigateBrowserLocation} from '../components/platform/browserActions';

interface CapitalizationAppraisal extends AppraisalDTO {
    _id: string;
    address?: string;
    comparableSales?: unknown;
    comparableSalesCapRate?: string[] | null;
    propertyType?: string | null;
    stabilizedStatement: CapitalizationStatement;
    stabilizedStatementInputs: CapitalizationInputs;
}

interface ViewCapitalizationValuationProps {
    appraisal: CapitalizationAppraisal;
    appraisalId?: string;
    navigate?: unknown;
    saveAppraisal(appraisal: CapitalizationAppraisal): void;
    search?: unknown;
}

interface CapitalizationState {
    capitalizationRate: number;
    comparableSales: readonly ComparableSaleDTO[];
    downloadDropdownOpen?: boolean;
    sort: string;
}

function ViewCapitalizationValuation(props: ViewCapitalizationValuationProps)
{
    const [state, setState] = React.useState<CapitalizationState>({
        capitalizationRate: 8.4,
        comparableSales: [],
        sort: "-saleDate"
    });
    const initialComparableSalesCapRateRef = React.useRef(props.appraisal.comparableSalesCapRate ?? []);
    const comparableSalesQuery = useComparableSalesByIds(initialComparableSalesCapRateRef.current);
    const onComparablesChanged = (comparableSales: readonly ComparableSaleDTO[]) => setState((currentState) => ({...currentState, comparableSales}));
    const changeStabilizedInput = (field: string, newValue: unknown) => {
        props.appraisal.stabilizedStatementInputs[field] = newValue;
        props.saveAppraisal(props.appraisal);
    };
    const removeModifier = (index: number) => {
        props.appraisal.stabilizedStatementInputs.modifiers!.splice(index, 1);
        props.saveAppraisal(props.appraisal);
    };
    const changeStabilizedModifier = (index: number, field: string, newValue: unknown) => {
        if (field === 'amount' && newValue === null)
        {
            removeModifier(index);
        }
        else
        {
            props.appraisal.stabilizedStatementInputs.modifiers![index][field] = newValue;
            props.saveAppraisal(props.appraisal);
        }
    };
    const createNewModifier = (field: string, newValue: unknown) => {
        if (newValue)
        {
            if (!props.appraisal.stabilizedStatementInputs.modifiers)
            {
                props.appraisal.stabilizedStatementInputs.modifiers = [];
            }

            const object = createCapitalizationModifier();
            object[field] = newValue;
            props.appraisal.stabilizedStatementInputs.modifiers.push(object);
            props.saveAppraisal(props.appraisal);
        }
    };
    const onSortChanged = (newSort: string) => setState((currentState) => ({
        ...currentState,
        sort: newSort,
        comparableSales: sortComparables(currentState.comparableSales, newSort),
    }));
    const toggleDownloadDropdown = () => setState((currentState) => ({
        ...currentState,
        downloadDropdownOpen: !currentState.downloadDropdownOpen,
    }));
    const downloadWordSummary = () => {
        navigateBrowserLocation(reportUrl(props.appraisal._id, "capitalization_valuation", "word"));
    };

    React.useEffect(() => {
        if (comparableSalesQuery.data) {
            const comparableSales = comparableSalesQuery.data;
            setState((currentState) => ({
                ...currentState,
                comparableSales: sortComparables(comparableSales, currentState.sort)
            }));
        }
    }, [comparableSalesQuery.data]);

        const {headers: compHeaders, stats: compStats} = capitalizationComparableColumns(props.appraisal.propertyType);

        return [
            <AppraisalContentHeader appraisal={props.appraisal} title="Capitalization Approach" key={"header"}/>,
            <Row className={"view-capitalization-valuation"} key={"body"}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <Dropdown isOpen={state.downloadDropdownOpen} toggle={toggleDownloadDropdown}>
                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                    Download
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={downloadWordSummary}>Capitalization Valuation Summary (docx)</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>

                            <Row>
                                <Col xs={12}>
                                    <div className={"stabilized-statement-centered"}>
                                        <h3>Capitalization Approach</h3>
                                        <h4>{props.appraisal.address}</h4>
                                        <ComparableSaleList comparableSales={state.comparableSales}
                                                            headers={compHeaders}
                                                            statsTitle={""}
                                                            statsPosition={"below"}
                                                            stats={compStats}
                                                            allowNew={false}
                                                            sort={state.sort}
                                                            noCompMessage={"There are no comparables attached to this appraisal. Please go to the comparables database and select comparables from there."}
                                                            onSortChanged={onSortChanged}
                                                            navigate={props.navigate} search={props.search as Record<string, unknown>}
                                                            appraisal={props.appraisal}
                                                            appraisalId={props.appraisalId}
                                                            appraisalComparables={props.appraisal.comparableSales}
                                                            onChange={(comps) => onComparablesChanged(comps as readonly ComparableSaleDTO[])}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} lg={8}>
                                    <div className={"stabilized-statement-centered"}>
                                        <h3>Valuation</h3>
                                        <div className="valuation-table-scroll">
                                        <Table className={"statement-table "}>
                                            <tbody>
                                            <tr className={"title-row"}>
                                                <td className={"label-column"}><span className={"title"}>Net Operating Income</span></td>
                                                <td className={"amount-column"} />
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={props.appraisal.stabilizedStatement.netOperatingIncome} />
                                                </td>
                                            </tr>
                                            {/*<tr className={"data-row"}>*/}
                                            {/*<td className={"label-column"}>NOI per square foot</td>*/}
                                            {/*<td className={"amount-column"}></td>*/}
                                            {/*<td className={"amount-total-column"}>todo</td>*/}
                                            {/*</tr>*/}
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <span>Capitalized @ <PercentFormat value={props.appraisal.stabilizedStatementInputs.capitalizationRate}/></span>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={props.appraisal.stabilizedStatement.capitalization} />
                                                </td>
                                            </tr>
                                            {
                                                props.appraisal.stabilizedStatement.marketRentDifferential && props.appraisal.stabilizedStatementInputs.applyMarketRentDifferential ?
                                                    <tr className={"data-row capitalization-row"}>
                                                        <td className={"label-column"}>
                                                            <TotalMarketRentDifferentialCalculationPopoverWrapper appraisal={props.appraisal}>
                                                                <span>Market Rent Differential</span>
                                                            </TotalMarketRentDifferentialCalculationPopoverWrapper>
                                                        </td>
                                                        <td className={"amount-column"} />
                                                        <td className={"amount-total-column"}>
                                                            <TotalMarketRentDifferentialCalculationPopoverWrapper appraisal={props.appraisal}>
                                                                <CurrencyFormat value={props.appraisal.stabilizedStatement.marketRentDifferential} />
                                                            </TotalMarketRentDifferentialCalculationPopoverWrapper>
                                                        </td>
                                                    </tr> : null
                                            }
                                            {
                                                props.appraisal.stabilizedStatement.freeRentRentLoss && props.appraisal.stabilizedStatementInputs.applyFreeRentLoss ?
                                                    <tr className={"data-row capitalization-row"}>
                                                        <td className={"label-column"}>
                                                            <TotalRemainingFreeRentPopoverWrapper appraisal={props.appraisal}>
                                                                <span>Remaining Free Rent</span>
                                                            </TotalRemainingFreeRentPopoverWrapper>
                                                        </td>
                                                        <td className={"amount-column"}></td>
                                                        <td className={"amount-total-column"}>
                                                            <TotalRemainingFreeRentPopoverWrapper appraisal={props.appraisal}>
                                                                <CurrencyFormat value={props.appraisal.stabilizedStatement.freeRentRentLoss} />
                                                            </TotalRemainingFreeRentPopoverWrapper>
                                                        </td>
                                                    </tr> : null
                                            }
                                            {
                                                props.appraisal.stabilizedStatement.vacantUnitLeasupCosts && props.appraisal.stabilizedStatementInputs.applyVacantUnitLeasingCosts ?
                                                    <tr className={"data-row capitalization-row"}>
                                                        <td className={"label-column"}>
                                                            {
                                                                props.appraisal.appraisalType === 'detailed' ?
                                                                    <Link to={`/appraisal/${props.appraisal._id}/tenants/leasing_costs`}>
                                                                        <span>Vacant Unit Leasing Costs</span>
                                                                    </Link> : null
                                                            }
                                                            {
                                                                props.appraisal.appraisalType === 'simple' ?
                                                                    <TotalLeasingCostsCalculationPopoverWrapper appraisal={props.appraisal}>
                                                                        <span>Vacant Unit Leasing Costs</span>
                                                                    </TotalLeasingCostsCalculationPopoverWrapper> : null
                                                            }
                                                        </td>
                                                        <td className={"amount-column"}></td>
                                                        <td className={"amount-total-column"}>
                                                            {
                                                                props.appraisal.appraisalType === 'detailed' ?
                                                                    <Link to={`/appraisal/${props.appraisal._id}/tenants/leasing_costs`}>
                                                                        <CurrencyFormat value={props.appraisal.stabilizedStatement.vacantUnitLeasupCosts}/>
                                                                    </Link>
                                                                    : null
                                                            }
                                                            {
                                                                props.appraisal.appraisalType === 'simple' ?
                                                                    <TotalLeasingCostsCalculationPopoverWrapper appraisal={props.appraisal}>
                                                                        <CurrencyFormat value={props.appraisal.stabilizedStatement.vacantUnitLeasupCosts}/>
                                                                    </TotalLeasingCostsCalculationPopoverWrapper> : null
                                                            }
                                                        </td>
                                                    </tr> : null
                                            }
                                            {
                                                props.appraisal.stabilizedStatement.vacantUnitRentLoss && props.appraisal.stabilizedStatementInputs.applyVacantUnitRentLoss ?
                                                    <tr className={"data-row capitalization-row"}>
                                                        <td className={"label-column"}>
                                                            {
                                                                props.appraisal.appraisalType === 'detailed' ?
                                                                    <Link to={`/appraisal/${props.appraisal._id}/tenants/leasing_costs`}>
                                                                        <span>Vacant Unit Rent Loss</span>
                                                                    </Link> : null
                                                            }
                                                            {
                                                                props.appraisal.appraisalType === 'simple' ?
                                                                    <TotalVacantUnitRentLossCalculationPopoverWrapper appraisal={props.appraisal}>
                                                                        <span>Vacant Unit Rent Loss</span>
                                                                    </TotalVacantUnitRentLossCalculationPopoverWrapper> : null
                                                            }
                                                        </td>
                                                        <td className={"amount-column"}></td>
                                                        <td className={"amount-total-column"}>
                                                            {
                                                                props.appraisal.appraisalType === 'detailed' ?
                                                                    <Link to={`/appraisal/${props.appraisal._id}/tenants/leasing_costs`}>
                                                                        <CurrencyFormat value={props.appraisal.stabilizedStatement.vacantUnitRentLoss}/>
                                                                    </Link>
                                                                    : null
                                                            }
                                                            {
                                                                props.appraisal.appraisalType === 'simple' ?
                                                                    <TotalVacantUnitRentLossCalculationPopoverWrapper appraisal={props.appraisal}>
                                                                        <CurrencyFormat value={props.appraisal.stabilizedStatement.vacantUnitRentLoss}/>
                                                                    </TotalVacantUnitRentLossCalculationPopoverWrapper> : null
                                                            }
                                                        </td>
                                                    </tr> : null
                                            }
                                            {
                                                props.appraisal.stabilizedStatement.amortizedCapitalInvestment && props.appraisal.stabilizedStatementInputs.applyAmortization ?
                                                    <tr className={"data-row capitalization-row"}>
                                                        <td className={"label-column"}>
                                                            <Link to={`/appraisal/${props.appraisal._id}/amortization`}>
                                                                <span>Amortized Capital Investment</span>
                                                            </Link>
                                                        </td>
                                                        <td className={"amount-column"}></td>
                                                        <td className={"amount-total-column"}>
                                                            <Link to={`/appraisal/${props.appraisal._id}/amortization`}>
                                                                <CurrencyFormat value={props.appraisal.stabilizedStatement.amortizedCapitalInvestment} />
                                                            </Link>
                                                        </td>
                                                    </tr> : null
                                            }
                                            <CapitalizationModifierRows
                                                modifiers={props.appraisal.stabilizedStatementInputs.modifiers}
                                                onChange={changeStabilizedModifier}
                                                onCreate={createNewModifier}
                                            />
                                            <tr className={"data-row rounding-row"}>
                                                <td className={"label-column"}>
                                                    <span>Estimated Value</span>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={props.appraisal.stabilizedStatement.valuation} />
                                                </td>
                                            </tr>
                                            <tr className={"data-row rounding-row"}>
                                                <td className={"label-column"}>
                                                    <span>Rounded</span>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <CurrencyFormat value={props.appraisal.stabilizedStatement.valuationRounded} />
                                                </td>
                                            </tr>
                                            </tbody>
                                        </Table>
                                        </div>
                                        <br/>
                                        <br/>
                                        <h4 className={"final-valuation"}>Final Value By Capitalization Approach: <CurrencyFormat
                                            value={props.appraisal.stabilizedStatement.valuationRounded}
                                            cents={false}
                                        />
                                        </h4>
                                    </div>
                                </Col>
                                <Col xs={12} lg={4}>
                                    <CapitalizationInputsPanel
                                        appraisal={props.appraisal}
                                        onChange={changeStabilizedInput}
                                    />
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        ];
}

export default ViewCapitalizationValuation;
