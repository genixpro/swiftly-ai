import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import ViewLeaseReport from './ViewLeaseReport';

describe('ViewLeaseReport characterization', () => {
    it('keeps its report rows and legacy mount-only lease snapshot', async () => {
        const firstLease = {extractedData: {counterparty_name: 'Harbour Tenant', rent_per_square_foot: 28}, words: []};
        const {rerender} = render(<ViewLeaseReport lease={firstLease} />);

        expect(await screen.findByText('Harbour Tenant')).toBeInTheDocument();
        expect(screen.getByText('Rent')).toBeInTheDocument();
        rerender(<ViewLeaseReport lease={{extractedData: {counterparty_name: 'Replacement Tenant'}, words: []}} />);
        expect(screen.getByText('Harbour Tenant')).toBeInTheDocument();
        expect(screen.queryByText('Replacement Tenant')).not.toBeInTheDocument();
    });
});
