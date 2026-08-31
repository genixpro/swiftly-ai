import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import ZoneDescriptionEditor from './ZoneDescriptionEditor';

const hooks = vi.hoisted(() => ({
    updateZone: {mutate: vi.fn()},
    useUpdateZone: vi.fn(),
    useZone: vi.fn(),
    zoneQuery: {data: undefined},
}));
vi.mock('@api/hooks', () => ({useUpdateZone: hooks.useUpdateZone, useZone: hooks.useZone}));
vi.mock('./FieldDisplayEdit', () => ({default: ({value, onChange}) => <button onClick={() => onChange('Updated description')}>{value}</button>}));

beforeEach(() => {
    hooks.updateZone.mutate.mockReset();
    hooks.zoneQuery.data = {_id: 'zone-1', description: 'Original description'};
    hooks.useZone.mockReset().mockImplementation(() => hooks.zoneQuery);
    hooks.useUpdateZone.mockReset().mockReturnValue(hooks.updateZone);
});

describe('zone description editor characterization', () => {
    it('loads the selected zone and updates its description through the existing API', async () => {
        render(<ZoneDescriptionEditor zoneId="zone-1"/>);
        await screen.findByRole('button', {name: 'Original description'});
        fireEvent.click(screen.getByRole('button', {name: 'Original description'}));
        await waitFor(() => expect(hooks.updateZone.mutate).toHaveBeenCalledWith(expect.objectContaining({description: 'Updated description'})));
        expect(hooks.useZone).toHaveBeenCalledWith('zone-1');
        expect(hooks.useUpdateZone).toHaveBeenCalledWith('zone-1');
    });
});
