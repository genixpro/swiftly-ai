import {render, screen} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router';
import {describe, expect, it} from 'vitest';
import RouteScreen from './RouteScreen';

function Destination(props: {
    appraisalId?: string;
    leaseId?: string;
    financialStatementId?: string;
    pathname: string;
    search: string;
}) {
    return <output data-testid="route-props">{JSON.stringify(props)}</output>;
}

describe('RouteScreen', () => {
    it('passes route identifiers, pathname, and query string to legacy screens', () => {
        render(<MemoryRouter initialEntries={['/appraisal/a-1/statement/s-1?year=2026']}>
            <Routes>
                <Route path="/appraisal/:id/statement/:financialStatementId" element={<RouteScreen component={Destination} />} />
            </Routes>
        </MemoryRouter>);

        expect(JSON.parse(screen.getByTestId('route-props').textContent ?? '{}')).toMatchObject({
            appraisalId: 'a-1',
            financialStatementId: 's-1',
            pathname: '/appraisal/a-1/statement/s-1',
            search: '?year=2026',
        });
    });

    it('uses an explicit appraisal id when the matching route has none', () => {
        render(<MemoryRouter initialEntries={['/preview']}>
            <Routes>
                <Route path="/preview" element={<RouteScreen component={Destination} appraisalId="fallback-id" />} />
            </Routes>
        </MemoryRouter>);

        expect(JSON.parse(screen.getByTestId('route-props').textContent ?? '{}')).toMatchObject({appraisalId: 'fallback-id'});
    });
});
