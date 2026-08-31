import _ from 'underscore';
import {Button, Col} from 'reactstrap';
import {DroppableFieldDisplayEdit} from './FieldDisplayEdit';
import type {IncomeStatementEditorController} from './income-statement/types';

interface IncomeStatementNewItemRowProps {
    editor: IncomeStatementEditorController;
    incomeStatementItemType: string;
    sizeOfBuilding: number;
}

/** Presentation-only new-line row with the legacy one-shot creation callbacks. */
export default function IncomeStatementNewItemRow({editor, incomeStatementItemType, sizeOfBuilding}: IncomeStatementNewItemRowProps) {
    const {appraisal, field} = editor.props;
    const {state} = editor;

    return <li className={"row expense-row"}>
        {editor.renderHiddenHandleColumn()}
        <Col className={"name-column"}>
            <DroppableFieldDisplayEdit
                hideIcon={true}
                ariaLabel={`New ${incomeStatementItemType} name`}
                value={""}
                onChange={_.once((newValue) => editor.createNewIncomeItem("name", newValue, incomeStatementItemType))}
            />
        </Col>
        {appraisal[field].years.map((year: number) => {
            if (state.pinnedYear !== null && year !== state.pinnedYear) return null;

            return [<Col key={year.toString() + "1"} className={"amount-column"}>
                <DroppableFieldDisplayEdit
                    type="currency"
                    ariaLabel={`New ${incomeStatementItemType}, ${year} amount`}
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue, extractionReference) => newValue
                        ? editor.createNewIncomeItem("yearlyAmounts", {[year]: editor.cleanNumericalValue(newValue)}, incomeStatementItemType, extractionReference ? {[year]: {
                            appraisalId: appraisal._id,
                            fileId: state.file!._id,
                            wordIndexes: extractionReference,
                        }} : {})
                        : null)}
                />
            </Col>, sizeOfBuilding ? <Col key={year.toString() + "2"} className={"amount-column psf"}></Col> : null];
        })}
        {state.pinnedYear === null ? <Col className={"action-column"}>
            <Button
                color="secondary"
                onClick={() => editor.createNewIncomeItem(null, null, incomeStatementItemType)}
                title={"New Expense"}
                aria-label={`Add ${incomeStatementItemType} expense`}
                className="icon-button"
            ><i className="fa fa-plus-square" aria-hidden="true"></i></Button>
        </Col> : null}
    </li>;
}
