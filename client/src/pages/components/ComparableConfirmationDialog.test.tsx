import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import ComparableConfirmationDialog from './ComparableConfirmationDialog';

const api = vi.hoisted(() => ({create: vi.fn(), update: vi.fn()}));

vi.mock('@api/hooks', () => ({
    useCreateComparableSale: () => ({mutateAsync: api.create}),
    useUpdateComparableSale: () => ({mutateAsync: ({id, payload}: {id: string; payload: unknown}) => api.update(id, payload)}),
}));
vi.mock('./ComparableSaleListItem', () => ({
    default: ({comparableSale, onChange}: {comparableSale: {address?: string}; onChange(value: {address?: string}): void}) => <button onClick={() => onChange({...comparableSale, address: 'Edited address'})}>Edit comparable</button>,
}));
vi.mock('./FileViewer', () => ({default: () => <div>File viewer</div>}));

describe('ComparableConfirmationDialog characterization', () => {
    beforeEach(() => vi.clearAllMocks());

    it('keeps review selection and creates an unsaved uploaded comparable', async () => {
        const onChange = vi.fn();
        const comparables = [{address: 'First'}, {address: 'Second'}];
        api.create.mockResolvedValue('saved-sale');
        render(<ComparableConfirmationDialog visible toggle={vi.fn()} appraisal={{}} comparableSales={comparables} onChange={onChange}/>);

        fireEvent.click(screen.getByText('Second'));
        fireEvent.click(screen.getByRole('button', {name: 'Save'}));

        await waitFor(() => expect(api.create).toHaveBeenCalledWith(comparables[1]));
        expect(onChange).toHaveBeenLastCalledWith(comparables);
        expect(comparables[1]).toMatchObject({_id: 'saved-sale'});
    });

    it('persists review edits for an already-created comparable', async () => {
        const onChange = vi.fn();
        const comparables = [{_id: 'sale-1', address: 'Original'}];
        api.update.mockResolvedValue({});
        render(<ComparableConfirmationDialog visible toggle={vi.fn()} appraisal={{}} comparableSales={comparables} onChange={onChange}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Edit comparable'}));
        await waitFor(() => expect(api.update).toHaveBeenCalledWith('sale-1', expect.objectContaining({address: 'Edited address'})));
        expect(onChange).toHaveBeenCalledWith(comparables);
    });
});
