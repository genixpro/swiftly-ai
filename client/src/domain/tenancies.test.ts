import {describe, expect, it} from 'vitest';
import {createTenancy, tenancyFieldValues, tenancyYearlyRentPSF} from './tenancies';

describe('tenancy editing', () => {
    it('creates the established default tenancy values', () => {
        expect(createTenancy()).toMatchObject({name: 'New Tenant', yearlyRent: 0, monthlyRent: 0, rentType: 'net', recoveryStructure: 'Standard'});
    });

    it('keeps yearly rent and monthly rent synchronized from the psf editor', () => {
        expect(tenancyFieldValues('yearlyRentPSF', 24, 1_000)).toEqual({yearlyRent: 24_000, monthlyRent: 2_000});
        expect(tenancyYearlyRentPSF({yearlyRent: 24_000}, 1_000)).toBe(24);
    });
});
