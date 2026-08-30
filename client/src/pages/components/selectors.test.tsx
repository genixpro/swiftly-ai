import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import AdjustmentTypeSelector from './AdjustmentTypeSelector';
import DirectComparisonMetricSelector from './DirectComparisonMetricSelector';
import IndustrialSubtypeSelector from './IndustrialSubtypeSelector';
import LandSubtypeSelector from './LandSubtypeSelector';
import LeasingCommissionModeSelector from './LeasingCommissionModeSelector';
import ManagementRecoveryModeSelector from './ManagementRecoveryModeSelector';
import PropertyTypeSelector from './PropertyTypeSelector';
import RentTypeSelector from './RentTypeSelector';
import RetailLocationTypeSelector from './RetailLocationTypeSelector';
import TenancyTypeSelector from './TenancyTypeSelector';
import CalculationFieldSelector, {nameForCalculationField} from './CalculationFieldSelector';
import IncomeItemTypeSelector from './IncomeItemTypeSelector';
import LeasingCostsSelector from './LeasingCostsSelector';
import ManagementExpenseModeSelector from './ManagementExpenseModeSelector';
import MarketRentSelector from './MarketRentSelector';
import RecoveryStructureSelector from './RecoveryStructureSelector';

const selectors = [
    [AdjustmentTypeSelector, 'percentage', 'amount'],
    [DirectComparisonMetricSelector, 'psf', 'noi_multiple'],
    [LeasingCommissionModeSelector, 'psf', 'percent_of_rent'],
    [ManagementRecoveryModeSelector, 'none', 'custom'],
    [PropertyTypeSelector, 'office', 'retail'],
    [RentTypeSelector, 'net', 'gross'],
    [TenancyTypeSelector, 'single_tenant', 'vacant'],
] as const;

describe.each(selectors)('%s', (Selector, initialValue, nextValue) => {
    it('preserves controlled change, blur, ref, title, and disabled behavior', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const onBlur = vi.fn();
        const innerRef = vi.fn();
        const {rerender} = render(<Selector value={initialValue} onChange={onChange} onBlur={onBlur} innerRef={innerRef} title="Choose value" />);
        const select = screen.getByTitle('Choose value') as HTMLSelectElement;
        expect(select.value).toBe(initialValue);
        expect(innerRef).toHaveBeenCalledWith(select);
        await user.selectOptions(select, nextValue);
        expect(onChange).toHaveBeenCalledWith(nextValue);
        fireEvent.blur(select);
        expect(onBlur).toHaveBeenCalledOnce();
        rerender(<Selector value={nextValue} disabled title="Choose value" />);
        expect(select).toBeDisabled();
    });
});

describe.each([
    [IndustrialSubtypeSelector, 'single_tenant'],
    [LandSubtypeSelector, 'residential'],
    [RetailLocationTypeSelector, 'street_front'],
] as const)('%s click compatibility', (Selector, value) => {
    it('retains the legacy click notification behavior', () => {
        const onChange = vi.fn();
        render(<Selector value={value} onChange={onChange} title="Choose subtype" />);
        fireEvent.click(screen.getByTitle('Choose subtype'));
        expect(onChange).toHaveBeenCalledWith(value);
    });
});

it('preserves search-specific property type copy and accessible names', () => {
    render(<PropertyTypeSelector isSearch />);
    expect(screen.getByRole('combobox', {name: 'Property type'})).toHaveDisplayValue('All');
});

it('builds dynamic selector options with the legacy labels and filters', () => {
    const {rerender} = render(<MarketRentSelector marketRents={[{name: 'Office', amountPSF: 24}]} title="Market rent" />);
    expect(screen.getByRole('option', {name: 'Office @ $24.00'})).toBeInTheDocument();
    rerender(<RecoveryStructureSelector recoveryStructures={[{name: 'Standard'}]} title="Recovery" />);
    expect(screen.getByRole('option', {name: 'Standard'})).toBeInTheDocument();
    rerender(<LeasingCostsSelector leasingCostStructures={[{name: 'Default'}]} title="Costs" />);
    expect(screen.getByRole('option', {name: 'Default'})).toBeInTheDocument();
    rerender(<ManagementExpenseModeSelector exclude={['rule']} title="Mode" />);
    expect(screen.queryByRole('option', {name: 'Based on Industry Rate'})).not.toBeInTheDocument();
});

it('preserves calculation and income/expense option ordering', () => {
    const {rerender} = render(<CalculationFieldSelector expenses={[]} title="Calculation" />);
    expect(nameForCalculationField('operatingExpensesAndTaxes')).toBe('Operating Expenses & Taxes');
    expect(nameForCalculationField('invalid')).toBe('');
    expect(screen.getAllByRole('option').map(option => option.textContent)).toContain('Effective Gross Income');
    rerender(<IncomeItemTypeSelector title="Type" />);
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual([
        'Income Type', 'Rental Income', 'Additional Income', 'Expense Recoveries',
        'Operating Expense', 'Non Recoverable Expense', 'Taxes', 'Management Expense', 'Structural Allowance', 'Unknown',
    ]);
});
