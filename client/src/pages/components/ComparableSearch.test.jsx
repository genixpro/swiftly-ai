import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ComparableLeaseSearch from './ComparableLeaseSearch';
import ComparableSaleSearch from './ComparableSaleSearch';

vi.mock('./FieldDisplayEdit', () => ({
    default: ({ariaLabel, onChange, type, value}) => <button
        aria-label={ariaLabel || type}
        onClick={() => onChange(type === 'propertyType' ? 'land' : 'changed')}
    >{String(value ?? '')}</button>,
}));

describe('comparable search characterization', () => {
    it('retains sale-search conditional field groups and reports the edited search', async () => {
        const onChange = vi.fn();
        render(<ComparableSaleSearch
            defaultSearch={{propertyType: 'industrial', capitalizationRateFrom: 4.5}}
            onChange={onChange}
        />);

        await expect(screen.getByText('Clear Ceiling Height Low:')).toBeVisible();
        // Sale-date filters are intentionally shown for both industrial and
        // land searches; this duplicated legacy branch is part of parity.
        expect(screen.getByText('Sale Date Start:')).toBeVisible();
        expect(screen.getByText('Cap Rate Low:')).toBeVisible();

        fireEvent.click(screen.getByRole('button', {name: 'propertyType'}));
        expect(onChange).toHaveBeenLastCalledWith({propertyType: 'land', capitalizationRateFrom: 4.5});
        await expect(screen.getByText('Sale Date Start:')).toBeVisible();
        expect(screen.queryByText('Cap Rate Low:')).not.toBeInTheDocument();
    });

    it('retains lease-search field order and forwards the full edited search', async () => {
        const onChange = vi.fn();
        render(<ComparableLeaseSearch
            defaultSearch={{propertyType: 'retail', tenantName: 'Original tenant'}}
            onChange={onChange}
        />);

        await expect(screen.getByText('Lease Date Start:')).toBeVisible();
        expect(screen.getAllByText(/Low:$/).map((element) => element.textContent)).toEqual([
            'Size of Unit Low:', 'Yearly Rent Low:', 'TMI Low:',
        ]);

        fireEvent.click(screen.getByRole('button', {name: 'tenantName'}));
        await waitFor(() => expect(onChange).toHaveBeenLastCalledWith({
            propertyType: 'retail',
            tenantName: 'changed',
        }));
    });
});
