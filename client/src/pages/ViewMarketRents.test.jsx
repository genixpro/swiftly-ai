import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import ViewMarketRents, {MarketRentEditor} from './ViewMarketRents';

const comparableLeasesQuery = vi.hoisted(() => ({useComparableLeasesByIds: vi.fn()}));
vi.mock('@api/hooks', () => comparableLeasesQuery);
vi.mock('./components/ComparableLeaseList', () => ({
    default: ({comparableLeases, onChange}) => <>
        <output data-testid="comparable-leases">{comparableLeases.length}</output>
        <button onClick={() => onChange([{_id: 'replacement-lease'}])}>Change comparable leases</button>
    </>,
}));
vi.mock('./components/FieldDisplayEdit', () => ({
    default: ({onChange, placeholder, value}) => <button aria-label={placeholder || String(value)} onClick={() => onChange?.('Edited')}>{String(value)}</button>,
}));

function appraisalFixture() {
    return {
        _id: 'appraisal-1',
        comparableLeases: ['lease-1'],
        marketRents: [{name: 'Standard', amountPSF: 1}],
        units: [],
        stabilizedStatement: {marketRentDifferential: 0},
    };
}

describe('market-rent workflow characterization', () => {
    beforeEach(() => comparableLeasesQuery.useComparableLeasesByIds.mockReturnValue({data: [{_id: 'lease-1'}]}));

    it('loads attached comparables and immediately persists created and deleted market rents', async () => {
        const appraisal = appraisalFixture();
        const saveAppraisal = vi.fn();
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const {rerender} = render(<ViewMarketRents appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        await waitFor(() => expect(comparableLeasesQuery.useComparableLeasesByIds).toHaveBeenCalledWith(['lease-1']));
        expect(screen.getByTestId('comparable-leases')).toHaveTextContent('1');

        fireEvent.click(screen.getByRole('button', {name: 'Create a new Market Rent'}));
        expect(appraisal.marketRents[1].name).toBe('New Market Rent 2');
        expect(saveAppraisal).toHaveBeenLastCalledWith(appraisal);
        rerender(<ViewMarketRents appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getAllByRole('button', {name: 'Delete'})[1]);
        expect(confirm).toHaveBeenCalledWith('Are you sure you want to delete the market rent?');
        expect(appraisal.marketRents).toHaveLength(1);
        expect(saveAppraisal).toHaveBeenCalledTimes(2);
        confirm.mockRestore();
    });

    it('renames attached units and toggles unit applicability before immediately saving', () => {
        const marketRent = {name: 'Premium', amountPSF: 12};
        const appraisal = {
            units: [{unitNumber: '101', tenancies: [{name: 'Taylor'}], marketRent: 'Premium', calculatedMarketRentDifferential: 12}],
        };
        const onChange = vi.fn();
        render(<MarketRentEditor marketRent={marketRent} appraisal={appraisal} onChange={onChange} onDeleteMarketRent={vi.fn()}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Market Rent Name'}));
        expect(marketRent.name).toBe('Edited');
        expect(appraisal.units[0].marketRent).toBe('Edited');

        fireEvent.click(screen.getByRole('button', {name: 'Does market rent apply to unit 101'}));
        expect(appraisal.units[0].marketRent).toBeNull();
        expect(appraisal.units[0].calculatedMarketRentDifferential).toBeNull();
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenLastCalledWith(marketRent);
    });

    it('keeps inline rent updates and comparable-selection state scoped to the current screen', () => {
        const appraisal = {
            ...appraisalFixture(),
            marketRents: [{name: 'Standard', amountPSF: 1}, {name: 'Premium', amountPSF: 2}],
            units: [
                {unitNumber: '101', tenancies: [{name: 'Taylor'}], marketRent: 'Premium', calculatedMarketRentDifferential: 1},
                {unitNumber: '102', tenancies: [{name: 'Morgan'}], marketRent: 'Premium', calculatedMarketRentDifferential: 1},
            ],
        };
        const saveAppraisal = vi.fn();
        render(<ViewMarketRents appraisal={appraisal} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: '1'}));
        fireEvent.click(screen.getByRole('button', {name: 'Market Rent Name'}));
        fireEvent.click(screen.getAllByRole('button', {name: 'Does market rent apply to unit 101'})[1]);
        fireEvent.click(screen.getAllByRole('button', {name: 'Does market rent apply to unit 102'})[1]);
        fireEvent.click(screen.getByRole('button', {name: 'Change comparable leases'}));

        expect(appraisal.marketRents).toEqual([
            {name: 'Standard', amountPSF: 'Edited'},
            {name: 'Edited', amountPSF: 2},
        ]);
        expect(appraisal.units.map((unit) => unit.marketRent)).toEqual([null, null]);
        for (const unit of appraisal.units) expect(unit.calculatedMarketRentDifferential).toBeNull();
        expect(saveAppraisal).toHaveBeenCalledTimes(4);
        expect(screen.getByTestId('comparable-leases')).toHaveTextContent('1');
    });
});
