import {useState} from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import SelectorControl from './SelectorControl';

const options = [
    {value: 'a', label: 'Option A'},
    {value: 'b', label: 'Option B'},
];

function ControlledSelector({onChange}: {onChange(value: string): void}) {
    const [value, setValue] = useState('a');
    return <SelectorControl
        ariaLabel="Test selector"
        notifyUnchanged
        onChange={(nextValue) => {
            onChange(nextValue);
            setValue(nextValue);
        }}
        options={options}
        useClick
        value={value}
    />;
}

describe('SelectorControl', () => {
    it('notifies once when a pointer selects a different option', () => {
        const onChange = vi.fn();
        render(<ControlledSelector onChange={onChange} />);
        const selector = screen.getByRole('combobox', {name: 'Test selector'});

        fireEvent.pointerDown(selector);
        fireEvent.change(selector, {target: {value: 'b'}});
        fireEvent.click(selector);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('b');
    });

    it('still notifies when the current option is clicked again', () => {
        const onChange = vi.fn();
        render(<ControlledSelector onChange={onChange} />);
        const selector = screen.getByRole('combobox', {name: 'Test selector'});

        fireEvent.pointerDown(selector);
        fireEvent.click(selector);

        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenCalledWith('a');
    });
});
