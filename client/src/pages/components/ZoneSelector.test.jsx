import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import ZoneSelector from './ZoneSelector';

const hooks = vi.hoisted(() => ({
    createZone: {mutateAsync: vi.fn()},
    searchZones: vi.fn(),
    useCreateZone: vi.fn(),
    useZone: vi.fn(),
    useZoneSearch: vi.fn(),
    zoneQuery: {data: undefined},
}));
vi.mock('@api/hooks', () => ({
    useCreateZone: hooks.useCreateZone,
    useZone: hooks.useZone,
    useZoneSearch: hooks.useZoneSearch,
}));
vi.mock('react-select/async-creatable', () => ({
    default: ({loadOptions, onChange, onCreateOption}) => <>
        <button onClick={() => onChange({value: 'zone-2', label: 'Industrial'})}>Select zone</button>
        <button onClick={() => onChange(null)}>Clear zone</button>
        <button onClick={() => onCreateOption('Industrial')}>Create zone</button>
        <button onClick={() => loadOptions('Industrial', (options) => onChange(options[0]))}>Search zones</button>
    </>,
}));

beforeEach(() => {
    hooks.createZone.mutateAsync.mockReset().mockResolvedValue('zone-3');
    hooks.searchZones.mockReset().mockResolvedValue([{_id: 'zone-4', zoneName: 'Industrial search result'}]);
    hooks.zoneQuery.data = {_id: 'zone-1', zoneName: 'Commercial'};
    hooks.useZone.mockReset().mockImplementation(() => hooks.zoneQuery);
    hooks.useCreateZone.mockReset().mockReturnValue(hooks.createZone);
    hooks.useZoneSearch.mockReset().mockReturnValue(hooks.searchZones);
});

describe('zone selector characterization', () => {
    it('loads its selected zone and forwards created, selected, and cleared values', async () => {
        const onChange = vi.fn();
        render(<ZoneSelector value="zone-1" onChange={onChange}/>);
        await waitFor(() => expect(hooks.useZone).toHaveBeenCalledWith('zone-1'));

        fireEvent.click(screen.getByRole('button', {name: 'Select zone'}));
        fireEvent.click(screen.getByRole('button', {name: 'Clear zone'}));
        fireEvent.click(screen.getByRole('button', {name: 'Create zone'}));
        await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('zone-3'));
        expect(onChange).toHaveBeenNthCalledWith(1, 'zone-2');
        expect(onChange).toHaveBeenNthCalledWith(2, null);
        expect(hooks.createZone.mutateAsync).toHaveBeenCalledWith({zoneName: 'Industrial', description: ''});
    });

    it('keeps the async search callback and its regularized selected id', async () => {
        const onChange = vi.fn();
        render(<ZoneSelector onChange={onChange}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Search zones'}));

        await waitFor(() => expect(hooks.searchZones).toHaveBeenCalledWith('Industrial'));
        await waitFor(() => expect(onChange).toHaveBeenCalledWith('zone-4'));
    });
});
