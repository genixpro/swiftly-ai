import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import TenantNameSelector from './TenantNameSelector';

const hooks = vi.hoisted(() => ({searchTenantNames: vi.fn(), useTenantNameSearch: vi.fn()}));
vi.mock('@api/hooks', () => ({useTenantNameSearch: hooks.useTenantNameSearch}));
vi.mock('react-select/async-creatable', () => ({
    default: ({loadOptions, onChange, onCreateOption}) => <>
        <button onClick={() => onChange({value: 'Taylor', label: 'Taylor'})}>Select tenant</button>
        <button onClick={() => onChange(null)}>Clear tenant</button>
        <button onClick={() => onCreateOption('Morgan')}>Create tenant</button>
        <button onClick={() => loadOptions('Morgan', (options) => onChange(options[0]))}>Search tenants</button>
    </>,
}));

beforeEach(() => {
    hooks.searchTenantNames.mockReset().mockResolvedValue(['Morgan Stanley']);
    hooks.useTenantNameSearch.mockReset().mockReturnValue(hooks.searchTenantNames);
});

describe('tenant name selector characterization', () => {
    it('forwards selected, cleared, and newly created tenant names', () => {
        const onChange = vi.fn();
        render(<TenantNameSelector onChange={onChange}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Select tenant'}));
        fireEvent.click(screen.getByRole('button', {name: 'Clear tenant'}));
        fireEvent.click(screen.getByRole('button', {name: 'Create tenant'}));
        expect(onChange.mock.calls).toEqual([['Taylor'], [null], ['Morgan']]);
    });

    it('keeps async tenant lookup input scoped to the selector callback', async () => {
        const onChange = vi.fn();
        render(<TenantNameSelector onChange={onChange}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Search tenants'}));

        await waitFor(() => expect(hooks.searchTenantNames).toHaveBeenCalledWith('Morgan'));
        await waitFor(() => expect(onChange).toHaveBeenCalledWith('Morgan Stanley'));
    });
});
