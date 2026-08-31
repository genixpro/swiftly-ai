import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import {describe, expect, it} from 'vitest';

import UnitRecoveryCalculationRows from './UnitRecoveryCalculationRows';

describe('UnitRecoveryCalculationRows', () => {
    it('keeps the detailed recovery labels, amounts, and recovery-structure links', () => {
        render(<MemoryRouter><table><tbody><UnitRecoveryCalculationRows
            appraisal={{_id: 'appraisal-1', appraisalType: 'detailed'}}
            unit={{calculatedManagementRecovery: 100, calculatedExpenseRecovery: 200, calculatedTaxRecovery: 300}}
        /></tbody></table></MemoryRouter>);

        expect(screen.getByText('Calculated Management Recovery').closest('a')).toHaveAttribute(
            'href', '/appraisal/appraisal-1/tenants/recovery_structures',
        );
        expect(screen.getByText('Calculated Operating Expense Recovery')).toBeVisible();
        expect(screen.getByText('Calculated Tax Recovery')).toBeVisible();
        expect(screen.getByText('300.00')).toBeVisible();
    });

    it('does not render zero-value recovery rows', () => {
        const {container} = render(<MemoryRouter><table><tbody><UnitRecoveryCalculationRows
            appraisal={{_id: 'appraisal-1', appraisalType: 'detailed'}}
            unit={{calculatedManagementRecovery: 0, calculatedExpenseRecovery: null, calculatedTaxRecovery: 0}}
        /></tbody></table></MemoryRouter>);

        expect(container.querySelectorAll('.stats-row')).toHaveLength(0);
    });
});
