import {Col, Row} from 'reactstrap';
import IncomeStatementPreview from './IncomeStatementPreview';
import IncomeStatementHeader from './IncomeStatementHeader';
import IncomeStatementItemRow from './IncomeStatementItemRow';
import IncomeStatementNewItemRow from './IncomeStatementNewItemRow';
import IncomeStatementSortableList from './IncomeStatementSortableList';
import IncomeStatementStatsRow from './IncomeStatementStatsRow';
import type {IncomeStatementEditorController, IncomeStatementFileViewer} from './income-statement/types';

interface IncomeStatementWorkspaceLayoutProps {
    editor: IncomeStatementEditorController;
}

/** Outer layout only; the editor retains sorting, state, and persistence. */
export default function IncomeStatementWorkspaceLayout({editor}: IncomeStatementWorkspaceLayoutProps) {
    const {appraisal, field} = editor.props;
    const {state} = editor;
    const items = appraisal[field].items;
    const {sizeOfBuilding, sortableIndex} = editor;
    return <div id={`income-statement-editor-${field}`} className={"income-statement-editor"}>
        <div className="visually-hidden" role="status" aria-live="polite">{state.reorderMessage}</div>
        <Row>
            <Col xs={12} md={state.pinnedYear !== null ? 5 : 7} lg={state.pinnedYear !== null ? 4 : 7} xl={state.pinnedYear !== null ? 3 : 7}>
                {items ? <div>
                    <div className="horizontal-scroll-hint">Scroll horizontally to review all years and amounts.</div>
                    <div className="income-statement-table-scroll" tabIndex={0} aria-label="Income statement table; scroll horizontally for more columns">
                        <IncomeStatementSortableList
                            groups={editor.props.groups}
                            items={editor.sortIncomeStatementItems(items).sorted}
                            Header={({value}) => <IncomeStatementHeader editor={editor} label={value} sizeOfBuilding={sizeOfBuilding}/>} 
                            Item={({value, index}) => <IncomeStatementItemRow editor={editor} item={value} itemIndex={index} sizeOfBuilding={sizeOfBuilding}/>} 
                            NewItemRow={({value}) => <IncomeStatementNewItemRow editor={editor} incomeStatementItemType={value} sizeOfBuilding={sizeOfBuilding}/>} 
                            Stats={({name, field: statsField}) => <IncomeStatementStatsRow editor={editor} field={statsField} name={name} sizeOfBuilding={sizeOfBuilding}/>} 
                            sortableIndex={sortableIndex}
                        />
                    </div>
                </div> : null}
            </Col>
            <IncomeStatementPreview
                appraisalId={appraisal._id}
                defaultFile={editor.getDefaultFile()}
                file={state.file}
                hoverReference={state.hoverReference}
                pinnedYearActive={state.pinnedYear !== null}
                selectedFileId={state.selectedFileId}
                onFileChanged={(fileId) => editor.onFileChanged(fileId)}
                onFileViewerRef={(ref) => editor.setFileViewer(ref as IncomeStatementFileViewer | undefined)}
            />
        </Row>
    </div>;
}
