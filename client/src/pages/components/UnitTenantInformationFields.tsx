import {DroppableFieldDisplayEdit} from './FieldDisplayEdit';
import {currentTenancy, isVacant} from '../../domain/appraisal';
import type {LeasingCostStructureDTO, RecoveryStructureDTO, TenancyDTO, UnitDTO} from '../../api/types';

interface UnitTenantInformationFieldsProps {
    unit: UnitDTO;
    appraisalType: string;
    recoveryStructures: RecoveryStructureDTO[];
    leasingCostStructures: LeasingCostStructureDTO[];
    onChangeAllTenantField(field: string, value: unknown): void;
    onChangeUnitField(field: string, value: unknown): void;
    onChangeTenancyField(tenancy: TenancyDTO, field: string, value: unknown): void;
}

/** The shared detailed/simple tenant metadata rows, kept markup-compatible with the original table. */
export default function UnitTenantInformationFields({
    unit,
    appraisalType,
    recoveryStructures,
    leasingCostStructures,
    onChangeAllTenantField,
    onChangeUnitField,
    onChangeTenancyField,
}: UnitTenantInformationFieldsProps) {
    const tenancy = currentTenancy(unit)!;
    return <>
        <tr>
            <td>
                <strong>Tenant Name</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit placeholder="Tenant Name" value={tenancy.name}
                    onChange={(newValue: unknown) => onChangeAllTenantField('name', newValue)}/>
            </td>
        </tr>
        <tr>
            <td>
                <strong>Unit Number</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit placeholder="Unit Number"
                    value={unit.unitNumber}
                    type="text"
                    onChange={(newValue: unknown) => onChangeUnitField('unitNumber', newValue)}/>
            </td>
        </tr>
        <tr>
            <td>
                <strong>Floor Number</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit
                    placeholder="Floor Number"
                    value={unit.floorNumber}
                    onChange={(newValue: unknown) => onChangeUnitField('floorNumber', newValue)}
                    type="number"
                />
            </td>
        </tr>
        <tr>
            <td>
                <strong>Unit Size</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit type="area" placeholder="Unit Size" value={unit.squareFootage}
                    onChange={(newValue: unknown) => onChangeUnitField('squareFootage', newValue)}/>
            </td>
        </tr>
        <tr>
            <td>
                <strong>Net / Gross</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit type="rentType" value={tenancy.rentType}
                    onChange={(newValue: unknown) => onChangeAllTenantField('rentType', newValue)}/>
            </td>
        </tr>
        {appraisalType === 'detailed' ? <tr>
            <td>
                <strong>Free Rent Period (months)</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit type="months" placeholder="Free Rent Period (months)"
                    value={tenancy.freeRentMonths}
                    onChange={(newValue: unknown) => onChangeTenancyField(tenancy, 'freeRentMonths', newValue)}/>
            </td>
        </tr> : null}
        {appraisalType === 'detailed' ? <tr>
            <td>
                <strong>Free Rent Type</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit type="rentType"
                    value={tenancy.freeRentType}
                    onChange={(newValue: unknown) => onChangeAllTenantField('freeRentType', newValue)}/>
            </td>
        </tr> : null}
        {appraisalType === 'detailed' ? <tr>
            <td>
                <strong>Recovery Structure</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit type="recoveryStructure" placeholder="Recovery Structure"
                    recoveryStructures={recoveryStructures as never}
                    value={tenancy.recoveryStructure}
                    onChange={(newValue: unknown) => onChangeAllTenantField('recoveryStructure', newValue)}/>
            </td>
        </tr> : null}
        {appraisalType === 'detailed' ? <tr>
            <td>
                <strong>Leasing Cost Structure</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit type="leasingCostStructure" placeholder="Leasing Cost Structure"
                    leasingCostStructures={leasingCostStructures as never}
                    value={unit.leasingCostStructure}
                    onChange={(newValue: unknown) => onChangeUnitField('leasingCostStructure', newValue)}/>
            </td>
        </tr> : null}
        <tr>
            <td>
                <strong>Remarks</strong>
            </td>
            <td>
                <DroppableFieldDisplayEdit value={unit.remarks} placeholder="Remarks"
                    onChange={(newValue: unknown) => onChangeUnitField('remarks', newValue)}/>
            </td>
        </tr>
        <tr>
            <td>
                <strong>Consider as Vacant Unit</strong>
            </td>
            <td style={{paddingTop: '10px', paddingLeft: '15px', paddingBottom: '10px'}}>
                <DroppableFieldDisplayEdit
                    value={isVacant(unit)}
                    type="boolean"
                    hideIcon={true}
                    placeholder="Treat Unit as Vacant?"
                    onChange={(newValue: unknown) => onChangeUnitField('shouldTreatAsVacant', newValue)}
                />
            </td>
        </tr>
    </>;
}
