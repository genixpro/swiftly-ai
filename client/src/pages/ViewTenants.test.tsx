import {render, screen} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router';
import {describe, expect, it, vi} from 'vitest';
import ViewTenants from './ViewTenants';

vi.mock('./components/AppraisalContentHeader', () => ({default: ({title}: {title: string}) => <h1>{title}</h1>}));
vi.mock('./ViewTenantRentRoll', () => ({default: () => <div>Rent roll screen</div>}));
vi.mock('./ViewMarketRents', () => ({default: () => <div>Market rents screen</div>}));
vi.mock('./ViewRecoveryStructures', () => ({default: () => <div>Recovery structures screen</div>}));
vi.mock('./ViewTenantLeasingCosts', () => ({default: () => <div>Leasing costs screen</div>}));
vi.mock('./ViewVacancySchedule', () => ({default: () => <div>Vacancy schedule screen</div>}));

describe('tenants route shell', () => {
    it('retains tenant navigation labels and routes rent-roll deep links to the existing child screen', () => {
        render(<MemoryRouter initialEntries={['/appraisal/a/tenants/rent_roll']}>
            <Routes><Route path="/appraisal/:appraisalId/tenants/*" element={
                <ViewTenants appraisalId="a" appraisal={{_id: 'a'}} saveAppraisal={vi.fn()}/>
            } /></Routes>
        </MemoryRouter>);
        expect(screen.getByRole('heading', {name: 'Tenants'})).toBeVisible();
        for (const label of ['Rent Roll', 'Market Rents', 'Recovery Structures', 'Leasing Costs']) {
            expect(screen.getByRole('link', {name: label})).toBeVisible();
        }
        expect(screen.getByText('Rent roll screen')).toBeVisible();
    });
});
