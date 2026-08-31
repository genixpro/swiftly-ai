import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ComparableLeasesStatistics from './ComparableLeasesStatistics';
import ComparableSalesStatistics from './ComparableSalesStatistics';

vi.mock('./CurrencyFormat', () => ({default: ({value}) => <span>${value}</span>}));
vi.mock('./PercentFormat', () => ({default: ({value}) => <span>{value}%</span>}));
vi.mock('./IntegerFormat', () => ({default: ({value}) => <span>{value}</span>}));
vi.mock('./LengthFormat', () => ({default: ({value}) => <span>{value} ft</span>}));
vi.mock('./FloatFormat', () => ({default: ({value}) => <span>{value}</span>}));
vi.mock('./AreaFormat', () => ({default: ({value}) => <span>{value} sqft</span>}));

describe('comparable statistics cards', () => {
    it('renders sale ranges, averages, and the optional title with the established odd-column padding', () => {
        render(<ComparableSalesStatistics
            title="Selected sales"
            stats={['sizeSquareFootage', 'salePrice', 'displayCapitalizationRate']}
            comparableSales={[
                {sizeSquareFootage: 1_000, salePrice: 100_000, netOperatingIncome: 4_000, capitalizationRate: 4, useStabilizedNoi: true},
                {sizeSquareFootage: 2_000, salePrice: 300_000, netOperatingIncome: 18_000, capitalizationRate: 6, useStabilizedNoi: true},
            ]}
        />);

        expect(screen.getByRole('heading', {name: 'Selected sales'})).toBeInTheDocument();
        expect(screen.getByText('Building Size Range (sqft):')).toBeInTheDocument();
        expect(screen.getByText('Sale Price Average ($):')).toBeInTheDocument();
        expect(screen.getByText('Cap Rate Average (%):')).toBeInTheDocument();
        expect(screen.getByText('1000').closest('.statBlock')).toHaveTextContent('1000 - 2000');
        expect(screen.getByText('$200000')).toBeInTheDocument();
        expect(screen.getByText('5%')).toBeInTheDocument();
        expect(document.querySelectorAll('.comparable-sales-statistics .statColumn')).toHaveLength(4);
    });

    it('retains the legacy no-data treatment for zero sale statistics and no sales prop', () => {
        const {rerender} = render(<ComparableSalesStatistics stats={['salePrice']} comparableSales={[{salePrice: 0}]} />);
        expect(screen.getAllByText('n/a')).toHaveLength(2);

        rerender(<ComparableSalesStatistics stats={['salePrice']} />);
        expect(document.querySelector('.comparable-sales-statistics')).toBeNull();
    });

    it('renders lease ranges and pads the row to three columns', () => {
        render(<ComparableLeasesStatistics
            title="Selected leases"
            stats={['sizeOfUnit', 'startingYearlyRent']}
            comparableLeases={[
                {sizeOfUnit: 500, rentEscalations: [{yearlyRent: 25_000}]},
                {sizeOfUnit: 1_000, rentEscalations: [{yearlyRent: 35_000}]},
            ]}
        />);

        expect(screen.getByRole('heading', {name: 'Selected leases'})).toBeInTheDocument();
        expect(screen.getByText('Size Average (sqft):')).toBeInTheDocument();
        expect(screen.getByText('Yearly Rent Range ($):')).toBeInTheDocument();
        expect(screen.getByText('750 sqft')).toBeInTheDocument();
        expect(screen.getByText('$25000').closest('.statBlock')).toHaveTextContent('$25000 - $35000');
        expect(document.querySelectorAll('.comparable-leases-statistics .statColumn')).toHaveLength(3);
    });

    it('returns no lease card until comparable data has loaded', () => {
        const {container} = render(<ComparableLeasesStatistics stats={['sizeOfUnit']} />);
        expect(container).toBeEmptyDOMElement();
    });
});
