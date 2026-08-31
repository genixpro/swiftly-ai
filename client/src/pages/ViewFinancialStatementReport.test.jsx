import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import ViewFinancialStatementReport from './ViewFinancialStatementReport';

describe('ViewFinancialStatementReport characterization', () => {
    it('keeps the legacy lease-field report rendering and mount-only statement snapshot', async () => {
        const firstStatement = {extractedData: {counterparty_name: 'Legacy counterparty'}, words: []};
        const {rerender} = render(<ViewFinancialStatementReport financialStatement={firstStatement} />);

        expect(await screen.findByText('Legacy counterparty')).toBeInTheDocument();
        expect(screen.getByText('Counterparty Name')).toBeInTheDocument();
        rerender(<ViewFinancialStatementReport financialStatement={{extractedData: {counterparty_name: 'Replacement'}, words: []}} />);
        expect(screen.getByText('Legacy counterparty')).toBeInTheDocument();
        expect(screen.queryByText('Replacement')).not.toBeInTheDocument();
    });
});
