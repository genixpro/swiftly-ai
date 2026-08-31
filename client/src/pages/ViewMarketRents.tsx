import { reportUrl } from "@api/client";
import React from 'react';
import {
    Card,
    CardBody,
    Row,
    Col,
    Button,
    Dropdown,
    DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import {useComparableLeasesByIds} from '@api/hooks';
import '@components/Common/datetime-compat.css'
import ComparableLeaseList from "./components/ComparableLeaseList";
import MarketRentEditor from './components/MarketRentEditor';
import CurrencyFormat from "./components/CurrencyFormat";
import {sortComparables} from '../domain/comparables';
import {
    createNumberedMarketRent,
    removeMarketRent,
    replaceMarketRent,
} from '../domain/marketRents';
import type {MarketRent as DomainMarketRent, MarketRentUnit as DomainMarketRentUnit} from '../domain/marketRents';
import {confirmBrowserAction, navigateBrowserLocation} from '../components/platform/browserActions';

/**
 * This screen still edits the workspace compatibility object in place. Keep
 * that boundary explicit while retaining its established editing sequence and
 * DOM structure for visual and functional parity.
 */
type MarketRent = DomainMarketRent;

interface MarketRentUnit extends DomainMarketRentUnit {
    unitNumber: string | number;
    tenancies: Array<{name: string}>;
    shouldApplyMarketRentDifferential?: boolean;
    shouldUseMarketRent?: boolean;
}

interface MarketRentAppraisal {
    _id: string;
    comparableLeases: string[];
    marketRents: MarketRent[];
    units: MarketRentUnit[];
    stabilizedStatement: {marketRentDifferential: number | null | undefined};
}


interface ViewMarketRentsProps {
    appraisal: MarketRentAppraisal;
    appraisalId?: string;
    navigate?(path: string): void;
    saveAppraisal(appraisal: MarketRentAppraisal): void;
    search?: unknown;
}

interface ViewMarketRentsState {
    comparableLeases: readonly unknown[];
    downloadDropdownOpen?: boolean;
    sort?: unknown;
}



const defaultMarketRentData = {
    name: "New Market Rent",
    amountPSF: 1
};

function ViewMarketRents(props: ViewMarketRentsProps)
{
    const appraisalRef = React.useRef(props.appraisal);
    const comparableLeasesQuery = useComparableLeasesByIds(appraisalRef.current.comparableLeases);
    const [state, setState] = React.useState<ViewMarketRentsState>({
        comparableLeases: []
    });
    const updateState = React.useCallback((updates: Partial<ViewMarketRentsState>) => {
        setState((currentState) => ({...currentState, ...updates}));
    }, []);
    // The legacy class had no sort implementation, but did pass a wrapper to
    // ComparableLeaseList. Preserve that exact interaction surface.
    const legacySortChanged: ((newSort: unknown) => void) | undefined = undefined;
    const onSortChanged = React.useCallback((newSort: unknown) => legacySortChanged!(newSort), [legacySortChanged]);
    const onMarketRentChanged = React.useCallback((marketRent: MarketRent, marketRentIndex: number) => {
        props.appraisal.marketRents = replaceMarketRent(props.appraisal.marketRents, marketRentIndex, marketRent);
        props.saveAppraisal(props.appraisal);
    }, [props]);
    const onNewMarketRent = React.useCallback(() => {
        const marketRent = createNumberedMarketRent(defaultMarketRentData, props.appraisal.marketRents.length);
        props.appraisal.marketRents = [...props.appraisal.marketRents, marketRent];
        props.saveAppraisal(props.appraisal);
    }, [props]);
    const onDeleteMarketRent = React.useCallback((marketRentIndex: number) => {
        if (!confirmBrowserAction('Are you sure you want to delete the market rent?')) return;
        const changes = removeMarketRent(props.appraisal.marketRents, props.appraisal.units, marketRentIndex);
        props.appraisal.marketRents = changes.marketRents;
        props.appraisal.units.forEach((unit, unitIndex) => {
            if (changes.units[unitIndex] !== unit) unit.marketRent = changes.units[unitIndex].marketRent ?? null;
        });
        props.saveAppraisal(props.appraisal);
    }, [props]);
    const onComparablesChanged = React.useCallback((comparableLeases: readonly unknown[]) => {
        updateState({comparableLeases});
    }, [updateState]);
    const downloadMarketRents = React.useCallback(() => {
        navigateBrowserLocation(reportUrl(props.appraisal._id, 'market_rents', 'word'));
    }, [props.appraisal._id]);
    const toggleDownload = React.useCallback(() => {
        updateState({downloadDropdownOpen: !state.downloadDropdownOpen});
    }, [state.downloadDropdownOpen, updateState]);

    React.useEffect(() => {
        if (comparableLeasesQuery.data) {
            const comparableLeases = comparableLeasesQuery.data;
            setState((currentState) => ({
                ...currentState,
                comparableLeases: sortComparables(comparableLeases, currentState.sort as never)
            }));
        }
    }, [comparableLeasesQuery.data]);

        return (
            (props.appraisal) ?
                <div id={"view-market-rents"} className={"view-market-rents"}>
                    <Row>
                        <Col xs={6}>
                            <h2>Market Rents</h2>
                        </Col>
                        <Col xs={6} className={"button-bar"}>
                            <Dropdown isOpen={state.downloadDropdownOpen} toggle={toggleDownload}>
                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                    Download
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={downloadMarketRents}>Market Rents Summary (docx)</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <ComparableLeaseList comparableLeases={state.comparableLeases as never}
                                                 statsTitle={"Statistics for Selected Lease Comps"}
                                                 allowNew={false}
                                                 sort={state.sort}
                                                 onSortChanged={onSortChanged}
                                                 noCompMessage={"There are no comparables attached to this appraisal. Please go to the comparable leases database and select comparables from there."}
                                                 navigate={props.navigate} search={props.search}
                                                 appraisal={props.appraisal}
                                                 appraisalId={props.appraisalId}
                                                 appraisalComparables={props.appraisal.comparableLeases}
                                                 onChange={onComparablesChanged}
                            />
                        </Col>
                    </Row>
                    <br/>
                    <br/>
                    <Row>
                        <Col>
                            <h2>Set Market Rents</h2>

                            <div className={"market-rent-list"}>
                                {
                                    props.appraisal.marketRents.map((marketRent, marketRentIndex) =>
                                    {
                                        return <MarketRentEditor
                                            key={marketRentIndex}
                                            marketRent={marketRent}
                                            appraisal={props.appraisal}
                                            onChange={(newValue: MarketRent) => onMarketRentChanged(newValue, marketRentIndex)}
                                            onDeleteMarketRent={() => onDeleteMarketRent(marketRentIndex)}
                                        />
                                    })
                                }
                                {
                                    props.appraisal.marketRents.length > 1 ?
                                        <Card className={"market-rent-editor"}>
                                            <CardBody>
                                                <table className="market-rent-table">
                                                    <tbody>
                                                    <tr className={"market-rent-row total-row"}>
                                                        <td className={"label-column"}/>
                                                        <td className={"value-column"}>
                                                            <strong>Total Market Rent Differential</strong>
                                                        </td>
                                                        <td className={"calculated-market-rent-differential-column"}>
                                                            <CurrencyFormat value={props.appraisal.stabilizedStatement.marketRentDifferential}/>
                                                        </td>
                                                        <td className={"should-apply-market-rent-differential-column"} />
                                                        <td className={"should-use-market-rent"} />
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </CardBody>
                                        </Card> : null
                                }
                                {
                                    <div className={"new-market-rent"}>
                                        <Button onClick={onNewMarketRent}>
                                            <span>Create a new Market Rent</span>
                                        </Button>
                                    </div>
                                }
                            </div>
                        </Col>
                    </Row>
                </div>
                : null
        );
}

export {MarketRentEditor};
export default ViewMarketRents;
