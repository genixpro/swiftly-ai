import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('./UnitDetailsEditor', () => ({default: ({unit}) => <div>Unit details for {unit.unitNumber}</div>}));

import {createUnit} from '../../domain/appraisal';
import UnitsTable, {UnitRow} from './UnitsTable';
import {defaultUnitFields, unitFieldConfiguration} from './unitsTableFields';

describe('UnitRow characterization', () => {
    it('retains the established rent-roll column order, headings, and CSS hooks', () => {
        expect(defaultUnitFields(false)).toEqual(['unitNumber', 'tenantName', 'squareFootage', 'stabilizedRentPSF', 'stabilizedRent']);
        expect(defaultUnitFields(true)).toEqual(['unitNumber', 'tenantName', 'squareFootage', 'stabilizedRentPSF', 'stabilizedRent']);

        const fields = unitFieldConfiguration();
        expect(Object.entries(fields).map(([key, value]) => [key, value.title, value.className])).toEqual([
            ['unitNumber', 'Unit Number', 'unit-number-column'],
            ['tenantName', 'Tenant Name', 'tenant-name-column'],
            ['squareFootage', 'Size (sf)', 'square-footage-column'],
            ['yearlyRentPSF', 'Rent (psf)', 'rent-column'],
            ['yearlyRent', 'Annual Rent', 'rent-column'],
            ['stabilizedRentPSF', 'Rent (psf)', 'rent-column'],
            ['stabilizedRent', 'Annual Rent', 'rent-column'],
        ]);
    });

    it('opens the deep-linked unit and preserves row, drag-handle, and delete interactions', async () => {
        const unit = createUnit({unitNumber: '101', tenancies: []});
        const removeUnit = vi.fn();
        render(<table><tbody><UnitRow
            unit={unit}
            unitIndex={1}
            appraisal={{}}
            allowSelection
            search="?unit=1"
            fields={['unitNumber']}
            fieldConfiguration={{unitNumber: {className: 'unit-number', render: (value) => value.unitNumber}}}
            onUnitClicked={vi.fn()}
            onChangeUnit={vi.fn()}
            removeUnit={removeUnit}
            dragHandleProps={{attributes: {}, listeners: {}}}
        /></tbody></table>);

        expect(await screen.findByText('Unit details for 101')).toBeVisible();
        expect(screen.getByRole('button', {name: 'Reorder unit'})).toBeInTheDocument();
        fireEvent.click(screen.getByTitle('Delete Unit'));
        expect(removeUnit).toHaveBeenCalledWith(unit, 1);
    });

    it('creates a plain compatible unit with the legacy defaults and opens it immediately', () => {
        const onCreateUnit = vi.fn();
        const onUnitClicked = vi.fn();
        render(<UnitsTable
            appraisal={{units: [], marketRents: []}}
            onCreateUnit={onCreateUnit}
            onUnitClicked={onUnitClicked}
            onUnitChanged={vi.fn()}
            onChangeUnitOrder={vi.fn()}
        />);

        fireEvent.click(screen.getByTitle('New Unit'));
        const unit = onCreateUnit.mock.calls[0][0];
        expect(unit).toMatchObject({
            unitNumber: 'new 0', floorNumber: 1, squareFootage: 1,
            tenancies: [{name: 'Vacant', yearlyRent: 0}],
        });
        expect(unit.tenancies[0].name).toBe('Vacant');
        expect(onUnitClicked).toHaveBeenCalledWith(unit, 0);
    });
});
