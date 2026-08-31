import React from 'react';
import {Button, Col} from 'reactstrap';
import {useFileLoader} from '@api/hooks';
import _ from 'underscore';
import {arrayMove} from '@dnd-kit/sortable';
import IncomeStatementWorkspaceLayout from './IncomeStatementWorkspaceLayout';
import {reorderIncomeStatementItems} from './income-statement/reorder';
import {sortIncomeStatementItems} from './income-statement/sorting';
import {calculateGroupTotals, cleanNumericalValue} from './income-statement/domain';
import {appraisalBuildingSize} from '../../domain/appraisal';
import {addIncomeStatementYear, incomeStatementItemYearlyAmountsPSF, removeIncomeStatementYear, setIncomeStatementItemYearlyAmountsPSF} from '../../domain/incomeStatement';
import {createIncomeStatementItem} from '../../domain/stabilizedStatement';
import type {EditableIncomeStatementItem, IncomeStatementControllerProps, IncomeStatementEditorController, IncomeStatementEditorProps, IncomeStatementEditorState, IncomeStatementExtractionReference, IncomeStatementFileViewer} from './income-statement/types';

const sortableIndex = Symbol('sortableIndex');

function IncomeStatementEditor(props: IncomeStatementEditorProps) {
    // Route facades may still pass a raw AppraisalDTO. The workspace hydrates
    // the nested statement defaults before this editor is mounted.
    const controllerProps = props as IncomeStatementControllerProps;
    const sizeOfBuilding = appraisalBuildingSize(controllerProps.appraisal);
    const loadFile = useFileLoader();
    const [state, setState] = React.useState<IncomeStatementEditorState>({
        newYearGrowthPercent: 2.0,
        newYearPopoverShowing: {},
        pinnedYear: null,
        deleteYearPopoverShowing: {},
        reorderMessage: '',
    });
    const initialPropsRef = React.useRef(controllerProps);
    const fileViewerRef = React.useRef<IncomeStatementFileViewer | undefined>(undefined);
    const setEditorState = (updates: Partial<IncomeStatementEditorState>) => setState((currentState) => ({...currentState, ...updates}));
    const sortItems = (items: EditableIncomeStatementItem[]) => sortIncomeStatementItems(items, controllerProps.groups, sortableIndex) as ReturnType<IncomeStatementEditorController['sortIncomeStatementItems']>;
    const computeExpenseTotals = () => setEditorState(calculateGroupTotals(controllerProps.groups, controllerProps.appraisal[controllerProps.field]));
    const persistAppraisal = () => controllerProps.saveAppraisal(controllerProps.appraisal);

    const changeYearTitle = (year: number, newValue: unknown) => {
        controllerProps.appraisal[controllerProps.field].customYearTitles[year] = newValue as string;
        persistAppraisal();
    };
    const togglePinYear = (year: number) => setEditorState({pinnedYear: year === state.pinnedYear ? null : year});
    const addReference = (item: EditableIncomeStatementItem, year: number, reference: number[]) => {
        const references = item.extractionReferences;
        references[year] = {appraisalId: controllerProps.appraisal._id, fileId: state.file!._id, wordIndexes: reference};
        item.extractionReferences = references;
    };
    const changeIncomeItemValue = (item: EditableIncomeStatementItem, year: number, newValue: unknown, newReference?: number[]) => {
        item.yearlyAmounts[year] = cleanNumericalValue(newValue === null ? 0 : newValue);
        if (newReference) addReference(item, year, newReference);
        computeExpenseTotals();
        persistAppraisal();
    };
    const changeIncomeItemPSFValue = (item: EditableIncomeStatementItem, year: number, newValue: unknown, newReference?: number[]) => {
        const yearlyAmountsPSF = incomeStatementItemYearlyAmountsPSF(item, sizeOfBuilding);
        yearlyAmountsPSF[year] = cleanNumericalValue(newValue === null ? 0 : newValue);
        item.yearlyAmounts = setIncomeStatementItemYearlyAmountsPSF(item, sizeOfBuilding, yearlyAmountsPSF) as EditableIncomeStatementItem['yearlyAmounts'];
        if (newReference) addReference(item, year, newReference);
        computeExpenseTotals();
        persistAppraisal();
    };
    const changeIncomeItemType = (item: EditableIncomeStatementItem, newType: string) => {
        item.incomeStatementItemType = newType;
        persistAppraisal();
    };
    const changeIncomeItemName = (item: EditableIncomeStatementItem, newName: unknown) => {
        item.name = newName as string | null;
        persistAppraisal();
    };
    const createNewYear = (givenYear?: number) => {
        const statement = controllerProps.appraisal[controllerProps.field];
        const updatedStatement = addIncomeStatementYear(statement, state.newYearGrowthPercent, givenYear);
        statement.years = updatedStatement.years;
        statement.yearlySourceTypes = updatedStatement.yearlySourceTypes;
        statement.items = updatedStatement.items;
        persistAppraisal();
    };
    const removeYear = (year: number) => {
        const statement = controllerProps.appraisal[controllerProps.field];
        const updatedStatement = removeIncomeStatementYear(statement, year);
        statement.years = updatedStatement.years;
        statement.yearlySourceTypes = updatedStatement.yearlySourceTypes;
        statement.items = updatedStatement.items;
        persistAppraisal();
    };
    const removeIncomeItem = (item: EditableIncomeStatementItem) => {
        const expensesSorted = sortItems(controllerProps.appraisal[controllerProps.field].items).sorted;
        const originalItem = _.filter(expensesSorted, (expense) => expense[sortableIndex] === item[sortableIndex])[0];
        expensesSorted.splice(_.indexOf(expensesSorted, originalItem), 1);
        controllerProps.appraisal[controllerProps.field].items = expensesSorted;
        computeExpenseTotals();
        persistAppraisal();
    };
    const moveIncomeItem = (item: EditableIncomeStatementItem, direction: number) => {
        let expensesSorted = sortItems(controllerProps.appraisal[controllerProps.field].items).sorted;
        const currentIndex = expensesSorted.indexOf(item);
        const newIndex = currentIndex + direction;
        if (currentIndex < 0 || newIndex < 0 || newIndex >= expensesSorted.length) return;
        item.incomeStatementItemType = expensesSorted[newIndex].incomeStatementItemType;
        expensesSorted = arrayMove(expensesSorted, currentIndex, newIndex);
        controllerProps.appraisal[controllerProps.field].items = expensesSorted;
        computeExpenseTotals();
        persistAppraisal();
        setEditorState({reorderMessage: `${item.name || 'Expense'} moved ${direction < 0 ? 'up' : 'down'}.`});
    };
    const createNewIncomeItem = (field: string | null, value: unknown, incomeStatementItemType: string, extractionReferences?: Record<string, IncomeStatementExtractionReference>) => {
        const newItem = createIncomeStatementItem({cashFlowType: 'expense', incomeStatementItemType}) as EditableIncomeStatementItem;
        if (field) newItem[field] = value;
        if (_.isUndefined(newItem.yearlyAmounts)) newItem.yearlyAmounts = {};
        if (_.isUndefined(newItem.name)) newItem.name = 'New Item';
        if (_.isUndefined(newItem.extractionReferences)) newItem.extractionReferences = {};
        if (extractionReferences?.wordIndexes) newItem.extractionReferences = extractionReferences;
        controllerProps.appraisal[controllerProps.field].items.push(newItem);
        computeExpenseTotals();
        persistAppraisal();
    };
    const onViewExtractionReference = (reference: IncomeStatementExtractionReference | undefined) => {
        if (fileViewerRef.current && reference) fileViewerRef.current.hilightWords(reference.wordIndexes!);
    };
    const toggleNewYearPopover = (group: string, year: string | number) => {
        const newYearPopoverShowing = state.newYearPopoverShowing;
        newYearPopoverShowing[group + year] = !newYearPopoverShowing[group + year];
        setEditorState({newYearPopoverShowing});
    };
    const toggleDeleteYearPopover = (group: string, year: number) => {
        const deleteYearPopoverShowing = state.deleteYearPopoverShowing;
        deleteYearPopoverShowing[group.toString() + year.toString()] = !deleteYearPopoverShowing[group.toString() + year.toString()];
        setEditorState({deleteYearPopoverShowing});
    };
    const onSortEnd = ({oldIndex, newIndex}: {oldIndex: number; newIndex: number}) => {
        const appraisal = controllerProps.appraisal;
        appraisal[controllerProps.field].items = reorderIncomeStatementItems({
            items: appraisal[controllerProps.field].items,
            groups: controllerProps.groups,
            oldIndex,
            newIndex,
            sortableIndex,
            sortItems: (items) => sortItems(items as EditableIncomeStatementItem[]),
        }) as EditableIncomeStatementItem[];
        persistAppraisal();
        computeExpenseTotals();
    };
    const renderHiddenHandleColumn = () => <Col className="handle-column"><div><i className="fa fa-bars" style={{visibility: 'hidden'}}/></div></Col>;
    const renderHiddenActionColumn = () => <Col className="action-column"><Button style={{visibility: 'hidden'}}><i className="fa fa-trash-alt"/></Button></Col>;
    const onFileChanged = (fileId: string) => {
        setEditorState({selectedFileId: fileId});
        if (!state.file || state.file._id !== fileId) loadFile(controllerProps.appraisal._id, fileId).then((file) => setEditorState({file}));
    };
    const getDefaultFile = () => {
        const dataType = controllerProps.field === 'expenseStatement' ? 'EXPENSE_STATEMENT' : 'INCOME_STATEMENT';
        const reference = (controllerProps.appraisal.dataTypeReferences || {})[dataType]?.[0];
        return {fileId: reference?.fileId ?? null, page: reference?.pageNumbers?.length ? reference.pageNumbers[0] : 1};
    };
    const setFileViewer = (fileViewer: IncomeStatementFileViewer | undefined) => {
        fileViewerRef.current = fileViewer;
    };
    const editor: IncomeStatementEditorController = {
        props: controllerProps, sizeOfBuilding, sortableIndex, state, setState: setEditorState, setFileViewer,
        changeYearTitle, togglePinYear, sortIncomeStatementItems: sortItems, computeExpenseTotals, cleanNumericalValue,
        changeIncomeItemValue, changeIncomeItemPSFValue, changeIncomeItemType, changeIncomeItemName, createNewYear,
        removeYear, removeIncomeItem, moveIncomeItem, createNewIncomeItem, onViewExtractionReference,
        toggleNewYearPopover, toggleDeleteYearPopover, onSortEnd, renderHiddenHandleColumn, renderHiddenActionColumn,
        onFileChanged, getDefaultFile,
    };

    React.useEffect(() => {
        const initialProps = initialPropsRef.current;
        setState((currentState) => ({...currentState, ...calculateGroupTotals(initialProps.groups, initialProps.appraisal[initialProps.field])}));
    }, []);

    return <IncomeStatementWorkspaceLayout editor={editor}/>;
}

export default IncomeStatementEditor;
