import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('./client.js', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

import apiClient from './client.js';
import {ApiError} from './errors';
import {
    appraisalsApi,
    comparableLeasesApi,
    comparableSalesApi,
    filesApi,
    imagesApi,
    tagsApi,
    tenantNamesApi,
    zonesApi,
} from './resources';

describe('typed resource services', () => {
    beforeEach(() => vi.clearAllMocks());

    it('unwraps appraisal and file response envelopes', async () => {
        apiClient.get
            .mockResolvedValueOnce({data: {appraisals: [{_id: 'a'}]}})
            .mockResolvedValueOnce({data: {appraisal: {_id: 'a'}}})
            .mockResolvedValueOnce({data: {files: [{_id: 'f', fileName: 'lease.pdf'}]}})
            .mockResolvedValueOnce({data: {file: {_id: 'f', fileName: 'lease.pdf'}}});
        apiClient.post
            .mockResolvedValueOnce({data: {_id: 'new'}})
            .mockResolvedValueOnce({data: {created: ['lease']}});
        apiClient.patch
            .mockResolvedValueOnce({data: {appraisal: {_id: 'a', name: 'Changed'}}})
            .mockResolvedValueOnce({data: {file: {_id: 'f', fileName: 'lease.pdf', fileType: 'lease'}}});
        apiClient.delete.mockResolvedValue({data: {}});

        expect(await appraisalsApi.list()).toEqual([{_id: 'a'}]);
        expect(await appraisalsApi.get('a')).toEqual({_id: 'a'});
        expect(await appraisalsApi.create({name: 'New'})).toBe('new');
        expect(await appraisalsApi.update('a', {name: 'Changed'})).toMatchObject({name: 'Changed'});
        expect(await appraisalsApi.convertTenants('a')).toEqual(['lease']);
        await appraisalsApi.remove('a');
        expect(await filesApi.list('a', 'lease')).toHaveLength(1);
        expect(await filesApi.get('a', 'f')).toMatchObject({_id: 'f'});
        expect(await filesApi.update('a', 'f', {fileType: 'lease'})).toMatchObject({fileType: 'lease'});
        await filesApi.remove('a', 'f');
        expect(apiClient.get).toHaveBeenCalledWith('/appraisals/a/files', {params: {type: 'lease'}});
    });

    it('provides comparable, reference-data, and image operations', async () => {
        apiClient.get
            .mockResolvedValueOnce({data: {comparableSales: [{_id: 's'}]}})
            .mockResolvedValueOnce({data: {comparableSale: {_id: 's'}}})
            .mockResolvedValueOnce({data: {comparableLeases: [{_id: 'l'}]}})
            .mockResolvedValueOnce({data: {comparableLease: {_id: 'l'}}})
            .mockResolvedValueOnce({data: {zones: [{_id: 'z'}]}})
            .mockResolvedValueOnce({data: {zone: {_id: 'z'}}})
            .mockResolvedValueOnce({data: {tags: [{_id: 't'}]}})
            .mockResolvedValueOnce({data: {names: ['Tenant']}});
        apiClient.post
            .mockResolvedValueOnce({data: {_id: 's2'}})
            .mockResolvedValueOnce({data: {comparableSale: {_id: 'portfolio'}}})
            .mockResolvedValueOnce({data: {file: {_id: 'f'}, comparableSales: [{_id: 's'}]}})
            .mockResolvedValueOnce({data: {_id: 'l2'}})
            .mockResolvedValueOnce({data: {_id: 'z2'}})
            .mockResolvedValueOnce({data: {_id: 't2'}})
            .mockResolvedValueOnce({data: {url: '/images/i'}});
        apiClient.patch.mockResolvedValue({data: {_id: 'updated'}});
        apiClient.delete.mockResolvedValue({data: {}});

        expect(await comparableSalesApi.list({propertyType: 'office'})).toHaveLength(1);
        expect(await comparableSalesApi.get('s')).toMatchObject({_id: 's'});
        expect(await comparableSalesApi.create({address: 'A'})).toBe('s2');
        await comparableSalesApi.update('s', {address: 'B'});
        await comparableSalesApi.remove('s');
        expect(await comparableSalesApi.savePortfolio({}, [])).toMatchObject({_id: 'portfolio'});
        expect((await comparableSalesApi.import(new FormData())).comparableSales).toHaveLength(1);
        expect(await comparableLeasesApi.list()).toHaveLength(1);
        expect(await comparableLeasesApi.get('l')).toMatchObject({_id: 'l'});
        expect(await comparableLeasesApi.create({tenantName: 'T'})).toBe('l2');
        await comparableLeasesApi.update('l', {tenantName: 'T2'});
        await comparableLeasesApi.remove('l');
        expect(await zonesApi.list('CR')).toHaveLength(1);
        expect(await zonesApi.get('z')).toMatchObject({_id: 'z'});
        expect(await zonesApi.create({zoneName: 'CR'})).toBe('z2');
        await zonesApi.update('z', {description: 'Updated'});
        expect(await tagsApi.list({propertyType: 'office'})).toHaveLength(1);
        expect(await tagsApi.create({name: 'Transit'})).toBe('t2');
        await tagsApi.remove('t');
        expect(await tenantNamesApi.list('Ten')).toEqual(['Tenant']);
        expect(await imagesApi.upload(new FormData())).toBe('/images/i');
    });

    it('normalizes service failures', async () => {
        apiClient.get.mockRejectedValue(new Error('offline'));
        await expect(appraisalsApi.list()).rejects.toEqual(expect.objectContaining({
            name: 'ApiError',
            message: 'offline',
        }));
        await expect(appraisalsApi.list()).rejects.toBeInstanceOf(ApiError);
    });
});
