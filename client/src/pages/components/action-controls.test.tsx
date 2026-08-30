import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import ActionButton from './ActionButton';
import ChecklistGroup from './ChecklistGroup';
import StructuralAllowanceCalculationPopoverWrapper from './StructuralAllowanceCalculationPopoverWrapper';

afterEach(() => vi.useRealTimers());

describe('ActionButton', () => {
    it('preserves loading, minimum duration, success, and reset states', async () => {
        vi.useFakeTimers();
        const action = vi.fn().mockResolvedValue(undefined);
        const {container} = render(<ActionButton onClick={action}>Save</ActionButton>);
        fireEvent.click(screen.getByRole('button', {name: 'Save'}));
        expect(action).toHaveBeenCalledOnce();
        expect(container.querySelector('.ball-pulse')).not.toBeNull();
        await act(async () => void await Promise.resolve());
        act(() => vi.advanceTimersByTime(500));
        expect(container.querySelector('.fa-check')).not.toBeNull();
        act(() => vi.advanceTimersByTime(2000));
        expect(container.querySelector('.fa-check')).toBeNull();
    });

    it('shows and clears the established failure result', async () => {
        vi.useFakeTimers();
        const action = vi.fn().mockRejectedValue(new Error('save failed'));
        const {container} = render(<ActionButton onClick={action}>Save</ActionButton>);
        fireEvent.click(screen.getByRole('button', {name: 'Save'}));
        await act(async () => void await Promise.resolve());
        act(() => vi.advanceTimersByTime(500));
        expect(container.querySelector('.fa-times')).not.toBeNull();
        act(() => vi.advanceTimersByTime(2000));
        expect(container.querySelector('.fa-times')).toBeNull();
    });
});

it('keeps checklist copy and pointer/keyboard disclosure behavior', () => {
    render(<ChecklistGroup title="Source files" fileNames={['one.pdf', 'two.pdf']}><p>Details</p></ChecklistGroup>);
    const header = screen.getByRole('button');
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(header).toHaveTextContent('one.pdf, two.pdf');
    fireEvent.keyDown(header, {key: 'Enter'});
    expect(header).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
});

it('opens the structural allowance calculation with unchanged values', () => {
    render(<StructuralAllowanceCalculationPopoverWrapper appraisal={{
        stabilizedStatement: {potentialGrossIncome: 100_000, structuralAllowance: 2_000},
        stabilizedStatementInputs: {structuralAllowancePercent: 2},
    }}>Structural Allowance @ 2%</StructuralAllowanceCalculationPopoverWrapper>);
    fireEvent.click(screen.getByRole('button', {name: 'Structural Allowance @ 2%'}));
    expect(screen.getByText('Potential Gross Income')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('$100,000.00');
    expect(screen.getByRole('tooltip')).toHaveTextContent('$2,000.00');
});
