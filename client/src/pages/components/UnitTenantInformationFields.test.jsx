import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import UnitTenantInformationFields from './UnitTenantInformationFields';

function renderFields(appraisalType = 'detailed') {
    const tenancy = {
        name: 'Existing tenant', rentType: 'net', freeRentMonths: 2,
        freeRentType: 'net', recoveryStructure: 'Standard',
    };
    const unit = {
        unitNumber: '101', floorNumber: 2, squareFootage: 1_000, remarks: 'Existing note',
        leasingCostStructure: 'Standard', shouldTreatAsVacant: false,
        tenancies: [tenancy],
    };
    const onChangeAllTenantField = vi.fn();
    const onChangeUnitField = vi.fn();
    const onChangeTenancyField = vi.fn();

    render(<table><tbody><UnitTenantInformationFields
        unit={unit}
        appraisalType={appraisalType}
        recoveryStructures={[{name: 'Standard'}, {name: 'Gross'}]}
        leasingCostStructures={[{name: 'Standard'}, {name: 'Custom'}]}
        onChangeAllTenantField={onChangeAllTenantField}
        onChangeUnitField={onChangeUnitField}
        onChangeTenancyField={onChangeTenancyField}
    /></tbody></table>);

    return {onChangeAllTenantField, onChangeUnitField, onChangeTenancyField, unit, tenancy};
}

describe('UnitTenantInformationFields', () => {
    it('keeps detailed-only rows and forwards their original unit and tenancy callbacks', async () => {
        const {onChangeAllTenantField, onChangeUnitField, onChangeTenancyField, tenancy} = renderFields();

        expect(screen.getByText('Free Rent Period (months)')).toBeVisible();
        expect(screen.getByText('Recovery Structure')).toBeVisible();
        expect(screen.getByText('Leasing Cost Structure')).toBeVisible();

        const unitNumber = screen.getByPlaceholderText('Unit Number');
        fireEvent.focus(unitNumber);
        fireEvent.change(unitNumber, {target: {value: '102'}});
        fireEvent.blur(unitNumber);
        await waitFor(() => expect(onChangeUnitField).toHaveBeenLastCalledWith('unitNumber', '102'));

        fireEvent.change(screen.getByRole('combobox', {name: 'Recovery Structure'}), {target: {value: 'Gross'}});
        await waitFor(() => expect(onChangeAllTenantField).toHaveBeenLastCalledWith('recoveryStructure', 'Gross'));

        const freeRentMonths = screen.getByPlaceholderText('Free Rent Period (months)');
        fireEvent.focus(freeRentMonths);
        fireEvent.change(freeRentMonths, {target: {value: '3'}});
        fireEvent.blur(freeRentMonths);
        await waitFor(() => expect(onChangeTenancyField).toHaveBeenLastCalledWith(tenancy, 'freeRentMonths', 3));
    });

    it('hides detailed-only rows for simple appraisals while retaining the vacancy callback', async () => {
        const {onChangeUnitField} = renderFields('simple');

        expect(screen.queryByText('Free Rent Period (months)')).not.toBeInTheDocument();
        expect(screen.queryByText('Recovery Structure')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('checkbox', {name: 'Treat Unit as Vacant?'}));
        await waitFor(() => expect(onChangeUnitField).toHaveBeenLastCalledWith('shouldTreatAsVacant', true));
    });
});
