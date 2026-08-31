import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import UnitTenancySchedule from './UnitTenancySchedule';

const tenancy = {
    name: 'Existing tenant', startDate: '2024-01-01T00:00:00.000Z', endDate: '2025-01-01T00:00:00.000Z',
    rentType: 'net', yearlyRent: 12_000,
};

function renderSchedule() {
    const onChangeTenancy = vi.fn();
    const onCreateTenancy = vi.fn();
    const onRemoveTenancy = vi.fn();
    const unit = {
        squareFootage: 1_000,
        tenancies: [tenancy, {...tenancy, name: 'Later tenant'}],
    };

    render(<UnitTenancySchedule
        unit={unit}
        onChangeTenancy={onChangeTenancy}
        onCreateTenancy={onCreateTenancy}
        onRemoveTenancy={onRemoveTenancy}
    />);

    return {onChangeTenancy, onCreateTenancy, onRemoveTenancy, unit};
}

describe('UnitTenancySchedule', () => {
    it('retains the tenancy schedule headings, rent display, and add/remove controls', () => {
        const {onCreateTenancy, onRemoveTenancy, unit} = renderSchedule();

        expect(screen.getByText('Annual Rent (psf)')).toBeVisible();
        expect(screen.getAllByPlaceholderText('yearly rent (psf)')[0]).toHaveValue('$12.00');

        const tenancyActions = screen.getAllByTitle('New Tenancy');
        fireEvent.click(tenancyActions[0]);
        fireEvent.click(tenancyActions[1]);

        expect(onRemoveTenancy).toHaveBeenCalledWith(unit.tenancies[1], 1);
        expect(onCreateTenancy).toHaveBeenCalledWith();
    });

    it('forwards existing and provisional field edits through the unchanged callback contract', async () => {
        const {onChangeTenancy, onCreateTenancy, unit} = renderSchedule();

        const currentName = screen.getAllByPlaceholderText('name')[0];
        fireEvent.focus(currentName);
        fireEvent.change(currentName, {target: {value: 'Updated tenant'}});
        fireEvent.blur(currentName);
        await waitFor(() => expect(onChangeTenancy).toHaveBeenCalledWith(unit.tenancies[0], 'name', 'Updated tenant'));

        fireEvent.change(screen.getAllByRole('combobox')[0], {target: {value: 'gross'}});
        await waitFor(() => expect(onChangeTenancy).toHaveBeenLastCalledWith(unit.tenancies[0], 'rentType', 'gross'));

        const yearlyRent = screen.getAllByPlaceholderText('yearly rent')[0];
        fireEvent.focus(yearlyRent);
        fireEvent.change(yearlyRent, {target: {value: '$30,000.00'}});
        fireEvent.blur(yearlyRent);
        await waitFor(() => expect(onChangeTenancy).toHaveBeenLastCalledWith(unit.tenancies[0], 'yearlyRent', 30_000));

        const provisionalName = screen.getByPlaceholderText('Name');
        fireEvent.focus(provisionalName);
        fireEvent.change(provisionalName, {target: {value: 'New tenant'}});
        fireEvent.blur(provisionalName);
        await waitFor(() => expect(onCreateTenancy).toHaveBeenCalledWith('name', 'New tenant'));
    });

    it('forwards date and rent-per-square-foot cells without altering the field editor envelopes', async () => {
        const {onChangeTenancy, onCreateTenancy, unit} = renderSchedule();

        fireEvent.change(screen.getAllByPlaceholderText('Start Date')[0], {target: {value: '2024-02-03'}});
        await waitFor(() => expect(onChangeTenancy).toHaveBeenLastCalledWith(
            unit.tenancies[0], 'startDate', new Date('2024-02-03T00:00:00.000Z'),
        ));

        const yearlyRentPSF = screen.getAllByPlaceholderText('yearly rent (psf)')[0];
        fireEvent.focus(yearlyRentPSF);
        fireEvent.change(yearlyRentPSF, {target: {value: '$25.00'}});
        fireEvent.blur(yearlyRentPSF);
        await waitFor(() => expect(onChangeTenancy).toHaveBeenLastCalledWith(unit.tenancies[0], 'yearlyRentPSF', 25));

        fireEvent.change(screen.getAllByPlaceholderText('End Date')[2], {target: {value: '2026-01-02'}});
        await waitFor(() => expect(onCreateTenancy).toHaveBeenLastCalledWith(
            'endDate', new Date('2026-01-02T00:00:00.000Z'),
        ));

        fireEvent.change(screen.getAllByRole('combobox')[2], {target: {value: 'gross'}});
        await waitFor(() => expect(onCreateTenancy).toHaveBeenLastCalledWith('rentType', 'gross'));

        const provisionalRentPSF = screen.getByPlaceholderText('Annual rent psf');
        fireEvent.focus(provisionalRentPSF);
        fireEvent.change(provisionalRentPSF, {target: {value: '$15.00'}});
        fireEvent.blur(provisionalRentPSF);
        await waitFor(() => expect(onCreateTenancy).toHaveBeenLastCalledWith('yearlyRentPSF', 15));
    });
});
