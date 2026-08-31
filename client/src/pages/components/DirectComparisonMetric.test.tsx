import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import type {DirectComparisonAppraisal} from '../directComparisonTypes';
import DirectComparisonMetric from './DirectComparisonMetric';

function appraisalFor(metric?: string): DirectComparisonAppraisal {
    return {
        _id: 'appraisal-1',
        sizeOfLand: 2,
        buildableArea: 12_000,
        buildableUnits: 42,
        adjustmentChart: {},
        directComparisonInputs: {
            directComparisonMetric: metric,
            pricePerSquareFoot: 200,
            noiPSFPricePerSquareFoot: 175,
            pricePerSquareFootLand: 25,
            pricePerAcreLand: 500_000,
            pricePerSquareFootBuildableArea: 90,
            pricePerBuildableUnit: 30_000,
        },
        directComparisonValuation: {},
        stabilizedStatement: {},
        stabilizedStatementInputs: {},
    };
}

describe('DirectComparisonMetric', () => {
    it('keeps each established metric label and its quantity', () => {
        const {rerender} = render(<DirectComparisonMetric appraisal={appraisalFor('psf')} sizeOfBuilding={1_000} />);
        expect(document.body).toHaveTextContent('1,000 sqft @');

        rerender(<DirectComparisonMetric appraisal={appraisalFor('noi_multiple')} sizeOfBuilding={1_000} />);
        expect(document.body).toHaveTextContent('1,000 sqft @');

        rerender(<DirectComparisonMetric appraisal={appraisalFor('psf_land')} sizeOfBuilding={1_000} />);
        expect(document.body).toHaveTextContent('87,120 sqft @');

        rerender(<DirectComparisonMetric appraisal={appraisalFor('per_acre_land')} sizeOfBuilding={1_000} />);
        expect(document.body).toHaveTextContent('2 acres @');

        rerender(<DirectComparisonMetric appraisal={appraisalFor('psf_buildable_area')} sizeOfBuilding={1_000} />);
        expect(document.body).toHaveTextContent('12,000 psf @');

        rerender(<DirectComparisonMetric appraisal={appraisalFor('per_buildable_unit')} sizeOfBuilding={1_000} />);
        expect(document.body).toHaveTextContent('42 units @');
    });

    it('keeps the empty metric message', () => {
        render(<DirectComparisonMetric appraisal={appraisalFor()} sizeOfBuilding={1_000} />);
        expect(screen.getByText('No Comparison Metric Selected')).toBeInTheDocument();
    });
});
