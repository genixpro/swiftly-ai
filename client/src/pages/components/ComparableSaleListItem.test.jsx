import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import ComparableSaleListItem from './ComparableSaleListItem';

const apiSpies = vi.hoisted(() => ({
    update: vi.fn(),
    remove: vi.fn(),
    savePortfolio: vi.fn().mockResolvedValue({}),
}));
const portfolioQuery = vi.hoisted(() => ({data: undefined}));

vi.mock('@api/resources', () => ({
    comparableSalesApi: {},
}));

vi.mock('@api/hooks', () => ({
    useUpdateComparableSale: () => ({
        mutate: ({id, payload}) => apiSpies.update(id, payload),
    }),
    useDeleteComparableSale: () => ({
        mutate: (id) => apiSpies.remove(id),
        mutateAsync: (id) => apiSpies.remove(id),
    }),
    useSaveComparableSalePortfolio: () => ({mutateAsync: (payload) => apiSpies.savePortfolio(payload)}),
    useComparableSalesByIds: () => ({data: portfolioQuery.data}),
}));

vi.mock('./FieldDisplayEdit', () => ({
    default: ({placeholder = 'field', onChange}) => <button aria-label={placeholder} onClick={() => onChange?.(true)}>Field</button>,
    NonDroppableFieldDisplayEdit: ({placeholder = 'field', onChange}) => <button aria-label={placeholder} onClick={() => onChange?.(true)}>Field</button>,
}));
vi.mock('./UploadableImageSet', () => ({default: () => <div>Images</div>}));
vi.mock('@components/Common/NumberFormatCompat', () => ({default: ({value}) => <span>{value}</span>}));
vi.mock('google-map-react', () => ({default: ({children}) => <div>Map{children}</div>}));
vi.mock('./CurrencyFormat', () => ({default: ({value}) => <span>{value}</span>}));
vi.mock('./PercentFormat', () => ({default: ({value}) => <span>{value}</span>}));
vi.mock('./FloatFormat', () => ({default: ({value}) => <span>{value}</span>}));
vi.mock('./IntegerFormat', () => ({default: ({value}) => <span>{value}</span>}));
vi.mock('./ComparableLeaseListItem', () => ({default: () => <div>Lease item</div>}));
vi.mock('./FreeRentLossForUnitCalculationPopoverWrapper', () => ({default: ({children}) => <>{children}</>}));
vi.mock('./comparable-sale/ComparableSaleFields', () => ({
    ComparableSaleField: ({field, title, onChange}) =>
        field === 'computedDescriptionText' || field === 'capitalizationRate'
            ? <button type="button" aria-label={title} onClick={() => onChange?.(field, field === 'capitalizationRate' ? 10 : 'Updated description')}>{title}</button>
            : <span>{title}</span>,
    ComparableSaleHeaderColumn: ({fields}) => <div>{fields.join(',')}</div>,
}));

function saleFixture() {
    return {
        _id: 'sale-1',
        address: '10 Main Street, Toronto, ON',
        saleDate: '2024-01-01',
        salePrice: 1_000_000,
        sizeSquareFootage: 4_000,
        propertyType: 'office',
        propertyTags: [],
    };
}

describe('ComparableSaleListItem', () => {
    afterEach(() => {
        apiSpies.update.mockClear();
        apiSpies.remove.mockReset();
        apiSpies.savePortfolio.mockClear();
        portfolioQuery.data = undefined;
    });

    it('keeps a persisted comparable collapsed initially and toggles the established accessible details region', () => {
        render(<ComparableSaleListItem
            comparableSale={saleFixture()}
            appraisal={{location: null}}
            headers={[["saleDate"], ["address"], ["salePrice"]]}
            edit={false}
        />);

        const expand = screen.getByRole('button', {name: /Date|Address|Sale Price/});
        expect(expand).toHaveAttribute('aria-expanded', 'false');
        expect(expand).toHaveAttribute('aria-controls', 'comparable-details-sale-1');

        fireEvent.click(expand);
        expect(expand).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('Images')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('keeps the map-pin picker open workflow on editable comparables', () => {
        render(<ComparableSaleListItem
            comparableSale={saleFixture()}
            appraisal={{location: null}}
            headers={[["saleDate"]]}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Place Pin on Map'}));
        expect(screen.getByText('Map')).toBeInTheDocument();
    });

    it('keeps the stabilized-NOI calculator popover available on editable comparables', () => {
        render(<ComparableSaleListItem
            comparableSale={saleFixture()}
            appraisal={{location: null}}
            headers={[["saleDate"]]}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Stabilize NOI'}));
        expect(screen.getByText('Net Operating Income')).toBeInTheDocument();
        expect(screen.getByText('Use Stabilized NOI?')).toBeInTheDocument();
    });

    it('keeps the comparable-selection button and callback semantics', () => {
        const onAddComparableClicked = vi.fn();
        const sale = saleFixture();
        render(<ComparableSaleListItem
            comparableSale={sale}
            appraisal={{location: null, comparableSalesCapRate: [], comparableSalesDCA: []}}
            headers={[["saleDate"]]}
            edit={false}
            onAddComparableClicked={onAddComparableClicked}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Add comparable sale to appraisal'}));
        expect(onAddComparableClicked).toHaveBeenCalledWith(sale);
    });

    it('keeps immediate description editing, parent delivery, and persisted update timing', () => {
        const onChange = vi.fn();
        const sale = saleFixture();
        render(<ComparableSaleListItem
            comparableSale={sale}
            appraisal={{location: null}}
            headers={[["saleDate"]]}
            onChange={onChange}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Description'}));

        expect(sale.description).toBe('Updated description');
        expect(onChange).toHaveBeenCalledWith(sale);
        expect(apiSpies.update).toHaveBeenCalledWith('sale-1', sale);
    });

    it('keeps equation-derived values immediate for a plain query result and persists the same source object', () => {
        const onChange = vi.fn();
        const sale = {
            _id: 'sale-plain',
            address: '20 Main Street, Toronto, ON',
            saleDate: '2024-01-01',
            netOperatingIncome: 100_000,
            capitalizationRate: 5,
            propertyType: 'office',
            propertyTags: [],
        };
        render(<ComparableSaleListItem
            comparableSale={sale}
            appraisal={{location: null}}
            headers={[["saleDate"]]}
            onChange={onChange}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Cap Rate'}));

        expect(sale).toMatchObject({capitalizationRate: 10, salePrice: 1_000_000});
        expect(onChange).toHaveBeenCalledWith(sale);
        expect(apiSpies.update).toHaveBeenCalledWith('sale-plain', sale);
    });

    it('keeps the portfolio add-entry action local until the new child is edited', () => {
        const sale = saleFixture();
        sale.isPortfolioCompilation = true;
        sale.portfolioLinkedComps = [];

        render(<ComparableSaleListItem
            comparableSale={sale}
            appraisal={{location: null}}
            headers={[["saleDate"]]}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Add a Sale to this Portfolio'}));

        expect(screen.queryByRole('button', {name: 'Add a Sale to this Portfolio'})).not.toBeInTheDocument();
        expect(apiSpies.update).not.toHaveBeenCalled();
    });

    it('edits a newly added plain portfolio child immediately before saving the established portfolio payload', () => {
        const onChangePortfolio = vi.fn();
        const portfolio = {
            _id: 'portfolio-1',
            address: '30 Main Street, Toronto, ON',
            propertyType: 'office',
            propertyTags: [],
            isPortfolioCompilation: true,
            portfolioLinkedComps: [],
        };
        render(<ComparableSaleListItem
            comparableSale={portfolio}
            appraisal={{location: null}}
            headers={[["saleDate"]]}
            onChange={vi.fn()}
            onChangePortfolio={onChangePortfolio}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Add a Sale to this Portfolio'}));
        fireEvent.click(screen.getByRole('button', {name: 'Description'}));

        const [child] = onChangePortfolio.mock.calls[0][0];
        expect(child).toMatchObject({isPartOfPortfolio: true, allowSubCompSearch: false, description: 'Updated description'});
        expect(child.calculateMissingNumbers).toBeUndefined();
        expect(apiSpies.savePortfolio).toHaveBeenCalledWith({portfolio, subComps: [child]});
    });

    it('keeps a server-loaded plain portfolio child editable and uses it in the existing save payload', () => {
        const onChangePortfolio = vi.fn();
        const child = {
            _id: 'portfolio-child-1',
            address: '40 Main Street, Toronto, ON',
            propertyType: 'office',
            propertyTags: [],
        };
        portfolioQuery.data = [child];
        const portfolio = {
            _id: 'portfolio-2',
            address: '30 Main Street, Toronto, ON',
            propertyType: 'office',
            propertyTags: [],
            isPortfolioCompilation: true,
            portfolioLinkedComps: ['portfolio-child-1'],
        };
        render(<ComparableSaleListItem
            comparableSale={portfolio}
            appraisal={{location: null}}
            headers={[["saleDate"]]}
            onChange={vi.fn()}
            onChangePortfolio={onChangePortfolio}
        />);

        fireEvent.click(screen.getByText('40 Main Street, Toronto, ON'));
        fireEvent.click(screen.getByRole('button', {name: 'Description'}));

        const [editableChild] = onChangePortfolio.mock.calls[0][0];
        expect(editableChild).toMatchObject({_id: 'portfolio-child-1', description: 'Updated description'});
        expect(editableChild).not.toBe(child);
        expect(apiSpies.savePortfolio).toHaveBeenCalledWith({portfolio, subComps: [editableChild]});
        expect(apiSpies.update).toHaveBeenCalledWith('portfolio-child-1', editableChild);
    });

    it('keeps delete confirmation, parent notification, and persisted deletion in the established order', async () => {
        const onDeleteComparable = vi.fn();
        apiSpies.remove.mockResolvedValue(undefined);
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const sale = saleFixture();

        render(<ComparableSaleListItem
            comparableSale={sale}
            appraisal={{location: null, comparableSalesCapRate: ['sale-1'], comparableSalesDCA: []}}
            headers={[["saleDate"]]}
            edit={false}
            onRemoveComparableClicked={vi.fn()}
            onDeleteComparable={onDeleteComparable}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Delete comparable sale'}));

        expect(confirm).toHaveBeenCalledWith('Are you sure you want to delete the comparable?');
        expect(onDeleteComparable).toHaveBeenCalledWith(sale);
        expect(apiSpies.remove).toHaveBeenCalledWith('sale-1');
        await Promise.resolve();
        confirm.mockRestore();
    });
});
