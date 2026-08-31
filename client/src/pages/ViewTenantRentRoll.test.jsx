import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import ViewTenantsRentRoll from './ViewTenantRentRoll';

const hooks = vi.hoisted(() => ({useFile: vi.fn(), convertTenants: {mutateAsync: vi.fn()}}));

vi.mock('@api/hooks', () => ({
    useFile: hooks.useFile,
    useConvertTenants: () => hooks.convertTenants,
}));
vi.mock('./components/UnitsTable', () => ({
    default: ({initialOpenUnit, onCreateUnit, onRemoveUnit, onUnitChanged, onChangeUnitOrder}) => <>
        <output data-testid="initial-unit">{initialOpenUnit}</output>
        <button onClick={() => onCreateUnit({unitNumber: 'New'})}>Create unit</button>
        <button onClick={() => onUnitChanged(0, {unitNumber: 'Changed'})}>Change unit</button>
        <button onClick={() => onRemoveUnit(0)}>Remove unit</button>
        <button onClick={() => onChangeUnitOrder([{unitNumber: 'Reordered'}])}>Reorder units</button>
    </>,
}));
vi.mock('./components/FileSelector', () => ({
    default: ({onChange}) => <button onClick={() => onChange('file-1')}>Choose file</button>,
}));
vi.mock('./components/FileViewer', () => ({default: ({document}) => <div>Preview {document._id}</div>}));

function appraisalFixture() {
    return {
        _id: 'appraisal-1',
        units: [],
        dataTypeReferences: {RENT_ROLL: [{fileId: 'file-1', pageNumbers: [2]}]},
    };
}

describe('tenant rent-roll workflow characterization', () => {
    beforeEach(() => {
        hooks.convertTenants.mutateAsync.mockReset().mockResolvedValue([]);
        hooks.useFile.mockImplementation((_appraisalId, fileId) => ({data: fileId ? {_id: fileId, name: 'Rent roll'} : undefined}));
    });

    it('restores the requested unit and immediately saves immutable unit-list transitions', async () => {
        const appraisal = appraisalFixture();
        const saveAppraisal = vi.fn();
        render(<ViewTenantsRentRoll appraisal={appraisal} saveAppraisal={saveAppraisal} search="?unit=2"/>);

        await waitFor(() => expect(screen.getByTestId('initial-unit')).toHaveTextContent('2'));
        fireEvent.click(screen.getByRole('button', {name: 'Create unit'}));
        expect(appraisal.units).toEqual([{unitNumber: 'New'}]);

        fireEvent.click(screen.getByRole('button', {name: 'Change unit'}));
        expect(appraisal.units).toEqual([{unitNumber: 'Changed'}]);

        fireEvent.click(screen.getByRole('button', {name: 'Reorder units'}));
        expect(appraisal.units).toEqual([{unitNumber: 'Reordered'}]);

        fireEvent.click(screen.getByRole('button', {name: 'Remove unit'}));
        expect(appraisal.units).toEqual([]);
        expect(saveAppraisal).toHaveBeenCalledTimes(4);
    });

    it('loads the selected source document through the route-level query hook', async () => {
        const appraisal = appraisalFixture();
        render(<ViewTenantsRentRoll appraisal={appraisal} saveAppraisal={vi.fn()} search=""/>);

        fireEvent.click(screen.getByRole('button', {name: 'Choose file'}));

        await waitFor(() => expect(hooks.useFile).toHaveBeenLastCalledWith('appraisal-1', 'file-1'));
        await expect(screen.findByText('Preview file-1')).resolves.toBeVisible();
    });

    it('keeps the tenant conversion request explicit and scoped to the appraisal', () => {
        render(<ViewTenantsRentRoll appraisal={appraisalFixture()} saveAppraisal={vi.fn()} search=""/>);

        fireEvent.click(screen.getByRole('button', {name: 'Add Tenancies to your Comparable Leases Database'}));

        expect(hooks.convertTenants.mutateAsync).toHaveBeenCalledWith('appraisal-1');
    });
});
