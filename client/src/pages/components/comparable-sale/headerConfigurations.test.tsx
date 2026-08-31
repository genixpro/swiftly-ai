import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {comparableSaleHeaderConfigurations} from './headerConfigurations';

describe('comparable-sale header configurations', () => {
    it('retains the established date labels, column widths, and empty-state copy', () => {
        const configuration = comparableSaleHeaderConfigurations.saleDate;
        render(<>{configuration.render('2024-01-01')}</>);

        expect(configuration.size).toBe(1);
        expect(configuration.noValueText).toBe('No Sale Date');
        expect(screen.getByText('Jan 2024')).toBeVisible();
    });

    it('retains the header formatters and inline shipping-door separators', () => {
        const configurations = comparableSaleHeaderConfigurations;
        render(<>
            {configurations.propertyTags.render(['Office', 'Retail'])}
            {configurations.shippingDoorsTruckLevel.render(2)}
            {configurations.shippingDoorsTruckLevel.spacer}
            {configurations.shippingDoorsDoubleMan.render(1)}
        </>);

        expect(configurations.pricePerSquareFoot.size).toBe('middle');
        expect(configurations.shippingDoorsTruckLevel.noValueText).toBe('');
        expect(screen.getByText('Office,')).toBeVisible();
        expect(screen.getByText('Retail')).toBeVisible();
        expect(screen.getByText((_, element) => element?.textContent === '2 T/L')).toBeVisible();
        expect(screen.getByText((_, element) => element?.textContent === '1 D/M')).toBeVisible();
    });
});
