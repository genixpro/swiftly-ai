import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import StabilizedStatementUnitsSection from './StabilizedStatementUnitsSection';

vi.mock('./UnitsTable', () => ({
    default: ({allowNewUnit, allowSelection, statsMode}: {allowNewUnit: boolean; allowSelection: boolean; statsMode: string}) => (
        <output>{`${allowSelection}:${allowNewUnit}:${statsMode}`}</output>
    ),
}));

describe('StabilizedStatementUnitsSection', () => {
    it('keeps the stabilized table heading and simple-appraisal editing flags', () => {
        render(<StabilizedStatementUnitsSection
            appraisal={{_id: 'appraisal-1', address: '1 Bay Street', appraisalType: 'simple', units: []}}
            onChangeUnitOrder={vi.fn()}
            onCreateUnit={vi.fn()}
            onRemoveUnit={vi.fn()}
            onUnitChanged={vi.fn()}
            onUnitClicked={vi.fn()}
        />);

        expect(screen.getByRole('heading', {name: 'Stabilized Income & Expense Statement'})).toBeVisible();
        expect(screen.getByText('1 Bay Street')).toBeVisible();
        expect(screen.getByText('true:true:total')).toBeVisible();
    });
});
