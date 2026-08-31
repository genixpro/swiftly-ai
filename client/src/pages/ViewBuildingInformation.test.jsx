import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ViewBuildingInformation from './ViewBuildingInformation';

vi.mock('./components/FieldDisplayEdit', () => ({
    default: ({ariaLabel, onChange}) => <button type="button" onClick={() => onChange(`Updated ${ariaLabel}`)}>{ariaLabel}</button>,
}));
vi.mock('./components/AppraisalContentHeader', () => ({default: ({title}) => <h1>{title}</h1>}));
vi.mock('./components/UploadableImageSet', () => ({
    default: ({onChange, onChangeCaptions}) => <div data-testid="image-set">
        <button onClick={() => onChange(['updated.jpg'])}>Update pictures</button>
        <button onClick={() => onChangeCaptions(['Updated caption'])}>Update picture captions</button>
    </div>,
}));
vi.mock('./components/ZoneDescriptionEditor', () => ({default: ({zoneId}) => <div>Zone description: {zoneId}</div>}));
vi.mock('./components/AreaFormat', () => ({default: ({value}) => <span>{value} sqft</span>}));
vi.mock('./components/CurrencyFormat', () => ({default: ({value}) => <span>${value}</span>}));
vi.mock('./components/PercentFormat', () => ({default: ({value}) => <span>{value}%</span>}));

const appraisal = {
    _id: 'appraisal-1',
    imageUrls: [],
    captions: [],
    name: 'Harbour Centre',
    client: 'Original client',
    address: '1 Bay Street',
    propertyType: 'office',
    propertyTags: [],
    tenancyType: 'multi_tenant',
    sizeOfLand: 1,
    sizeOfBuilding: 10_000,
    zoning: 'CR 3.0',
    marketRents: [{name: 'Office', amountPSF: 30}],
    occupancyRate: 0.9,
    effectiveDate: new Date('2026-01-01'),
    directComparisonValuation: {valuationRounded: 1_000_000},
    stabilizedStatement: {netOperatingIncome: 100_000, valuationRounded: 1_250_000, valuation: 1_250_000},
    stabilizedStatementInputs: {capitalizationRate: 8},
};

describe('ViewBuildingInformation characterization', () => {
    it('keeps the established information hierarchy and sends an immediate top-level field patch', () => {
        const updateAppraisal = vi.fn();
        render(<ViewBuildingInformation appraisal={appraisal} edit updateAppraisal={updateAppraisal} />);

        expect(screen.getByRole('heading', {name: 'General Information'})).toBeInTheDocument();
        expect(screen.getByText('Property Details')).toBeInTheDocument();
        expect(screen.getByText('Income Information')).toBeInTheDocument();
        expect(screen.getByText('Appraisal Details')).toBeInTheDocument();
        expect(screen.getByText('Zone description: CR 3.0')).toBeInTheDocument();
        expect(screen.getByText('43560 sqft')).toBeInTheDocument();
        expect(screen.getByText('$100000')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: 'Client'}));
        expect(updateAppraisal).toHaveBeenCalledWith({client: 'Updated Client'});
    });

    it('keeps the unavailable appraisal state empty', () => {
        const {container} = render(<ViewBuildingInformation appraisal={null} updateAppraisal={vi.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('derives building size and occupancy from units when normalized unit data is available', () => {
        render(<ViewBuildingInformation
            appraisal={{
                ...appraisal,
                units: [
                    {squareFootage: 4_000, shouldTreatAsVacant: false},
                    {squareFootage: 6_000, shouldTreatAsVacant: true},
                ],
            }}
            updateAppraisal={vi.fn()}
        />);

        expect(screen.getByText('10000 sqft')).toBeInTheDocument();
        expect(screen.getByText('40%')).toBeInTheDocument();
    });

    it('retains immediate patches for every visible editable general-information field', () => {
        const updateAppraisal = vi.fn();
        render(<ViewBuildingInformation appraisal={appraisal} edit updateAppraisal={updateAppraisal} />);

        for (const label of ['Name', 'Client', 'Address', 'Property Type', 'Sub Type', 'Tenancy Is', 'Lot Size', 'Zoning', 'Effective Date']) {
            fireEvent.click(screen.getByRole('button', {name: label}));
        }
        fireEvent.click(screen.getByRole('button', {name: 'Update pictures'}));
        fireEvent.click(screen.getByRole('button', {name: 'Update picture captions'}));

        expect(updateAppraisal).toHaveBeenCalledWith({name: 'Updated Name'});
        expect(updateAppraisal).toHaveBeenCalledWith({propertyTags: 'Updated Sub Type'});
        expect(updateAppraisal).toHaveBeenCalledWith({effectiveDate: 'Updated Effective Date'});
        expect(updateAppraisal).toHaveBeenCalledWith({imageUrls: ['updated.jpg']});
        expect(updateAppraisal).toHaveBeenCalledWith({captions: ['Updated caption']});
        expect(updateAppraisal).toHaveBeenCalledTimes(11);
    });
});
