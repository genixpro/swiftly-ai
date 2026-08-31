import {describe, expect, it} from 'vitest';
import {
    comparableSaleView,
    comparableSaleMetrics,
    computedComparableSaleDescription,
} from './comparableSales';

describe('comparableSaleMetrics', () => {
    it('keeps the established stabilized-NOI calculation and display values', () => {
        const metrics = comparableSaleMetrics({
            pricePerSquareFoot: 200,
            netOperatingIncomePSF: 10,
            netOperatingIncome: 1000,
            capitalizationRate: 5,
            noiPerUnit: 100,
            noiPerBedroom: 50,
            stabilizedNoiVacancyRate: 5,
            stabilizedNoiStructuralAllowance: 10,
            stabilizedNoiCustomDeduction: 2,
            useStabilizedNoi: true,
        });

        expect(metrics).toMatchObject({
            noiPSFMultiple: 20,
            stabilizedNOIVacancyDeduction: 50,
            stabilizedNOIStructuralAllowance: 100,
            stabilizedNOICustomDeduction: 20,
            stabilizedNOI: 830,
            overallStabilizationRate: 0.83,
            stabilizedCapitalizationRate: 5 / 0.83,
            stabilizedNOIPerUnit: 83,
            stabilizedNOIPerBedroom: 41.5,
            displayNetOperatingIncome: 830,
            displayCapitalizationRate: 5 / 0.83,
        });
        // The legacy model does not round intermediate values; formatting happens in the view.
        expect(metrics.stabilizedNOIPSFMultiple).toBeCloseTo(16.6);
        expect(metrics.stabilizedNetOperatingIncomePSF).toBeCloseTo(8.3);
    });

    it('preserves generated comparable description copy and explicit descriptions', () => {
        expect(computedComparableSaleDescription({
            saleDate: new Date('2024-01-01'),
            propertyType: 'retail',
            address: '10 Main Street',
            sizeSquareFootage: 12_500,
            salePrice: 2_000_000,
            constructionDate: '2005',
            parking: '40',
            capitalizationRate: 5.25,
        })).toBe('Sale of a retail building located at 10 Main Street. The building has a gross rentable area of 12,500 square feet. The property was sold for $2,000,000. Property features include: construction date of 2005, 40 parking spaces. The net income yielded a 5.25% rate of return. ');
        expect(computedComparableSaleDescription({description: 'Editorial description'})).toBe('Editorial description');
    });

    it('materializes display values for a plain comparable draft', () => {
        expect(comparableSaleView({
            netOperatingIncome: 1000,
            capitalizationRate: 5,
            netOperatingIncomePSF: 10,
            pricePerSquareFoot: 200,
            useStabilizedNoi: false,
        })).toMatchObject({
            noiPSFMultiple: 20,
            displayCapitalizationRate: 5,
            displayNetOperatingIncome: 1000,
            computedDescriptionText: 'The net income yielded a 5.00% rate of return. ',
        });
    });
});
