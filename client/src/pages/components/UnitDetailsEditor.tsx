import {Col} from 'reactstrap';
import {
    findLeasingCostStructure,
    findMarketRent,
    nextLeasingStructureName,
} from './unit-details/domain';
import {createMarketRent, updateMarketRentField} from '../../domain/marketRents';
import {
    createLeasingCostStructure,
    defaultLeasingCostStructureName,
    isDefaultLeasingCostStructure,
    updateLeasingCostField,
} from '../../domain/leasingCosts';
import {appendTenancy, removeTenancyAt, updateAllTenancyFields, updateTenancyField, updateUnitField} from '../../domain/unitEditor';
import UnitLeasingAndFinancialFields from './UnitLeasingAndFinancialFields';
import UnitRecoveryCalculationRows from './UnitRecoveryCalculationRows';
import UnitRentAdjustmentCalculationRows from './UnitRentAdjustmentCalculationRows';
import UnitRentSummary from './UnitRentSummary';
import UnitTenantInformationFields from './UnitTenantInformationFields';
import UnitTenancySchedule from './UnitTenancySchedule';
import UnitVacantUnitCalculationRows from './UnitVacantUnitCalculationRows';
import {currentTenancy, isVacant} from '../../domain/appraisal';
import type {LeasingCostStructureDTO, NamedAmountDTO, RecoveryStructureDTO, TenancyDTO} from '../../api/types';
import type {LeasingCostStructure} from '../../domain/leasingCosts';
import type {MarketRent} from '../../domain/marketRents';
import type {UnitCalculationAppraisal, UnitCalculationValues} from './unitCalculationTypes';

export interface EditableUnit extends UnitCalculationValues {
    squareFootage: number;
    tenancies: TenancyDTO[];
}

export interface EditableAppraisal extends UnitCalculationAppraisal {
    appraisalType: string;
    leasingCosts: LeasingCostStructure[];
    marketRents: MarketRent[];
    recoveryStructures: RecoveryStructureDTO[];
    units: EditableUnit[];
}

interface UnitDetailsEditorProps {
    unit: EditableUnit;
    appraisal: EditableAppraisal;
    onChange(unit: EditableUnit): void;
}

/**
 * Keeps the legacy editor's immediate in-place mutations at the compatibility
 * boundary while making its callbacks explicit and independently testable.
 */
function UnitDetailsEditor({unit, appraisal, onChange}: UnitDetailsEditorProps) {
    const tenancy = currentTenancy(unit)!;
    const removeTenancy = (_tenancyInfo: TenancyDTO, tenancyIndex: number) => {
        unit.tenancies = removeTenancyAt(unit.tenancies, tenancyIndex);
        onChange(unit);
    };
    const createNewTenancy = (field?: string, value?: unknown) => {
        unit.tenancies = appendTenancy(unit.tenancies, field, value);
        onChange(unit);
    };
    const changeUnitField = (field: string, newValue: unknown) => {
        Object.assign(unit, updateUnitField(unit, field, newValue));
        onChange(unit);
    };
    const getUnitLeasingCosts = () => findLeasingCostStructure(appraisal, unit, defaultLeasingCostStructureName) as LeasingCostStructureDTO;
    const getUnitMarketRent = () => findMarketRent(appraisal, unit) as NamedAmountDTO | null;
    const ensureUniqueMarketRent = () => {
        const currentMarketRent = getUnitMarketRent();
        if (currentMarketRent === null) {
            const marketRent = createMarketRent({
                name: nextLeasingStructureName(appraisal),
                amountPSF: tenancy.yearlyRent! / unit.squareFootage,
            });
            appraisal.marketRents.push(marketRent);
            unit.marketRent = marketRent.name;
            onChange(unit);
        }
    };
    const changeMarketRentField = (field: string, newValue: unknown) => {
        ensureUniqueMarketRent();
        if (field === 'amountPSF' && newValue === null) {
            for (const marketRent of appraisal.marketRents) {
                if (marketRent.name === unit.marketRent) appraisal.marketRents.splice(appraisal.marketRents.indexOf(marketRent), 1);
            }
            unit.marketRent = null;
            onChange(unit);
        } else {
            const marketRent = getUnitMarketRent()!;
            Object.assign(marketRent, updateMarketRentField(marketRent, field, newValue));
            onChange(unit);
        }
    };
    const ensureUniqueLeasingCosts = () => {
        const currentLeasingCosts = getUnitLeasingCosts();
        if (isDefaultLeasingCostStructure(currentLeasingCosts)) {
            const newLeasingCosts = createLeasingCostStructure({
                name: nextLeasingStructureName(appraisal),
                leasingCommissionPSF: currentLeasingCosts.leasingCommissionPSF,
                tenantInducementsPSF: currentLeasingCosts.tenantInducementsPSF,
                renewalPeriod: currentLeasingCosts.renewalPeriod,
                leasingPeriod: currentLeasingCosts.leasingPeriod,
            });
            appraisal.leasingCosts.push(newLeasingCosts);
            unit.leasingCostStructure = newLeasingCosts.name;
            onChange(unit);
        }
    };
    const changeLeasingCostField = (field: string, newValue: unknown) => {
        ensureUniqueLeasingCosts();
        const leasingCostStructure = getUnitLeasingCosts();
        Object.assign(leasingCostStructure, updateLeasingCostField(leasingCostStructure, field, newValue));
        onChange(unit);
    };
    const changeAllTenantField = (field: string, newValue: unknown) => {
        appraisal.units.forEach((appraisalUnit) => {
            if (appraisalUnit.unitNumber === unit.unitNumber) {
                const nextTenancies = updateAllTenancyFields(unit.tenancies, field, newValue);
                unit.tenancies.forEach((tenancy, tenancyIndex) => {
                    Object.assign(tenancy, nextTenancies[tenancyIndex]);
                });
                Object.assign(tenancy, updateUnitField(tenancy, field, newValue));
            }
        });
        onChange(unit);
    };
    const changeTenancyField = (tenantInfo: TenancyDTO, field: string, newValue: unknown) => {
        Object.assign(tenantInfo, updateTenancyField(tenantInfo, field, newValue, unit.squareFootage));
        onChange(unit);
    };

    return <Col className={"unit-details-editor"}>
                <div>
                    {/*<Card outline color="primary" className="mb-3">*/}
                    <h4 className={"unit-section-title"}>Tenancy & Escalation Schedule</h4>
                </div>
                <UnitRentSummary
                    unit={unit}
                    marketRents={appraisal.marketRents}
                    onChangeUnitField={changeUnitField}
                />
                <br/>
                <div>
                    {/*<Card outline color="primary" className="mb-3">*/}
                    {/*<CardHeader className="text-white bg-primary">Tenancy & Escalation Schedule</CardHeader>*/}
                    {/*<CardBody>*/}
                    <UnitTenancySchedule
                        unit={unit}
                        onChangeTenancy={changeTenancyField}
                        onCreateTenancy={createNewTenancy}
                        onRemoveTenancy={removeTenancy}
                    />
                </div>
            <br/>
            <h4 className={"unit-section-title"}>Tenant Information</h4>
            {/*<CardHeader className="text-white bg-primary">Tenant Information</CardHeader>*/}
            {/*<CardBody>*/}
            <table className="table tenant-information-table">
                <tbody>
                <UnitTenantInformationFields
                    unit={unit}
                    appraisalType={appraisal.appraisalType}
                    recoveryStructures={appraisal.recoveryStructures}
                    leasingCostStructures={appraisal.leasingCosts}
                    onChangeAllTenantField={changeAllTenantField}
                    onChangeUnitField={changeUnitField}
                    onChangeTenancyField={changeTenancyField}
                />
                <UnitLeasingAndFinancialFields
                    appraisalType={appraisal.appraisalType}
                    unit={unit}
                    leasingCosts={appraisal.appraisalType === 'simple' && isVacant(unit)
                        ? getUnitLeasingCosts()
                        : null}
                    marketRent={appraisal.appraisalType === 'simple' ? getUnitMarketRent() : null}
                    marketRents={appraisal.marketRents}
                    onChangeLeasingCostField={changeLeasingCostField}
                    onChangeMarketRentField={changeMarketRentField}
                    onChangeUnitField={changeUnitField}
                />
                <UnitRecoveryCalculationRows appraisal={appraisal} unit={unit}/>
                <UnitRentAdjustmentCalculationRows appraisal={appraisal} unit={unit}/>
                <UnitVacantUnitCalculationRows appraisal={appraisal} unit={unit}/>
                </tbody>
            </table>
            {/*</CardBody>*/}
            {/*</Card>*/}
            {/*<Card outline color="primary" className="mb-3">*/}
            {/*</CardBody>*/}
            {/*</Card>*/}
        </Col>;
}

export default UnitDetailsEditor;
