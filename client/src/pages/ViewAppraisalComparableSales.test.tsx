import {fireEvent, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {EditableAppraisal} from '../app/AppraisalWorkspace';
import {renderWithApp} from '../test/render';
import ViewAppraisalComparableSales from './ViewAppraisalComparableSales';

const comparableSalesApi = vi.hoisted(() => ({getMany: vi.fn()}));

vi.mock('@api/resources', () => ({comparableSalesApi}));
vi.mock('./components/ComparableSalesMap', () => ({
    default: ({onAddComparableToAppraisal, onRemoveComparableFromAppraisal}: {
        onAddComparableToAppraisal: (sale: {_id: string}) => void;
        onRemoveComparableFromAppraisal: (sale: {_id: string}) => void;
    }) => <>
        <button onClick={() => onAddComparableToAppraisal({_id: 'sale-3'})}>Add sale</button>
        <button onClick={() => onRemoveComparableFromAppraisal({_id: 'sale-1'})}>Remove sale</button>
    </>,
}));
vi.mock('./components/ComparableSaleList', () => ({
    default: ({comparableSales, onSortChanged}: {
        comparableSales: Array<{_id: string}>;
        onSortChanged: (sort: string) => void;
    }) => <>
        <output data-testid="sale-order">{comparableSales.map((sale) => sale._id).join(',')}</output>
        <button onClick={() => onSortChanged('+saleDate')}>Sort sales</button>
    </>,
}));

function appraisalFixture(): EditableAppraisal {
    return {
        _id: 'appraisal-1',
        comparableSalesCapRate: ['sale-2', 'sale-1'],
        comparableSalesDCA: ['sale-dca'],
    };
}

describe('ViewAppraisalComparableSales', () => {
    beforeEach(() => {
        comparableSalesApi.getMany.mockReset();
    });

    it('keeps selected-sale loading, sort order, and selection update payloads', async () => {
        comparableSalesApi.getMany.mockResolvedValue([
            {_id: 'sale-2', saleDate: '2023-01-01'},
            {_id: 'sale-1', saleDate: '2024-01-01'},
        ]);
        const updateAppraisal = vi.fn();

        renderWithApp(<ViewAppraisalComparableSales
            appraisal={appraisalFixture()}
            appraisalId="appraisal-1"
            updateAppraisal={updateAppraisal}
        />);

        await waitFor(() => expect(screen.getByTestId('sale-order')).toHaveTextContent('sale-1,sale-2'));
        expect(comparableSalesApi.getMany).toHaveBeenCalledWith(['sale-2', 'sale-1']);

        fireEvent.click(screen.getByRole('button', {name: 'Sort sales'}));
        expect(screen.getByTestId('sale-order')).toHaveTextContent('sale-2,sale-1');

        fireEvent.click(screen.getByRole('button', {name: 'Add sale'}));
        expect(updateAppraisal).toHaveBeenLastCalledWith({comparableSalesCapRate: ['sale-2', 'sale-1', 'sale-3']});

        fireEvent.click(screen.getByRole('button', {name: 'Remove sale'}));
        expect(updateAppraisal).toHaveBeenLastCalledWith({comparableSalesCapRate: ['sale-2']});
        expect(screen.getByTestId('sale-order')).toHaveTextContent('sale-2');
    });

    it('updates the active DCA selection field without changing the current cap-rate list', async () => {
        comparableSalesApi.getMany.mockResolvedValue([]);
        const appraisal = appraisalFixture();
        const updateAppraisal = vi.fn();

        renderWithApp(<ViewAppraisalComparableSales
            appraisal={appraisal}
            appraisalId="appraisal-1"
            compsField="comparableSalesDCA"
            updateAppraisal={updateAppraisal}
        />);

        await waitFor(() => expect(comparableSalesApi.getMany).toHaveBeenCalledWith(['sale-dca']));
        fireEvent.click(screen.getByRole('button', {name: 'Add sale'}));
        expect(updateAppraisal).toHaveBeenCalledWith({comparableSalesDCA: ['sale-dca', 'sale-3']});
    });
});
