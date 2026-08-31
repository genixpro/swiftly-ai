import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import DatetimeCompat from './DatetimeCompat';

describe('DatetimeCompat', () => {
    it('preserves Date and string display values and the legacy toDate change envelope', () => {
        const onChange = vi.fn();
        const {rerender} = render(<DatetimeCompat value={new Date('2024-05-06T12:00:00.000Z')} onChange={onChange} inputProps={{'aria-label': 'Sale date'}} />);
        const input = screen.getByLabelText('Sale date');

        expect(input).toHaveValue('2024-05-06');
        fireEvent.change(input, {target: {value: '2024-06-07'}});
        expect(onChange.mock.calls[0][0].toDate()).toEqual(new Date('2024-06-07T00:00:00.000Z'));

        rerender(<DatetimeCompat value="2024-07-08T12:00:00.000Z" onChange={onChange} inputProps={{'aria-label': 'Sale date'}} />);
        expect(input).toHaveValue('2024-07-08');
        fireEvent.change(input, {target: {value: ''}});
        expect(onChange).toHaveBeenLastCalledWith('');
    });
});
