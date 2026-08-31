import {DroppableFieldDisplayEdit} from './FieldDisplayEdit';
import type {LeasingCostStructureDTO, NamedAmountDTO, UnitDTO} from '../../api/types';
import {isVacant} from '../../domain/appraisal';

interface UnitLeasingAndFinancialFieldsProps {
    appraisalType: string;
    unit: UnitDTO;
    leasingCosts: LeasingCostStructureDTO | null;
    marketRent: NamedAmountDTO | null;
    marketRents: NamedAmountDTO[];
    onChangeLeasingCostField(field: string, value: unknown): void;
    onChangeMarketRentField(field: string, value: unknown): void;
    onChangeUnitField(field: string, value: unknown): void;
}

/** Simple-appraisal leasing controls plus the shared Financials heading and market-rent field. */
export default function UnitLeasingAndFinancialFields({
    appraisalType,
    unit,
    leasingCosts,
    marketRent,
    marketRents,
    onChangeLeasingCostField,
    onChangeMarketRentField,
    onChangeUnitField,
}: UnitLeasingAndFinancialFieldsProps) {
    const isSimpleVacantUnit = appraisalType === 'simple' && isVacant(unit);
    // The detailed branch preserves the legacy null input; fields below only
    // read this record when the simple-vacant branch is active.
    const activeLeasingCosts = leasingCosts as LeasingCostStructureDTO;
    const usesPercentCommission = isSimpleVacantUnit && activeLeasingCosts.leasingCommissionMode === 'percent_of_rent';

    return <>
        {isSimpleVacantUnit ? <tr>
            <td>
                <strong>Leasing Commission</strong>
            </td>
            <td className="leasing-commission-line">
                {activeLeasingCosts.leasingCommissionMode === 'psf' ? <DroppableFieldDisplayEdit
                    type="currency"
                    value={activeLeasingCosts.leasingCommissionPSF}
                    hideInput={true}
                    hideIcon={true}
                    onChange={(newValue: unknown) => onChangeLeasingCostField('leasingCommissionPSF', newValue)}
                /> : null}
                <DroppableFieldDisplayEdit
                    type="leasingCommissionMode"
                    value={activeLeasingCosts.leasingCommissionMode}
                    hideInput={true}
                    hideIcon={true}
                    onChange={(newValue: unknown) => onChangeLeasingCostField('leasingCommissionMode', newValue)}
                />
            </td>
        </tr> : null}
        {usesPercentCommission ? <tr>
            <td>
                <strong>Leasing Commission - Year 1</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit
                    type="percent"
                    value={activeLeasingCosts.leasingCommissionPercentYearOne}
                    hideInput={true}
                    hideIcon={true}
                    onChange={(newValue: unknown) => onChangeLeasingCostField('leasingCommissionPercentYearOne', newValue)}
                />
            </td>
        </tr> : null}
        {usesPercentCommission ? <tr>
            <td>
                <strong>Leasing Commission - Remaining Years</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit
                    type="percent"
                    value={activeLeasingCosts.leasingCommissionPercentRemainingYears}
                    hideInput={true}
                    hideIcon={true}
                    onChange={(newValue: unknown) => onChangeLeasingCostField('leasingCommissionPercentRemainingYears', newValue)}
                />
            </td>
        </tr> : null}
        {isSimpleVacantUnit ? <tr>
            <td>
                <strong>Tenant Inducements (psf)</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit placeholder="Leasing Costs (psf)"
                    value={activeLeasingCosts.tenantInducementsPSF}
                    type="currency"
                    onChange={(newValue: unknown) => onChangeLeasingCostField('tenantInducementsPSF', newValue)}/>
            </td>
        </tr> : null}
        {isSimpleVacantUnit ? <tr>
            <td>
                <strong>Renewal Period</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit placeholder="Leasing Renewal Period"
                    value={activeLeasingCosts.renewalPeriod}
                    type="months"
                    onChange={(newValue: unknown) => onChangeLeasingCostField('renewalPeriod', newValue)}/>
            </td>
        </tr> : null}
        <tr>
            <td colSpan={2}>
                <br/>
                <h4 className="unit-section-title">Financials</h4>
            </td>
        </tr>
        {appraisalType === 'simple' ? <tr>
            <td>
                <strong>Market Rent (psf)</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit placeholder="Market Rent (psf)"
                    value={marketRent ? marketRent.amountPSF : null}
                    type="currency"
                    onChange={(newValue: unknown) => onChangeMarketRentField('amountPSF', newValue)}/>
            </td>
        </tr> : null}
        {appraisalType === 'detailed' ? <tr>
            <td>
                <strong>Market Rent</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit type="marketRent" placeholder="Market Rent" marketRents={marketRents as never}
                    value={unit.marketRent}
                    onChange={(newValue: unknown) => onChangeUnitField('marketRent', newValue)}/>
            </td>
        </tr> : null}
    </>;
}
