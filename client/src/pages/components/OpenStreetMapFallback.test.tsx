import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import OpenStreetMapFallback from './OpenStreetMapFallback';

describe('OpenStreetMapFallback', () => {
    it('keeps subject and comparable links anchored to valid longitude/latitude pairs', () => {
        render(<OpenStreetMapFallback
            label="Comparable sales"
            subject={{_id: 'subject', location: {coordinates: [-79.4, 43.7]}}}
            comparables={[
                {_id: 'sale-1', address: '1 Main Street', location: {coordinates: [-79.5, 43.8]}},
                {_id: 'invalid', address: 'Invalid', location: {coordinates: ['not-a-number', 43.8]}},
            ]}
        />);

        expect(screen.getByTitle('Comparable sales map')).toHaveAttribute('src', expect.stringContaining('bbox=-79.5%2C43.6%2C-79.30000000000001%2C43.800000000000004'));
        expect(screen.getByRole('link', {name: 'Subject property'})).toHaveAttribute('href', expect.stringContaining('mlat=43.7&mlon=-79.4'));
        expect(screen.getByRole('link', {name: '1 Main Street'})).toHaveAttribute('href', expect.stringContaining('mlat=43.8&mlon=-79.5'));
        expect(screen.queryByRole('link', {name: 'Invalid'})).not.toBeInTheDocument();
    });

    it('keeps the Toronto fallback center and empty-state guidance when locations are unavailable', () => {
        render(<OpenStreetMapFallback label="Comparable leases" subject={null} comparables={[{_id: 'missing'}]} />);

        expect(screen.getByTitle('Comparable leases map')).toHaveAttribute('src', expect.stringContaining('bbox=-79.4832%2C43.5532%2C-79.28320000000001%2C43.7532'));
        expect(screen.getByText('Add locations to the subject or comparables to place them on the map.')).toBeVisible();
    });
});
