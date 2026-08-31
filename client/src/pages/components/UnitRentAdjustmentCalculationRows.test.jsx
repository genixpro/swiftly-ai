import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('./FreeRentLossForUnitCalculationPopoverWrapper', () => ({default: ({children}) => <>{children}</>}));
vi.mock('./MarketRentDifferentialForUnitCalculationPopoverWrapper', () => ({default: ({children}) => <>{children}</>}));

import UnitRentAdjustmentCalculationRows from './UnitRentAdjustmentCalculationRows';

describe('UnitRentAdjustmentCalculationRows', () => {
    it('retains adjustment labels and formatted values when calculated values are present', () => {
        render(<table><tbody><UnitRentAdjustmentCalculationRows
            appraisal={{appraisalType: 'simple'}}
            unit={{calculatedMarketRentDifferential: 50, calculatedFreeRentLoss: 25}}
        /></tbody></table>);

        expect(screen.getByText('Calculated Market Rent Differential')).toBeVisible();
        expect(screen.getByText('Calculated Free Rent Loss')).toBeVisible();
        expect(screen.getByText('50.00')).toBeVisible();
        expect(screen.getByText('25.00')).toBeVisible();
    });

    it('keeps zero adjustment values out of the existing stats table', () => {
        const {container} = render(<table><tbody><UnitRentAdjustmentCalculationRows
            appraisal={{appraisalType: 'simple'}}
            unit={{calculatedMarketRentDifferential: 0, calculatedFreeRentLoss: null}}
        /></tbody></table>);

        expect(container.querySelectorAll('.stats-row')).toHaveLength(0);
    });
});
