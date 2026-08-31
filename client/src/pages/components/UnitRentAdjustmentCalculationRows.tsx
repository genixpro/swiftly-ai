import CurrencyFormat from './CurrencyFormat';
import FreeRentLossForUnitCalculationPopoverWrapper from './FreeRentLossForUnitCalculationPopoverWrapper';
import MarketRentDifferentialForUnitCalculationPopoverWrapper from './MarketRentDifferentialForUnitCalculationPopoverWrapper';
import type {UnitCalculationAppraisal, UnitCalculationValues} from './unitCalculationTypes';

interface UnitCalculationRowsProps {
    appraisal: UnitCalculationAppraisal;
    unit: UnitCalculationValues;
}

/** Preserves the two calculation-popover rows used for market-rent and free-rent adjustments. */
export default function UnitRentAdjustmentCalculationRows({appraisal, unit}: UnitCalculationRowsProps) {
    return <>
        {unit.calculatedMarketRentDifferential ? <tr className="stats-row">
            <td>
                <MarketRentDifferentialForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit}>
                    <strong>Calculated Market Rent Differential</strong>
                </MarketRentDifferentialForUnitCalculationPopoverWrapper>
            </td>
            <td>
                <MarketRentDifferentialForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit}>
                    <span style={{marginLeft: '10px'}}><CurrencyFormat value={unit.calculatedMarketRentDifferential}/></span>
                </MarketRentDifferentialForUnitCalculationPopoverWrapper>
            </td>
        </tr> : null}
        {unit.calculatedFreeRentLoss ? <tr className="stats-row">
            <td>
                <FreeRentLossForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit}>
                    <strong>Calculated Free Rent Loss</strong>
                </FreeRentLossForUnitCalculationPopoverWrapper>
            </td>
            <td>
                <span style={{marginLeft: '10px'}}>
                    <FreeRentLossForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit}>
                        {unit.calculatedFreeRentLoss ? <CurrencyFormat value={unit.calculatedFreeRentLoss}/> : null}
                    </FreeRentLossForUnitCalculationPopoverWrapper>
                </span>
            </td>
        </tr> : null}
    </>;
}
