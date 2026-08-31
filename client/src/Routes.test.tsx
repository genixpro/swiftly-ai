import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import {describe, expect, it, vi} from 'vitest';
import AppRoutes from './Routes';

vi.mock('./components/Layout/Base', () => ({
    default: ({children, pathname}: {children: React.ReactNode; pathname: string}) => <main data-testid="base" data-pathname={pathname}>{children}</main>,
}));
vi.mock('./components/Layout/BasePage', () => ({
    default: ({children}: {children: React.ReactNode}) => <main data-testid="base-page">{children}</main>,
}));
vi.mock('./routing/RouteScreen', () => ({
    default: ({component: Component}: {component: React.ComponentType}) => <Component />,
}));
vi.mock('./pages/StartAppraisal', () => ({default: () => <div>Start appraisal</div>}));
vi.mock('./pages/ViewAppraisal', () => ({default: () => <div>View appraisal</div>}));
vi.mock('./pages/ViewAllAppraisals', () => ({default: () => <div>All appraisals</div>}));
vi.mock('./pages/ClientDropbox', () => ({default: () => <div>Client dropbox</div>}));

describe('AppRoutes', () => {
    it('keeps appraisal routes inside the application shell', () => {
        render(<MemoryRouter initialEntries={['/appraisal/appraisal-1/tenants']}><AppRoutes /></MemoryRouter>);

        expect(screen.getByTestId('base')).toHaveAttribute('data-pathname', '/appraisal/appraisal-1/tenants');
        expect(screen.getByText('View appraisal')).toBeInTheDocument();
    });

    it('keeps the dropbox routes outside the sidebar shell', () => {
        render(<MemoryRouter initialEntries={['/drop/client-1']}><AppRoutes /></MemoryRouter>);

        expect(screen.getByTestId('base-page')).toBeInTheDocument();
        expect(screen.queryByTestId('base')).not.toBeInTheDocument();
        expect(screen.getByText('Client dropbox')).toBeInTheDocument();
    });

    it('redirects unknown routes to the appraisal list', () => {
        render(<MemoryRouter initialEntries={['/missing']}><AppRoutes /></MemoryRouter>);

        expect(screen.getByTestId('base')).toHaveAttribute('data-pathname', '/appraisals/');
        expect(screen.getByText('All appraisals')).toBeInTheDocument();
    });
});
