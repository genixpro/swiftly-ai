import type {AppraisalDTO, ExtractionReferenceDTO, FileDTO, IncomeStatementDTO, IncomeStatementItemDTO, UnitDTO} from '../../../api/types';
import type {SortableIncomeStatementItem} from './sorting';

export type IncomeStatementField = 'incomeStatement' | 'expenseStatement';
export type IncomeStatementGroups = Record<string, string>;

export interface IncomeStatementExtractionReference {
    appraisalId?: string;
    fileId?: string;
    wordIndexes?: number[];
    [field: string]: unknown;
}

export interface EditableIncomeStatementItem extends IncomeStatementItemDTO, SortableIncomeStatementItem {
    extractionReferences: Record<string, IncomeStatementExtractionReference>;
    yearlyAmounts: Record<string, number | null>;
}

export interface EditableIncomeStatement extends IncomeStatementDTO {
    customYearTitles: Record<string, string>;
    items: EditableIncomeStatementItem[];
    yearlySourceTypes: Record<string, string>;
    years: number[];
}

interface IncomeStatementDataTypeReference extends ExtractionReferenceDTO {
    fileId?: string;
    pageNumbers?: number[];
}

export interface IncomeStatementAppraisal extends AppraisalDTO {
    dataTypeReferences?: Record<string, IncomeStatementDataTypeReference[]>;
    expenseStatement: EditableIncomeStatement;
    incomeStatement: EditableIncomeStatement;
    units?: UnitDTO[] | null;
}

export interface IncomeStatementEditorProps {
    appraisal: AppraisalDTO;
    field: IncomeStatementField;
    groups: IncomeStatementGroups;
    navigate?: unknown;
    saveAppraisal(appraisal: AppraisalDTO): void;
    search?: unknown;
}

export interface IncomeStatementControllerProps {
    appraisal: IncomeStatementAppraisal;
    field: IncomeStatementField;
    groups: IncomeStatementGroups;
    navigate?: unknown;
    saveAppraisal(appraisal: IncomeStatementAppraisal): void;
    search?: unknown;
}

export interface IncomeStatementEditorState {
    deleteYearPopoverShowing: Record<string, boolean>;
    file?: FileDTO;
    newYearGrowthPercent: number;
    newYearPopoverShowing: Record<string, boolean>;
    pinnedYear: number | null;
    reorderMessage: string;
    selectedFileId?: string;
    hoverReference?: IncomeStatementExtractionReference | null;
    [field: string]: unknown;
}

export interface IncomeStatementFileViewer {
    hilightWords(wordIndexes: number[]): void;
}

export interface IncomeStatementEditorController {
    props: IncomeStatementControllerProps;
    sizeOfBuilding: number;
    state: IncomeStatementEditorState;
    sortableIndex: symbol;
    changeIncomeItemName(item: EditableIncomeStatementItem, newName: unknown): void;
    changeIncomeItemType(item: EditableIncomeStatementItem, newType: string): void;
    changeIncomeItemPSFValue(item: EditableIncomeStatementItem, year: number, newValue: unknown, newReference?: number[]): void;
    changeIncomeItemValue(item: EditableIncomeStatementItem, year: number, newValue: unknown, newReference?: number[]): void;
    changeYearTitle(year: number, newValue: unknown): void;
    cleanNumericalValue(value: unknown): number;
    computeExpenseTotals(): void;
    createNewIncomeItem(field: string | null, value: unknown, incomeStatementItemType: string, extractionReferences?: Record<string, IncomeStatementExtractionReference>): void;
    createNewYear(givenYear?: number): void;
    getDefaultFile(): {fileId: string | null; page: number};
    moveIncomeItem(item: EditableIncomeStatementItem, direction: number): void;
    onFileChanged(fileId: string): void;
    onSortEnd(event: {oldIndex: number; newIndex: number}): void;
    onViewExtractionReference(reference: IncomeStatementExtractionReference | undefined): void;
    removeIncomeItem(item: EditableIncomeStatementItem): void;
    removeYear(year: number): void;
    renderHiddenActionColumn(): React.JSX.Element;
    renderHiddenHandleColumn(): React.JSX.Element;
    setFileViewer(fileViewer: IncomeStatementFileViewer | undefined): void;
    setState(updates: Partial<IncomeStatementEditorState>): void;
    sortIncomeStatementItems(items: EditableIncomeStatementItem[]): {sorted: EditableIncomeStatementItem[]} & Record<string, number | EditableIncomeStatementItem[]>;
    toggleDeleteYearPopover(group: string, year: number): void;
    toggleNewYearPopover(group: string, year: string | number): void;
    togglePinYear(year: number): void;
}
