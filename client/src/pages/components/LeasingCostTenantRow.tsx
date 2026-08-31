import FieldDisplayEdit from './FieldDisplayEdit';
import CurrencyFormat from './CurrencyFormat';
import AreaFormat from './AreaFormat';
import LeasingCostsForUnitCalculationPopoverWrapper from './LeasingCostsForUnitCalculationPopoverWrapper';
import VacantRentLossForUnitCalculationPopoverWrapper from './VacantRentLossForUnitCalculationPopoverWrapper';
import {currentTenancy, isVacant} from '../../domain/appraisal';
import type {LeasingCostStructure} from '../../domain/leasingCosts';
import type {UnitCalculationAppraisal, UnitCalculationValues} from './unitCalculationTypes';

interface LeasingCostTenantRowProps {
    appraisal: UnitCalculationAppraisal;
    leasingCostStructure: LeasingCostStructure;
    onChange(): void;
    onChangeTreatAsVacant(): void;
    unit: UnitCalculationValues;
}

/** One tenant row in a leasing-cost structure; callbacks remain parent-owned. */
export default function LeasingCostTenantRow({appraisal, leasingCostStructure, onChange, onChangeTreatAsVacant, unit}: LeasingCostTenantRowProps) {
    const applies = unit.leasingCostStructure === leasingCostStructure.name;
    const vacant = isVacant(unit);
    const tenancy = currentTenancy(unit)!;
    return <>
        <td className="value-column"><div>Unit {unit.unitNumber} - {tenancy.name}</div><div><FieldDisplayEdit
            type="boolean"
            hideIcon
            value={applies}
            edit={!leasingCostStructure.isDefault}
            onChange={onChange}
            placeholder={`Does leasing cost structure apply to unit ${unit.unitNumber!.toString()}`}
        /></div></td>
        <td className="unit-size-column"><AreaFormat value={unit.squareFootage}/></td>
        <td className="calculated-vacant-unit-leasup-costs-column"><LeasingCostsForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit}>
            {applies && vacant && unit.calculatedVacantUnitLeasupCosts ? <CurrencyFormat value={unit.calculatedVacantUnitLeasupCosts}/> : null}
        </LeasingCostsForUnitCalculationPopoverWrapper></td>
        <td className="calculated-vacant-unit-rent-loss"><VacantRentLossForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit}>
            {applies && vacant ? unit.marketRent ? unit.calculatedVacantUnitRentLoss ? <CurrencyFormat value={unit.calculatedVacantUnitRentLoss}/> : null : <span className="none-found">no market rent</span> : null}
        </VacantRentLossForUnitCalculationPopoverWrapper></td>
        <td className="should-treat-unit-as-vacant-column">{applies ? <FieldDisplayEdit
            type="boolean"
            hideIcon
            value={vacant}
            onChange={onChangeTreatAsVacant}
            placeholder={`Should the unit ${unit.unitNumber!.toString()} be considered vacant when calculating the valuation.`}
        /> : null}</td>
    </>;
}
