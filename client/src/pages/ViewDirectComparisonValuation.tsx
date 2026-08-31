import { reportUrl } from "@api/client";
import React from 'react';
import {Row, Col, Card, CardBody, Table} from 'reactstrap';
import {Link} from "react-router"
import {useComparableSalesByIds} from '@api/hooks';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import CurrencyFormat from "./components/CurrencyFormat";
import TotalRemainingFreeRentPopoverWrapper from "./components/TotalRemainingFreeRentPopoverWrapper";
import TotalMarketRentDifferentialCalculationPopoverWrapper from "./components/TotalMarketRentDifferentialCalculationPopoverWrapper";
import DirectComparisonInputsPanel from './components/DirectComparisonInputsPanel';
import DirectComparisonMetric from './components/DirectComparisonMetric';
import DirectComparisonModifierRows from './components/DirectComparisonModifierRows';
import DirectComparisonDownloadMenu from './components/DirectComparisonDownloadMenu';
import DirectComparisonComparableSalesSection from './components/DirectComparisonComparableSalesSection';
import DirectComparisonAdjustmentChart from './components/DirectComparisonAdjustmentChart';
import {
    createDirectComparisonModifier,
    directComparisonColumns,
    directComparisonValuesFromNOIMultiple,
    directComparisonValuesFromPricePerSquareFoot,
} from '../domain/directComparison';
import {appraisalBuildingSize} from '../domain/appraisal';
import {sortComparables} from '../domain/comparables';
import type {DirectComparisonState, ViewDirectComparisonValuationProps} from './directComparisonTypes';
import {navigateBrowserLocation} from '../components/platform/browserActions';

function ViewDirectComparisonValuation(props: ViewDirectComparisonValuationProps)
{
    const [state, setState] = React.useState<DirectComparisonState>({
        capitalizationRate: 8.4,
        comparableSales: [],
        sort: "-saleDate"
    });
    const initialComparableSalesDCARef = React.useRef(props.appraisal.comparableSalesDCA ?? []);
    const comparableSalesQuery = useComparableSalesByIds(initialComparableSalesDCARef.current);
    const sizeOfBuilding = appraisalBuildingSize(props.appraisal as never);
    const onComparablesChanged = (comparableSales: readonly object[]) => setState((currentState) => ({...currentState, comparableSales}));
    const changeShowAdjustmentChart = (newValue: unknown) => {
        props.appraisal.adjustmentChart.showAdjustmentChart = newValue as boolean;
        props.saveAppraisal(props.appraisal);
    };
    const changeDirectComparisonInput = (field: string, newValue: unknown) => {
        props.appraisal.directComparisonInputs[field] = newValue;
        props.saveAppraisal(props.appraisal);
    };
    const removeModifier = (index: number) => {
        props.appraisal.directComparisonInputs.modifiers!.splice(index, 1);
        props.saveAppraisal(props.appraisal);
    };
    const changeModifier = (index: number, field: string, newValue: unknown) => {
        if (field === 'amount' && newValue === null)
        {
            removeModifier(index);
        }
        else
        {
            props.appraisal.directComparisonInputs.modifiers![index][field] = newValue;
            props.saveAppraisal(props.appraisal);
        }
    };
    const createNewModifier = (field: string, newValue: unknown) => {
        if (newValue)
        {
            if (!props.appraisal.directComparisonInputs.modifiers)
            {
                props.appraisal.directComparisonInputs.modifiers = [];
            }

            const object = createDirectComparisonModifier();
            object[field] = newValue;
            props.appraisal.directComparisonInputs.modifiers.push(object);
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
        navigateBrowserLocation(reportUrl(props.appraisal._id, "direct_comparison_valuation", "word"));
    };
    const changeDirectComparisonNOIMultiple = (newValue: unknown) => {
        Object.assign(props.appraisal.directComparisonInputs, directComparisonValuesFromNOIMultiple(
            props.appraisal.stabilizedStatement.netOperatingIncome as number,
            sizeOfBuilding,
            newValue as number,
        ));
        props.saveAppraisal(props.appraisal);
    };
    const changeDirectComparisonPricePerSquareFootMultiple = (newValue: unknown) => {
        Object.assign(props.appraisal.directComparisonInputs, directComparisonValuesFromPricePerSquareFoot(
            props.appraisal.stabilizedStatement.netOperatingIncome as number,
            sizeOfBuilding,
            newValue as number,
        ));
        props.saveAppraisal(props.appraisal);
    };

    React.useEffect(() => {
        if (comparableSalesQuery.data) {
            const comparableSales = comparableSalesQuery.data as object[];
            setState((currentState) => ({
                ...currentState,
                comparableSales: sortComparables(comparableSales, currentState.sort)
            }));
        }
    }, [comparableSalesQuery.data]);

        const {headers: compHeaders, stats: compStats} = directComparisonColumns(
            props.appraisal.directComparisonInputs.directComparisonMetric,
        );

        return [
            <AppraisalContentHeader key="header" appraisal={props.appraisal} title="Direct Comparison Approach"/>,
            <Row key="body" className={"view-direct-comparison-valuation"}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>

                            <Row>
                                <Col xs={12}>
                                    <DirectComparisonDownloadMenu
                                        isOpen={state.downloadDropdownOpen}
                                        onDownloadWord={downloadWordSummary}
                                        onToggle={toggleDownloadDropdown}
                                    />
                                </Col>
                            </Row>


                            <DirectComparisonComparableSalesSection
                                appraisal={props.appraisal}
                                appraisalId={props.appraisalId}
                                comparableSales={state.comparableSales}
                                headers={compHeaders}
                                stats={compStats}
                                sort={state.sort}
                                navigate={props.navigate}
                                search={props.search}
                                onChange={onComparablesChanged}
                                onSortChanged={onSortChanged}
                            />


                            {
                                props.appraisal.adjustmentChart.showAdjustmentChart ?
                                <DirectComparisonAdjustmentChart
                                    appraisal={props.appraisal}
                                    comparableSales={state.comparableSales}
                                    onChange={() => props.saveAppraisal(props.appraisal)}
                                /> : null
                            }

                            <Row>
                                <Col xs={12} lg={8}>
                                    <div className={"stabilized-statement-centered"}>
                                <h3>Valuation</h3>
                                <div className="horizontal-scroll-hint">Scroll horizontally to review the complete valuation.</div>
                                <div className="valuation-table-scroll" role="region" tabIndex={0} aria-label="Valuation table; scroll horizontally for more columns">
                                <Table className={"statement-table "}>
                                    <tbody>
                                    {/*<tr className={"data-row"}>*/}
                                    {/*<td className={"label-column"}>NOI per square foot</td>*/}
                                    {/*<td className={"amount-column"}></td>*/}
                                    {/*<td className={"amount-total-column"}>todo</td>*/}
                                    {/*</tr>*/}
                                    <tr className={"data-row capitalization-row"}>
                                        <td className={"label-column"}>
                                            <DirectComparisonMetric appraisal={props.appraisal} sizeOfBuilding={sizeOfBuilding} />
                                        </td>

                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                            <CurrencyFormat value={props.appraisal.directComparisonValuation.comparativeValue}/>
                                        </td>
                                    </tr>

                                    {
                                        props.appraisal.directComparisonValuation.marketRentDifferential && props.appraisal.directComparisonInputs.applyMarketRentDifferential ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <TotalMarketRentDifferentialCalculationPopoverWrapper appraisal={props.appraisal}>
                                                        <span>Market Rent Differential</span>
                                                    </TotalMarketRentDifferentialCalculationPopoverWrapper>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <TotalMarketRentDifferentialCalculationPopoverWrapper appraisal={props.appraisal}>
                                                        <CurrencyFormat value={props.appraisal.directComparisonValuation.marketRentDifferential} />
                                                    </TotalMarketRentDifferentialCalculationPopoverWrapper>
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        props.appraisal.directComparisonValuation.freeRentRentLoss && props.appraisal.directComparisonInputs.applyFreeRentLoss ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <TotalRemainingFreeRentPopoverWrapper appraisal={props.appraisal}>
                                                        <span>Remaining Free Rent</span>
                                                    </TotalRemainingFreeRentPopoverWrapper>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <TotalRemainingFreeRentPopoverWrapper appraisal={props.appraisal}>
                                                        <CurrencyFormat value={props.appraisal.directComparisonValuation.freeRentRentLoss} />
                                                    </TotalRemainingFreeRentPopoverWrapper>
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        props.appraisal.directComparisonValuation.vacantUnitLeasupCosts && props.appraisal.directComparisonInputs.applyVacantUnitLeasingCosts ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <Link to={`/appraisal/${props.appraisal._id}/tenants/leasing_costs`}>
                                                        <span>Vacant Unit Leasing Costs</span>
                                                    </Link>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <Link to={`/appraisal/${props.appraisal._id}/tenants/leasing_costs`}>
                                                        <CurrencyFormat value={props.appraisal.directComparisonValuation.vacantUnitLeasupCosts} />
                                                    </Link>
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        props.appraisal.directComparisonValuation.vacantUnitRentLoss && props.appraisal.directComparisonInputs.applyVacantUnitRentLoss ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <Link to={`/appraisal/${props.appraisal._id}/tenants/leasing_costs`}>
                                                        <span>Vacant Unit Gross Rent Loss</span>
                                                    </Link>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <Link to={`/appraisal/${props.appraisal._id}/tenants/leasing_costs`}>
                                                        <CurrencyFormat value={props.appraisal.directComparisonValuation.vacantUnitRentLoss} />
                                                    </Link>
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        props.appraisal.directComparisonValuation.amortizedCapitalInvestment && props.appraisal.directComparisonInputs.applyAmortization ?
                                            <tr className={"data-row capitalization-row"}>
                                                <td className={"label-column"}>
                                                    <Link to={`/appraisal/${props.appraisal._id}/tenants/amortization`}>
                                                        <span>Amortized Capital Investment</span>
                                                    </Link>
                                                </td>
                                                <td className={"amount-column"}></td>
                                                <td className={"amount-total-column"}>
                                                    <Link to={`/appraisal/${props.appraisal._id}/tenants/amortization`}>
                                                        <CurrencyFormat value={props.appraisal.directComparisonValuation.amortizedCapitalInvestment} />
                                                    </Link>
                                                </td>
                                            </tr> : null
                                    }
                                    <DirectComparisonModifierRows
                                        modifiers={props.appraisal.directComparisonInputs.modifiers}
                                        onChange={changeModifier}
                                        onCreate={createNewModifier}
                                    />

                                    <tr className={"data-row valuation-row"}>
                                        <td className={"label-column"}>
                                            <span>Valuation</span>
                                        </td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                            <CurrencyFormat value={props.appraisal.directComparisonValuation.valuation} />
                                        </td>
                                    </tr>

                                    <tr className={"data-row rounding-row"}>
                                        <td className={"label-column"}>
                                            <span>Rounded</span>
                                        </td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                            <CurrencyFormat value={props.appraisal.directComparisonValuation.valuationRounded}/>
                                        </td>
                                    </tr>
                                    </tbody>
                                </Table>
                                </div>
                                <br/>
                                <br/>
                                <h4 className={"final-valuation"}>Final Value by Direct Comparison
                                    Approach <CurrencyFormat value={props.appraisal.directComparisonValuation.valuationRounded} cents={false}/></h4>
                            </div>
                                </Col>
                                <Col xs={12} lg={4}>
                                    <DirectComparisonInputsPanel
                                        appraisal={props.appraisal}
                                        onChangeShowAdjustmentChart={changeShowAdjustmentChart}
                                        onChangeInput={changeDirectComparisonInput}
                                        onChangeNoiMultiple={changeDirectComparisonNOIMultiple}
                                        onChangePricePerSquareFootMultiple={changeDirectComparisonPricePerSquareFootMultiple}
                                    />
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        ];
}

export default ViewDirectComparisonValuation;
