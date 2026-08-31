import type {CSSProperties, FocusEventHandler, KeyboardEventHandler} from 'react';
import {Input, InputGroup} from 'reactstrap';
import Datetime, {type DateValue} from '@components/Common/DatetimeCompat';
import PropertyTypeSelector from '../PropertyTypeSelector';
import RentTypeSelector from '../RentTypeSelector';
import MarketRentSelector from '../MarketRentSelector';
import RetailLocationTypeSelector from '../RetailLocationTypeSelector';
import ZoneSelector from '../ZoneSelector';
import TagEditor from '../TagEditor';
import CalculationFieldSelector from '../CalculationFieldSelector';
import LeasingCostsSelector from '../LeasingCostsSelector';
import IncomeItemTypeSelector from '../IncomeItemTypeSelector';
import RecoveryStructureSelector from '../RecoveryStructureSelector';
import ManagementExpenseModeSelector from '../ManagementExpenseModeSelector';
import LeasingComissionModeSelector from '../LeasingCommissionModeSelector';
import ManagementRecoveryModeSelector from '../ManagementRecoveryModeSelector';
import DirectComparisonMetricSelector from '../DirectComparisonMetricSelector';
import TenancyTypeSelector from '../TenancyTypeSelector';
import TenantNameSelector from '../TenantNameSelector';
import AdjustmentTypeSelector from '../AdjustmentTypeSelector';
import type {FieldValueType} from './values';
import {setBrowserTimer} from '../../../components/platform/browserTimers';

export interface LegacyFieldDisplayEditProps {
    cashFlowType?: string;
    defaultDate?: unknown;
    edit?: boolean;
    exclude?: string[];
    expenses?: unknown[];
    isSearch?: boolean;
    leasingCostStructures?: Array<{name: string}> | null;
    marketRents?: Array<{name: string; amountPSF: number}> | null;
    placeholder?: string;
    hideIcon?: boolean;
    location?: {lat(): number; lng(): number} | null;
    onGeoChange?(value: {lat: number; lng: number}): void;
    propertyType?: string | null;
    recoveryStructures?: Array<{name: string}> | null;
    style?: CSSProperties;
    title?: string;
    type?: FieldValueType;
    value?: unknown;
}

interface FieldEditorInputProps {
    accessibleLabel?: string;
    formatValue(value: unknown): unknown;
    inputRef(inputElement: HTMLElement | null): void;
    isEditing: boolean;
    onBlur(): void;
    onDateChange(value: unknown): void;
    onFocus: FocusEventHandler<HTMLElement>;
    onInputChange(value: string): void;
    onKeyPress: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onSelectChange(value: unknown): void;
    onTagsChange(value: unknown): void;
    onTenantNameChange(value: unknown): void;
    onZoneChange(value: unknown): void;
    props: LegacyFieldDisplayEditProps;
    value: unknown;
}

// This component deliberately preserves the editor's legacy markup and props.
// It only separates input selection from the focus/commit state machine.
export default function FieldEditorInput({
    accessibleLabel,
    formatValue,
    inputRef,
    isEditing,
    onDateChange,
    onFocus,
    onInputChange,
    onKeyPress,
    onSelectChange,
    onTagsChange,
    onTenantNameChange,
    onZoneChange,
    onBlur,
    props,
    value,
}: FieldEditorInputProps) {
    const displayedValue = isEditing ? value : props.value;
    const formattedValue = isEditing ? value : formatValue(props.value);

    return <InputGroup onFocus={onFocus} title={accessibleLabel} style={props.style}>
        {props.type === 'textbox' ? <textarea
            placeholder={props.placeholder}
            title={accessibleLabel}
            aria-label={accessibleLabel}
            disabled={!props.edit}
            value={formattedValue as string | number | readonly string[] | undefined}
            onChange={(evt) => onInputChange(evt.target.value)}
            ref={inputRef}
            onKeyPress={onKeyPress}
            onBlur={onBlur}
            rows={1}
        /> : null}
        {props.type === 'currency' || props.type === 'number' || props.type === 'float' || props.type === 'percent' ||
        props.type === 'text' || props.type === 'length' || props.type === 'area' || props.type === 'acres' ||
        props.type === 'months' || !props.type ? <Input
            placeholder={props.placeholder}
            disabled={!props.edit}
            title={accessibleLabel}
            aria-label={accessibleLabel}
            value={formattedValue as string | number | readonly string[] | undefined}
            onChange={(evt) => onInputChange(evt.target.value)}
            innerRef={inputRef}
            onKeyPress={onKeyPress}
            onBlur={onBlur}
        /> : null}
        {props.type === 'date' ? <Datetime
            inputProps={{className: 'form-control', disabled: !props.edit, placeholder: props.placeholder, 'aria-label': accessibleLabel}}
            dateFormat="YYYY/MM/DD"
            title={accessibleLabel}
            timeFormat={false}
            input
            viewDate={(props.defaultDate ? props.defaultDate : props.value ? props.value : new Date()) as DateValue}
            utc
            closeOnSelect
            value={formattedValue as DateValue}
            onChange={(newValue) => newValue !== '' ? onDateChange(newValue.toDate()) : onDateChange(null)}
            onBlur={() => setBrowserTimer(onBlur, 100)}
        /> : null}
        {props.type === 'propertyType' ? <PropertyTypeSelector value={displayedValue} title={accessibleLabel} disabled={!props.edit} onChange={onSelectChange} onBlur={onBlur} isSearch={props.isSearch} innerRef={inputRef}/> : null}
        {props.type === 'rentType' ? <RentTypeSelector value={displayedValue} title={accessibleLabel} disabled={!props.edit} onChange={onSelectChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'incomeItemType' ? <IncomeItemTypeSelector value={displayedValue} title={accessibleLabel} disabled={!props.edit} cashFlowType={props.cashFlowType as 'income' | 'expense' | undefined} onChange={onSelectChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'retailLocationType' ? <RetailLocationTypeSelector value={displayedValue} title={accessibleLabel} disabled={!props.edit} onChange={onSelectChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'adjustmentType' ? <AdjustmentTypeSelector value={displayedValue} title={accessibleLabel} disabled={!props.edit} onChange={onSelectChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'marketRent' ? <MarketRentSelector value={props.value ?? ''} title={accessibleLabel} disabled={!props.edit} marketRents={props.marketRents} onChange={onSelectChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'recoveryStructure' ? <RecoveryStructureSelector value={props.value ?? ''} disabled={!props.edit} title={accessibleLabel} recoveryStructures={props.recoveryStructures} onChange={onSelectChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'leasingCostStructure' ? <LeasingCostsSelector value={props.value ?? ''} disabled={!props.edit} title={accessibleLabel} leasingCostStructures={props.leasingCostStructures} onChange={onSelectChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'boolean' ? <input type="checkbox" checked={props.value as boolean} disabled={!props.edit} title={accessibleLabel} aria-label={accessibleLabel} onChange={() => onSelectChange(!props.value)} onBlur={onBlur} ref={inputRef}/> : null}
        {props.type === 'calculationField' ? <CalculationFieldSelector expenses={props.expenses} value={displayedValue} disabled={!props.edit} title={accessibleLabel} onChange={onSelectChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'managementExpenseMode' ? <ManagementExpenseModeSelector value={displayedValue} disabled={!props.edit} exclude={props.exclude} title={accessibleLabel} onChange={onSelectChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'managementRecoveryMode' ? <ManagementRecoveryModeSelector value={displayedValue} disabled={!props.edit} title={accessibleLabel} onChange={onSelectChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'directComparisonMetric' ? <DirectComparisonMetricSelector value={displayedValue} disabled={!props.edit} title={accessibleLabel} onChange={onSelectChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'zone' ? <ZoneSelector title={accessibleLabel} disabled={!props.edit} value={displayedValue as string | null | undefined} onChange={onZoneChange} onBlur={onBlur}/> : null}
        {props.type === 'leasingCommissionMode' ? <LeasingComissionModeSelector title={accessibleLabel} disabled={!props.edit} value={displayedValue} onChange={onSelectChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'tenancyType' ? <TenancyTypeSelector value={displayedValue} title={accessibleLabel} disabled={!props.edit} onChange={onSelectChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'tenantName' ? <TenantNameSelector value={displayedValue as string | null | undefined} title={accessibleLabel} disabled={!props.edit} onChange={onTenantNameChange} onBlur={onBlur} innerRef={inputRef}/> : null}
        {props.type === 'tags' ? <TagEditor disabled={!props.edit} propertyType={props.propertyType ?? undefined} title={accessibleLabel} value={displayedValue as string[] | null | undefined} onChange={onTagsChange} onBlur={onBlur}/> : null}
        {props.type === 'address' ? <Input
            title={accessibleLabel}
            aria-label={accessibleLabel}
            placeholder={props.placeholder}
            disabled={!props.edit}
            value={formattedValue as string | number | readonly string[] | undefined}
            onChange={(evt) => onInputChange(evt.target.value)}
            innerRef={inputRef}
            onKeyPress={onKeyPress}
            onBlur={onBlur}
        /> : null}
    </InputGroup>;
}
