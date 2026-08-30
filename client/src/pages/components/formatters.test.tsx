import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import AreaFormat from './AreaFormat';
import CurrencyFormat from './CurrencyFormat';
import FloatFormat from './FloatFormat';
import IntegerFormat from './IntegerFormat';
import LengthFormat from './LengthFormat';
import PercentFormat from './PercentFormat';

describe('financial display formatters', () => {
    it.each([
        ['float', <FloatFormat value={1234.5} />, '1,234.50'],
        ['integer', <IntegerFormat value={1234.5} />, '1,235'],
        ['length', <LengthFormat value={12} />, '12 ft'],
        ['percent', <PercentFormat value={5.25} />, '5.25%'],
        ['area', <AreaFormat value={15000} />, '15,000 sf'],
        ['currency', <CurrencyFormat value={3900000} />, '$3,900,000.00'],
        ['negative currency', <CurrencyFormat value={-1250} cents={false} />, '($1,250)'],
    ])('preserves %s output', (_name, component, expected) => {
        const view = render(component);
        expect(view.container).toHaveTextContent(expected);
    });

    it.each([
        <FloatFormat value={null} />,
        <IntegerFormat value={undefined} />,
        <LengthFormat value={null} />,
        <PercentFormat value={undefined} />,
        <AreaFormat value={null} />,
        <CurrencyFormat value={Number.NaN} />,
    ])('renders unavailable values consistently', component => {
        const view = render(component);
        expect(screen.getByText('n/a')).toBeInTheDocument();
        view.unmount();
    });

    it('preserves optional precision and title behavior', () => {
        render(<><PercentFormat value={1.2345} digits={3} /><CurrencyFormat value={10} title="Value source" /></>);
        expect(document.body).toHaveTextContent('1.234%');
        expect(screen.getByTitle('Value source')).toHaveTextContent('$10.00');
    });
});
