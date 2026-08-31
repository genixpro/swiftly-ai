import {Link} from 'react-router';

import CurrencyFormat from './CurrencyFormat';
import LeasingCostsForUnitCalculationPopoverWrapper from './LeasingCostsForUnitCalculationPopoverWrapper';
import VacantRentLossForUnitCalculationPopoverWrapper from './VacantRentLossForUnitCalculationPopoverWrapper';
import type {UnitCalculationAppraisal, UnitCalculationValues} from './unitCalculationTypes';

interface UnitCalculationRowsProps {
    appraisal: UnitCalculationAppraisal;
    unit: UnitCalculationValues;
}

/** Retains detailed links and simple-appraisal popovers for vacant-unit calculation outputs. */
export default function UnitVacantUnitCalculationRows({appraisal, unit}: UnitCalculationRowsProps) {
    const detailed = appraisal.appraisalType === 'detailed';
    const leasingCostsUrl = `/appraisal/${appraisal._id}/tenants/leasing_costs`;

    return <>
        {unit.calculatedVacantUnitRentLoss ? <tr className="stats-row">
            <td>
                {detailed ? <Link to={leasingCostsUrl}><strong>Calculated Vacant Unit Rent Loss</strong></Link>
                    : <strong>Calculated Vacant Unit Rent Loss</strong>}
            </td>
            <td>
                {detailed ? <Link to={leasingCostsUrl}>
                    <span style={{marginLeft: '10px'}}><CurrencyFormat value={unit.calculatedVacantUnitRentLoss}/></span>
                </Link> : <VacantRentLossForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit}>
                    <span style={{marginLeft: '10px'}}><CurrencyFormat value={unit.calculatedVacantUnitRentLoss}/></span>
                </VacantRentLossForUnitCalculationPopoverWrapper>}
            </td>
        </tr> : null}
        {unit.calculatedVacantUnitLeasupCosts ? <tr className="stats-row">
            <td>
                {detailed ? <Link to={leasingCostsUrl}><strong>Calculated Vacant Unit Leaseup Costs</strong></Link>
                    : <LeasingCostsForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit}>
                        <strong>Calculated Vacant Unit Leaseup Costs</strong>
                    </LeasingCostsForUnitCalculationPopoverWrapper>}
            </td>
            <td>
                {detailed ? <Link to={leasingCostsUrl}>
                    <span style={{marginLeft: '10px'}}><CurrencyFormat value={unit.calculatedVacantUnitLeasupCosts}/></span>
                </Link> : <LeasingCostsForUnitCalculationPopoverWrapper appraisal={appraisal} unit={unit}>
                    <span style={{marginLeft: '10px'}}><CurrencyFormat value={unit.calculatedVacantUnitLeasupCosts}/></span>
                </LeasingCostsForUnitCalculationPopoverWrapper>}
            </td>
        </tr> : null}
    </>;
}
