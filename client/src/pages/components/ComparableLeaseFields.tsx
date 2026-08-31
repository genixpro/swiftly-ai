import {Button} from 'reactstrap';
import FieldDisplayEdit from './FieldDisplayEdit';
import type {ComparableLeaseCardRecord, ComparableLeaseRentEscalationDraft} from '../../domain/comparableLeaseDraft';

interface ComparableLeaseFieldsProps {
    comparableLease: ComparableLeaseCardRecord;
    editable: boolean;
    appraisalLocation?: {coordinates?: [number, number]} | null;
    onChange: (field: string, value: unknown) => void;
    onChangeEscalation: (index: number, field: string, value: unknown) => void;
    onRemoveEscalation: (index: number) => void;
    onCreateEscalation: (field: string, value: unknown) => void;
}

/**
 * The lease-detail form in its established visual order. State, persistence, and
 * all reducer actions stay in ComparableLeaseListItem to retain interaction timing.
 */
export default function ComparableLeaseFields({
    comparableLease,
    editable,
    appraisalLocation,
    onChange,
    onChangeEscalation,
    onRemoveEscalation,
    onCreateEscalation,
}: ComparableLeaseFieldsProps) {
    const field = (label: string, type: string, placeholder: string, value: unknown, name: string, extras: Record<string, unknown> = {}) => <>
        <span className="comparable-field-label">{label}</span>
        <FieldDisplayEdit
            type={type}
            edit={editable}
            placeholder={placeholder}
            value={value}
            onChange={(newValue) => onChange(name, newValue)}
            {...extras}
        />
    </>;
    const escalations = comparableLease.rentEscalations || [];

    return <>
        {field('Address:', 'address', 'Address', comparableLease.address, 'address', {
            location: appraisalLocation ? {lat: () => appraisalLocation.coordinates![1], lng: () => appraisalLocation.coordinates![0]} : null,
            onGeoChange: (newValue: {lng: number; lat: number}) => onChange('location', {type: 'Point', coordinates: [newValue.lng, newValue.lat]}),
        })}
        {field('Property Type:', 'propertyType', 'Property Type', comparableLease.propertyType, 'propertyType')}
        {field('Sub Type:', 'tags', 'Property Tags', comparableLease.propertyTags, 'propertyTags', {propertyType: comparableLease.propertyType as string | null | undefined})}
        {field('Tenancy Is:', 'tenancyType', 'Tenancy Is', comparableLease.tenancyType, 'tenancyType')}
        {field('Size Of Unit: ', 'area', 'Size of Unit', comparableLease.sizeOfUnit, 'sizeOfUnit')}
        <span className="comparable-field-label">Yearly Rent:</span>
        <div className="escalation-list">
            {escalations.map((escalation, escalationIndex) => <EscalationRow
                key={escalationIndex}
                escalation={escalation}
                editable={editable}
                onChange={(name, value) => onChangeEscalation(escalationIndex, name, value)}
                onRemove={() => onRemoveEscalation(escalationIndex)}
                removeLabel={`Remove rent escalation ${escalationIndex + 1}`}
            />)}
            <NewEscalationRow
                editable={editable}
                onCreate={onCreateEscalation}
            />
        </div>
        <span className="comparable-field-label">Free Rent:</span>
        <div className="free-rent">
            <FieldDisplayEdit type="months" edit={editable} placeholder="# of Months" value={comparableLease.freeRentMonths} onChange={(value) => onChange('freeRentMonths', value)} />
            <FieldDisplayEdit type="rentType" edit={editable} placeholder="Free Rent Type" value={comparableLease.freeRentType} onChange={(value) => onChange('freeRentType', value)} />
        </div>
        {field('Tenant Inducements:', 'text', 'Tenant Inducements', comparableLease.tenantInducements, 'tenantInducements')}
        {field('TMI (psf):', 'currency', 'Taxes Maintenance Insurance', comparableLease.taxesMaintenanceInsurance, 'taxesMaintenanceInsurance')}
        {field('Net / Gross:', 'rentType', 'Net / Gross', comparableLease.rentType, 'rentType')}
        {comparableLease.propertyType === 'office' ? field('Floor Number:', 'number', 'Floor Number', comparableLease.floorNumber, 'floorNumber') : null}
        {comparableLease.propertyType === 'retail' ? field('Retail Location:', 'retailLocationType', 'Retail Location', comparableLease.retailLocationType, 'retailLocationType') : null}
        {comparableLease.propertyType === 'industrial' ? <IndustrialLeaseFields comparableLease={comparableLease} editable={editable} onChange={onChange} /> : null}
        {field('Tenant Name:', 'tenantName', 'Tenant Name', comparableLease.tenantName, 'tenantName')}
        {field('Lease Date:', 'date', 'Lease Date', comparableLease.leaseDate, 'leaseDate')}
        {field('Remarks:', 'text', 'Remarks', comparableLease.remarks, 'remarks')}
    </>;
}

interface EscalationRowProps {
    escalation: ComparableLeaseRentEscalationDraft;
    editable: boolean;
    onChange: (field: string, value: unknown) => void;
    onRemove: () => void;
    removeLabel: string;
}

function EscalationRow({escalation, editable, onChange, onRemove, removeLabel}: EscalationRowProps) {
    return <div className="escalation">
        From:
        <FieldDisplayEdit type="number" hideIcon edit={editable} placeholder="Start Year" value={escalation.startYear} onChange={(value) => onChange('startYear', value)} />
        To:
        <FieldDisplayEdit type="number" hideIcon edit={editable} placeholder="End Year" value={escalation.endYear} onChange={(value) => onChange('endYear', value)} />
        Rent:
        <FieldDisplayEdit type="currency" hideIcon edit={editable} placeholder="Yearly Rent" value={escalation.yearlyRent} onChange={(value) => onChange('yearlyRent', value)} />
        <Button color="secondary" onClick={onRemove} aria-label={removeLabel}><i className="fa fa-trash" aria-hidden="true" /></Button>
    </div>;
}

interface NewEscalationRowProps {
    editable: boolean;
    onCreate: (field: string, value: unknown) => void;
}

function NewEscalationRow({editable, onCreate}: NewEscalationRowProps) {
    return <div className="escalation">
        From:
        <FieldDisplayEdit type="number" hideIcon edit={editable} placeholder="Start Year" onChange={(value) => onCreate('startYear', value)} />
        To:
        <FieldDisplayEdit type="number" hideIcon edit={editable} placeholder="End Year" onChange={(value) => onCreate('endYear', value)} />
        Rent:
        <FieldDisplayEdit type="currency" hideIcon edit={editable} placeholder="Yearly Rent" onChange={(value) => onCreate('yearlyRent', value)} />
        <Button color="secondary" onClick={() => onCreate('yearlyRent', 0)} aria-label="Add rent escalation"><i className="fa fa-plus" aria-hidden="true" /></Button>
    </div>;
}

function IndustrialLeaseFields({comparableLease, editable, onChange}: Pick<ComparableLeaseFieldsProps, 'comparableLease' | 'editable' | 'onChange'>) {
    return <>
        <span className="comparable-field-label">Finished Office Percentage:</span>
        <FieldDisplayEdit type="length" edit={editable} placeholder="Finished Office Percentage" value={comparableLease.finishedOfficePercentage} onChange={(value) => onChange('finishedOfficePercentage', value)} />
        <span className="comparable-field-label">Clear Ceiling Height:</span>
        <FieldDisplayEdit type="length" edit={editable} placeholder="Clear Ceiling Height" value={comparableLease.clearCeilingHeight} onChange={(value) => onChange('clearCeilingHeight', value)} />
        <span className="comparable-field-label">Shipping Doors:</span>
        <div className="shipping-doors">
            <ShippingDoor title="Double Man:" placeholder="Shipping Doors Double Man" value={comparableLease.shippingDoorsDoubleMan} editable={editable} onChange={(value) => onChange('shippingDoorsDoubleMan', value)} />
            <ShippingDoor title="Drive In:" placeholder="Shipping Doors Drive In" value={comparableLease.shippingDoorsDriveIn} editable={editable} onChange={(value) => onChange('shippingDoorsDriveIn', value)} />
            <ShippingDoor title="Truck Level:" placeholder="Shipping Doors Truck Level" value={comparableLease.shippingDoorsTruckLevel} editable={editable} onChange={(value) => onChange('shippingDoorsTruckLevel', value)} />
        </div>
    </>;
}

function ShippingDoor({title, placeholder, value, editable, onChange}: {title: string; placeholder: string; value: unknown; editable: boolean; onChange: (value: unknown) => void}) {
    return <div className="shipping-doors-line">
        <div><span>{title}</span></div>
        <FieldDisplayEdit type="number" edit={editable} placeholder={placeholder} value={value} onChange={onChange} />
    </div>;
}
