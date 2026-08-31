import {DroppableFieldDisplayEdit} from './FieldDisplayEdit';
import CurrencyFormat from './CurrencyFormat';
import {unitStabilizedRent} from '../../domain/appraisal';
import type {UnitDTO} from '../../api/types';

interface UnitRentSummaryProps {
    unit: UnitDTO;
    marketRents?: Array<{name?: string | null; amountPSF?: number | null}> | null;
    onChangeUnitField(field: string, value: unknown): void;
}

/** Preserves the rent-summary table and its inline market-rent controls. */
export default function UnitRentSummary({unit, marketRents, onChangeUnitField}: UnitRentSummaryProps) {
    const stabilizedRent = unitStabilizedRent(unit, marketRents);
    return <table>
        <tbody>
        <tr className="stats-row">
            <td>
                <strong>Current Annual Rent (psf)</strong>
            </td>
            <td className="stabilized-rent-column">
                <span style={{marginLeft: '10px'}}>
                    <CurrencyFormat value={unit.squareFootage ? stabilizedRent / unit.squareFootage : null} cents={true}/>
                </span>
                <div className="use-market-rent-selector-container">
                    {unit.marketRent ? <div className="use-market-rent-selector">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <strong>Apply Market Rent</strong>
                        <DroppableFieldDisplayEdit
                            hideIcon={true}
                            type="boolean"
                            placeholder="Use Market Rent for Stabilized Statement?"
                            value={unit.shouldUseMarketRent}
                            onChange={(newValue: unknown) => onChangeUnitField('shouldUseMarketRent', newValue)}/>
                        <br/>
                    </div> : null}
                </div>
            </td>
        </tr>
        <tr className="stats-row">
            <td>
                <strong>Current Annual Rent</strong>
            </td>
            <td className="stabilized-rent-column">
                <span style={{marginLeft: '10px'}}>
                    <CurrencyFormat value={stabilizedRent} cents={false}/>
                </span>
                <div className="use-market-rent-selector-container">
                    {unit.marketRent ? <div className="use-market-rent-selector">
                        <strong>Apply Market Rent Differential</strong>
                        <DroppableFieldDisplayEdit
                            hideIcon={true}
                            type="boolean"
                            placeholder="Apply Market Rent Differential?"
                            value={unit.shouldApplyMarketRentDifferential}
                            onChange={(newValue: unknown) => onChangeUnitField('shouldApplyMarketRentDifferential', newValue)}/>
                    </div> : null}
                </div>
            </td>
        </tr>
        </tbody>
    </table>;
}
