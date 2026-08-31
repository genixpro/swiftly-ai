import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

const hooks = vi.hoisted(() => ({loadFile: vi.fn(), useFileLoader: vi.fn()}));
vi.mock('@api/hooks', () => ({useFileLoader: hooks.useFileLoader}));

vi.mock('./FieldDisplayEdit', () => ({
    DroppableFieldDisplayEdit: ({ariaLabel, onChange}) => <button
        type="button"
        data-testid="field-editor"
        aria-label={ariaLabel}
        onClick={() => onChange?.('Characterized value')}
    />,
    NonDroppableFieldDisplayEdit: () => <div data-testid="field-editor"/>,
}));
vi.mock('./FileSelector', () => ({default: ({onChange}) => <button data-testid="file-selector" onClick={() => onChange('file-1')}>Select preview file</button>}));
vi.mock('./FileViewer', () => ({default: ({document}) => <div data-testid="file-viewer">{document.fileName}</div>}));

import IncomeStatementEditor from './IncomeStatementEditor';

beforeEach(() => {
    hooks.loadFile.mockReset().mockResolvedValue({_id: 'file-1', fileName: 'Statement.pdf'});
    hooks.useFileLoader.mockReset().mockReturnValue(hooks.loadFile);
});

describe('IncomeStatementEditor characterization', () => {
    it('retains its grouped table, accessible scroll hint, and year pinning behavior', async () => {
        const appraisal = {
            _id: 'appraisal-1',
            units: [{squareFootage: 1_000}],
            dataTypeReferences: {},
            incomeStatement: {years: [2025], customYearTitles: {}, items: []},
        };
        render(<IncomeStatementEditor
            appraisal={appraisal}
            field="incomeStatement"
            groups={{income: 'Income'}}
            saveAppraisal={vi.fn()}
        />);

        expect(screen.getByText('Income')).toBeVisible();
        expect(screen.getByLabelText('Income statement table; scroll horizontally for more columns')).toBeVisible();
        expect(screen.getByText('(psf)')).toBeVisible();
        const pinYear = screen.getByRole('button', {name: 'Pin 2025'});
        fireEvent.click(pinYear);
        expect(screen.getByRole('button', {name: 'Unpin 2025'})).toBeVisible();
        expect(screen.getByTestId('file-selector')).toBeInTheDocument();
    });

    it('loads a preview only after the existing file selector changes', async () => {
        const appraisal = {
            _id: 'appraisal-1',
            units: [{squareFootage: 1_000}],
            dataTypeReferences: {},
            incomeStatement: {years: [2025], customYearTitles: {}, items: []},
        };
        render(<IncomeStatementEditor appraisal={appraisal} field="incomeStatement" groups={{income: 'Income'}} saveAppraisal={vi.fn()} />);

        expect(hooks.loadFile).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', {name: 'Select preview file'}));

        await waitFor(() => expect(hooks.loadFile).toHaveBeenCalledWith('appraisal-1', 'file-1'));
        expect(await screen.findByTestId('file-viewer')).toHaveTextContent('Statement.pdf');
    });

    it('keeps add/remove-year confirmation, growth defaults, and save timing', () => {
        const saveAppraisal = vi.fn();
        const appraisal = {
            _id: 'appraisal-1',
            units: [],
            dataTypeReferences: {},
            incomeStatement: {
                years: [2025],
                customYearTitles: {},
                yearlySourceTypes: {},
                items: [{name: 'Rent', incomeStatementItemType: 'income', yearlyAmounts: {2025: 100}, extractionReferences: {}}],
            },
        };
        render(<IncomeStatementEditor appraisal={appraisal} field="incomeStatement" groups={{income: 'Income'}} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Add a year after the latest year'}));
        fireEvent.click(screen.getAllByTitle('Add Year').at(-1));
        expect(appraisal.incomeStatement.years).toEqual([2025, 2026]);
        expect(appraisal.incomeStatement.items[0].yearlyAmounts[2026]).toBe(102);
        expect(appraisal.incomeStatement.yearlySourceTypes[2026]).toBe('user');

        fireEvent.click(screen.getByRole('button', {name: 'Remove year 2025'}));
        fireEvent.click(screen.getByTitle('Remove Year'));
        expect(appraisal.incomeStatement.years).toEqual([2026]);
        expect(appraisal.incomeStatement.items[0].yearlyAmounts[2025]).toBeUndefined();
        expect(saveAppraisal).toHaveBeenCalledTimes(2);
    });

    it('keeps the custom-year title control, source value, and immediate save behavior', () => {
        const saveAppraisal = vi.fn();
        const appraisal = {
            _id: 'appraisal-1',
            units: [],
            dataTypeReferences: {},
            incomeStatement: {years: [2025], customYearTitles: {}, yearlySourceTypes: {}, items: []},
        };
        render(<IncomeStatementEditor appraisal={appraisal} field="incomeStatement" groups={{income: 'Income'}} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Custom title for 2025'}));

        expect(appraisal.incomeStatement.customYearTitles[2025]).toBe('Characterized value');
        expect(saveAppraisal).toHaveBeenCalledWith(appraisal);
    });

    it('keeps the pre-first-year discount action and its persisted source type', () => {
        const saveAppraisal = vi.fn();
        const appraisal = {
            _id: 'appraisal-1',
            units: [],
            dataTypeReferences: {},
            incomeStatement: {
                years: [2025], customYearTitles: {}, yearlySourceTypes: {},
                items: [{name: 'Rent', incomeStatementItemType: 'income', yearlyAmounts: {2025: 102}, extractionReferences: {}}],
            },
        };
        render(<IncomeStatementEditor appraisal={appraisal} field="incomeStatement" groups={{income: 'Income'}} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Add a year before 2025'}));
        fireEvent.click(screen.getAllByTitle('Add Year').at(-1));

        expect(appraisal.incomeStatement.years).toEqual([2024, 2025]);
        expect(appraisal.incomeStatement.items[0].yearlyAmounts[2024]).toBeCloseTo(100);
        expect(appraisal.incomeStatement.yearlySourceTypes[2024]).toBe('user');
        expect(saveAppraisal).toHaveBeenCalledWith(appraisal);
    });

    it('keeps item addition and keyboard reorder persistence with the existing status message', () => {
        const saveAppraisal = vi.fn();
        const appraisal = {
            _id: 'appraisal-1',
            units: [],
            dataTypeReferences: {},
            incomeStatement: {
                years: [2025],
                customYearTitles: {},
                yearlySourceTypes: {},
                items: [
                    {name: 'First', incomeStatementItemType: 'income', yearlyAmounts: {2025: 100}, extractionReferences: {}},
                    {name: 'Second', incomeStatementItemType: 'income', yearlyAmounts: {2025: 50}, extractionReferences: {}},
                ],
            },
        };
        render(<IncomeStatementEditor appraisal={appraisal} field="incomeStatement" groups={{income: 'Income'}} saveAppraisal={saveAppraisal}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Move First down'}));
        expect(appraisal.incomeStatement.items.map((item) => item.name)).toEqual(['Second', 'First']);
        expect(screen.getByRole('status')).toHaveTextContent('First moved down.');

        fireEvent.click(screen.getByRole('button', {name: 'Add income expense'}));
        expect(appraisal.incomeStatement.items.at(-1)).toMatchObject({name: null, incomeStatementItemType: 'income'});
        expect(saveAppraisal).toHaveBeenCalledTimes(2);
    });

});
