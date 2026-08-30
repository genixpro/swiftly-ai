import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import {describe, expect, it} from 'vitest';
import AppraisalContentHeader from './AppraisalContentHeader';
import ComparableSaleSummaryList from './ComparableSaleSummaryList';
import SortDirection from './SortDirection';
import YearlySourceTypeFormat from './YearlySourceTypeFormat';

describe('presentation components', () => {
    it('keeps appraisal title, document title, focus, and breadcrumbs', () => {
        render(<MemoryRouter><AppraisalContentHeader
            appraisal={{_id: 'a1', name: 'Harbour', address: '1 Bay'}}
            title="General Information"
        /></MemoryRouter>);
        expect(screen.getByRole('heading')).toHaveTextContent('Harbour - 1 Bay - General Information');
        expect(screen.getByRole('heading')).toHaveFocus();
        expect(document.title).toBe('General Information – Harbour – Swiftly');
        expect(screen.getByLabelText('Breadcrumb')).toHaveTextContent('HomeAppraisalsHarbourGeneral Information');
    });

    it.each([
        ['actual', 'Actuals'],
        ['budget', 'Budget'],
        ['user', 'User'],
        ['unknown', ''],
    ])('maps yearly source %s to %s', (value, label) => {
        expect(render(<YearlySourceTypeFormat value={value} />).container).toHaveTextContent(label);
    });

    it('renders sort icons only for the active signed field', () => {
        const view = render(<SortDirection sort="-price" field="price" />);
        expect(view.container.querySelector('.fa-arrow-down')).not.toBeNull();
        view.rerender(<SortDirection sort="+price" field="price" />);
        expect(view.container.querySelector('.fa-arrow-up')).not.toBeNull();
        view.rerender(<SortDirection sort="+date" field="price" />);
        expect(view.container).toBeEmptyDOMElement();
    });

    it('keeps the comparable summary table structure and selection class', () => {
        const {container} = render(<ComparableSaleSummaryList appraisal={{_id: 'a'}} allowSelection />);
        expect(container.querySelector('.comparables-table.allow-selection')).not.toBeNull();
        expect(screen.getAllByRole('cell').map(cell => cell.textContent)).toEqual([
            'Date', 'Address', 'Building Size (sf)', 'Annual Net Rent (psf)', '',
        ]);
    });
});
