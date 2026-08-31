import {Button, Col} from 'reactstrap';
import {DroppableFieldDisplayEdit} from './FieldDisplayEdit';
import {incomeStatementItemYearlyAmountsPSF} from '../../domain/incomeStatement';
import type {EditableIncomeStatementItem, IncomeStatementEditorController} from './income-statement/types';

interface IncomeStatementItemRowProps {
    editor: IncomeStatementEditorController;
    item: EditableIncomeStatementItem;
    itemIndex: number;
    sizeOfBuilding: number;
}

/**
 * Existing-line presentation. Its editor owns every mutation, navigation,
 * extraction-preview effect, and sort operation.
 */
export default function IncomeStatementItemRow({editor, item, itemIndex, sizeOfBuilding}: IncomeStatementItemRowProps) {
    const itemName = item.name || "expense";
    const {appraisal, field, navigate, search} = editor.props;
    const {state} = editor;
    const DragHandle = () => <button type="button" className="drag-handle icon-button" aria-label={`Drag to reorder ${itemName}`}>
        <i className={"fa fa-bars"} aria-hidden="true"/>
    </button>;

    return <li
        key={itemIndex}
        className={"row expense-row"}
        draggable
        onDragStart={(event) => event.dataTransfer.setData('text/swiftly-income-index', String(itemIndex))}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
            event.preventDefault();
            const oldIndex = Number(event.dataTransfer.getData('text/swiftly-income-index'));
            if (Number.isFinite(oldIndex) && oldIndex !== itemIndex) editor.onSortEnd({oldIndex, newIndex: itemIndex});
        }}
    >
        <Col className={"handle-column"}>
            <div>
                <DragHandle/>
                <div className="keyboard-reorder-controls">
                    <Button color="secondary" className="icon-button" onClick={() => editor.moveIncomeItem(item, -1)} aria-label={`Move ${itemName} up`}>
                        <i className="fa fa-chevron-up" aria-hidden="true" />
                    </Button>
                    <Button color="secondary" className="icon-button" onClick={() => editor.moveIncomeItem(item, 1)} aria-label={`Move ${itemName} down`}>
                        <i className="fa fa-chevron-down" aria-hidden="true" />
                    </Button>
                </div>
            </div>
        </Col>
        <Col className={"name-column"}>
            <DroppableFieldDisplayEdit
                hideIcon={true}
                type={"text"}
                ariaLabel={`${itemName} name`}
                value={item.name}
                onChange={(newValue) => editor.changeIncomeItemName(item, newValue)}
            />
        </Col>
        {appraisal[field].years.map((year: number) => {
            if (state.pinnedYear && year !== state.pinnedYear) return null;

            const yearlyAmountsPSF = sizeOfBuilding ? incomeStatementItemYearlyAmountsPSF(item, sizeOfBuilding) : null;
            return [<Col key={year.toString() + "1"} className={"amount-column"}>
                <DroppableFieldDisplayEdit
                    type="currency"
                    ariaLabel={`${itemName}, ${year} amount`}
                    hideIcon={true}
                    edit={true}
                    value={item.yearlyAmounts[year.toString()]}
                    onStartEditing={() => editor.onViewExtractionReference(item.extractionReferences[year.toString()])}
                    navigate={navigate}
                    search={search}
                    onChange={(newValue, newReference) => editor.changeIncomeItemValue(item, year, newValue, newReference)}
                />
            </Col>, sizeOfBuilding ? <Col key={year.toString() + "2"} className={"amount-column psf"}>
                <DroppableFieldDisplayEdit
                    type="currency"
                    ariaLabel={`${itemName}, ${year} amount per square foot`}
                    hideIcon={true}
                    edit={true}
                    value={yearlyAmountsPSF![year.toString()] ? yearlyAmountsPSF![year.toString()] : ""}
                    onStartEditing={() => editor.onViewExtractionReference(item.extractionReferences[year.toString()])}
                    onChange={(newValue, newReference) => editor.changeIncomeItemPSFValue(item, year, newValue, newReference)}
                />
            </Col> : null];
        })}
        {state.pinnedYear === null ? <Col className={"action-column"}>
            <Button
                color="secondary"
                onClick={() => editor.removeIncomeItem(item)}
                title={"Delete Expense"}
                aria-label={`Delete ${itemName}`}
                className="icon-button"
            ><i className="fa fa-trash-alt" aria-hidden="true"></i></Button>
        </Col> : null}
    </li>;
}
