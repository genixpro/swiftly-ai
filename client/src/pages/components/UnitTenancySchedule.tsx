import {Button} from 'reactstrap';

import {DroppableFieldDisplayEdit} from './FieldDisplayEdit';
import {tenancyYearlyRentPSF} from '../../domain/tenancies';
import type {TenancyDTO, UnitDTO} from '../../api/types';

interface UnitTenancyScheduleProps {
    unit: UnitDTO & {tenancies: TenancyDTO[]};
    onChangeTenancy(tenancy: TenancyDTO, field: string, value: unknown): void;
    onCreateTenancy(field?: string, value?: unknown): void;
    onRemoveTenancy(tenancy: TenancyDTO, index: number): void;
}

/** Matches underscore's per-render callback guard used by the legacy name row. */
function once<Value>(callback: (value: Value) => void): (value: Value) => void {
    let invoked = false;
    return (value: Value) => {
        if (invoked) return;
        invoked = true;
        callback(value);
    };
}

/**
 * Presentation-only tenancy schedule. Keeping the field instances and callback
 * timing here preserves the rent-roll editor's existing interaction contract.
 */
export default function UnitTenancySchedule({unit, onChangeTenancy, onCreateTenancy, onRemoveTenancy}: UnitTenancyScheduleProps) {
    const renderTenancy = (tenancy: TenancyDTO, tenancyIndex: number) => <tr
        className="tenant-row"
        key={tenancyIndex}
    >
        <td>
            <DroppableFieldDisplayEdit
                type="text"
                hideIcon={true}
                value={tenancy.name}
                placeholder="name"
                onChange={(newValue: unknown) => onChangeTenancy(tenancy, 'name', newValue)}/>
        </td>
        <td>
            <DroppableFieldDisplayEdit
                type="date"
                hideIcon={true}
                value={tenancy.startDate}
                placeholder="Start Date"
                onChange={(newValue: unknown) => onChangeTenancy(tenancy, 'startDate', newValue)}/>
        </td>
        <td>
            <DroppableFieldDisplayEdit
                type="date"
                hideIcon={true}
                value={tenancy.endDate}
                placeholder="End Date"
                onChange={(newValue: unknown) => onChangeTenancy(tenancy, 'endDate', newValue)}/>
        </td>
        <td>
            <DroppableFieldDisplayEdit
                type="rentType"
                hideIcon={true}
                value={tenancy.rentType}
                placeholder="gross/net"
                onChange={(newValue: unknown) => onChangeTenancy(tenancy, 'rentType', newValue)}/>
        </td>
        <td>
            <DroppableFieldDisplayEdit
                type="currency"
                hideIcon={true}
                value={tenancyYearlyRentPSF(tenancy, unit.squareFootage!)}
                placeholder="yearly rent (psf)"
                onChange={(newValue: unknown) => onChangeTenancy(tenancy, 'yearlyRentPSF', newValue)}/>
        </td>
        <td>
            <DroppableFieldDisplayEdit
                type="currency"
                hideIcon={true}
                value={tenancy.yearlyRent}
                placeholder="yearly rent"
                onChange={(newValue: unknown) => onChangeTenancy(tenancy, 'yearlyRent', newValue)}/>
        </td>
        <td className="action-column">
            {tenancyIndex !== 0 ? <Button
                color="secondary"
                onClick={() => onRemoveTenancy(tenancy, tenancyIndex)}
                title="New Tenancy"
            >
                <i className="fa fa-trash-alt"></i>
            </Button> : null}
        </td>
    </tr>;

    const renderNewTenancyRow = () => <tr className="tenant-row" key={unit.tenancies.length}>
        <td>
            <DroppableFieldDisplayEdit
                hideIcon={true}
                value=""
                placeholder="Name"
                onChange={once((newValue: unknown) => onCreateTenancy('name', newValue))}
            />
        </td>
        <td>
            <DroppableFieldDisplayEdit
                type="date"
                placeholder="Start Date"
                hideIcon={true}
                defaultDate={unit.tenancies.length > 0 ? unit.tenancies[unit.tenancies.length - 1].endDate : new Date()}
                onChange={(newValue: unknown) => onCreateTenancy('startDate', newValue)}
            />
        </td>
        <td>
            <DroppableFieldDisplayEdit
                type="date"
                placeholder="End Date"
                hideIcon={true}
                defaultDate={unit.tenancies.length > 0 ? unit.tenancies[unit.tenancies.length - 1].endDate : new Date()}
                onChange={(newValue: unknown) => onCreateTenancy('endDate', newValue)}
            />
        </td>
        <td>
            <DroppableFieldDisplayEdit
                type="rentType"
                value=""
                placeholder="Net vs Gross"
                hideIcon={true}
                onChange={(newValue: unknown) => onCreateTenancy('rentType', newValue)}/>
        </td>
        <td>
            <DroppableFieldDisplayEdit
                type="currency"
                value=""
                placeholder="Annual rent psf"
                hideIcon={true}
                onChange={(newValue: unknown) => onCreateTenancy('yearlyRentPSF', newValue)}/>
        </td>
        <td>
            <DroppableFieldDisplayEdit
                type="currency"
                value=""
                placeholder="Annual rent"
                hideIcon={true}
                onChange={(newValue: unknown) => onCreateTenancy('yearlyRent', newValue)}/>
        </td>
        <td className="action-column">
            <Button
                color="secondary"
                onClick={() => onCreateTenancy()}
                title="New Tenancy"
            >
                <i className="fa fa-plus-square"></i>
            </Button>
        </td>
    </tr>;

    return <table className="table tenancies-table">
        <thead>
        <tr>
            <td>Tenant Name</td>
            <td>Term Start</td>
            <td>Term End</td>
            <td>Net / Gross</td>
            <td>Annual Rent (psf)</td>
            <td>Annual Rent</td>
            <td className="action-column"/>
        </tr>
        </thead>
        <tbody>
        {unit.tenancies.map(renderTenancy).concat([renderNewTenancyRow()])}
        </tbody>
    </table>;
}
