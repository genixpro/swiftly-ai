import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import Checklist from './Checklist';

const validationResult = {
    hasBuildingInformation: true,
    hasAddress: true,
    hasPropertyType: true,
    hasBuildingSize: true,
    hasLotSize: false,
    hasZoning: true,
    hasRentRoll: true,
    hasTenantNames: true,
    hasUnitSizes: true,
    hasRents: true,
    hasEscalations: false,
    hasLeaseTerms: true,
    hasFinancialInfo: true,
    hasExpenses: true,
    hasTaxes: true,
    hasAdditionalIncome: false,
    hasAmortizations: true,
};

describe('Checklist', () => {
    it('preserves checklist grouping, completion states, and referenced-file order', () => {
        const {container} = render(<Checklist appraisal={{
            validationResult,
            dataTypeReferences: {
                RENT_ROLL: [{fileId: 'rent-roll'}],
                INCOME_STATEMENT: [{fileId: 'income'}],
                EXPENSE_STATEMENT: [{fileId: 'expense'}],
            },
        }} files={[
            {_id: 'rent-roll', fileName: 'Rent roll.pdf'},
            {_id: 'income', fileName: 'Income statement.pdf'},
            {_id: 'expense', fileName: 'Expense statement.pdf'},
        ]} />);

        expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual([
            'Building Information',
            'Rent Roll - Rent roll.pdf',
            'Financial Information - Income statement.pdf,  Expense statement.pdf',
        ]);
        expect(screen.getByText('Tenant Name')).toBeInTheDocument();
        expect(container.querySelectorAll('.fa-check')).toHaveLength(11);
        expect(container.querySelectorAll('.fa-times')).toHaveLength(3);
    });

    it('renders no checklist until the appraisal is available', () => {
        const {container} = render(<Checklist appraisal={null} files={[]} />);
        expect(container).toBeEmptyDOMElement();
    });
});
