import {Button, Col, Popover, PopoverBody, PopoverHeader, Row} from 'reactstrap';
import {DroppableFieldDisplayEdit, NonDroppableFieldDisplayEdit} from './FieldDisplayEdit';
import {browserElementById} from '../../components/platform/browserDom';
import type {IncomeStatementEditorController} from './income-statement/types';

interface IncomeStatementHeaderProps {
    editor: IncomeStatementEditorController;
    label: string;
    sizeOfBuilding: number;
}

/**
 * Presentation-only year controls. Draft state, mutations, and persistence
 * remain owned by the compatibility controller in IncomeStatementEditor.
 */
export default function IncomeStatementHeader({editor, label, sizeOfBuilding}: IncomeStatementHeaderProps) {
    const {appraisal, field} = editor.props;
    const statement = appraisal[field];
    const {state} = editor;

    return <li className={"row expense-group-row"}>
        <Col>
            <Row><Col><div className={"header-label"}>{label}</div></Col></Row>
            <Row className={"expense-row expense-header-row"}>
                {editor.renderHiddenHandleColumn()}
                <Col className={"name-column"}><div className={"header-wrapper"}>Name</div></Col>
                {statement.years.map((year: number) => {
                    if (state.pinnedYear !== null && year !== state.pinnedYear) return null;

                    return [
                        <Col key={year.toString() + "-1"} className={"amount-column"}>
                            <div className={"column-left-buttons"}>
                                <Button
                                    className={`pin-column-button`}
                                    color={state.pinnedYear === year ? "info" : "secondary"}
                                    onClick={() => editor.togglePinYear(year)}
                                    title={"Pin Column"}
                                    aria-label={state.pinnedYear === year ? `Unpin ${year}` : `Pin ${year}`}
                                    style={{"float": "left"}}
                                >
                                    {state.pinnedYear === null ? <em className="fas fa-search-plus" /> : <em className="fas fa-search-minus" />}
                                </Button>
                                {year === statement.years[0] ? [
                                    <Button
                                        key={1}
                                        id={`add-column-button-year-${field}-${label.replace(/\W/g, "-")}-${year}`}
                                        className={`add-column-button-year`}
                                        color="secondary"
                                        onClick={() => editor.toggleNewYearPopover(label, year)}
                                        title={"Add Year"}
                                        aria-label={`Add a year before ${year}`}
                                    ><i className="fa fa-plus-square"></i></Button>,
                                    <Popover
                                        key={2}
                                        placement="bottom"
                                        isOpen={state.newYearPopoverShowing[label + year]}
                                        target={`add-column-button-year-${field}-${label.replace(/\W/g, "-")}-${year}`}
                                        toggle={() => editor.toggleNewYearPopover(label, year)}
                                    >
                                        <PopoverHeader>Add New Year</PopoverHeader>
                                        <PopoverBody>
                                            Add a new year. Apply Discount Rate to Items:
                                            <br/><br/>
                                            <NonDroppableFieldDisplayEdit
                                                type={"percent"}
                                                value={state.newYearGrowthPercent}
                                                onChange={(newValue) => editor.setState({newYearGrowthPercent: newValue as number})}
                                                hideField={false}
                                            />
                                            <br/>
                                            <Button color="info" onClick={() => {editor.createNewYear(year); editor.toggleNewYearPopover(label, year)}} title={"Add Year"}>Add Year</Button>
                                            &nbsp;
                                            <Button color="danger" onClick={() => editor.toggleNewYearPopover(label, year)} title={"Cancel"}>Cancel</Button>
                                        </PopoverBody>
                                    </Popover>,
                                ] : null}
                            </div>
                            {state.pinnedYear === null ? <div className={"remove-column-button-wrapper"}>
                                <Button
                                    id={`remove-year-${field}-${label.replace(/\W/g, "-")}-${year.toString()}`}
                                    className={`remove-column-button`}
                                    color="secondary"
                                    onClick={() => editor.toggleDeleteYearPopover(label, year)}
                                    title={"Remove Column"}
                                    aria-label={`Remove year ${year}`}
                                    style={{"float": "left"}}
                                ><i className="fa fa-times" /></Button>
                                <Popover
                                    placement="bottom"
                                    isOpen={state.deleteYearPopoverShowing[label.toString() + year.toString()]}
                                    target={browserElementById(`remove-year-${field}-${label.replace(/\W/g, "-")}-${year.toString()}`) as never}
                                    toggle={() => editor.toggleDeleteYearPopover(label, year)}
                                >
                                    <PopoverHeader>Delete Year</PopoverHeader>
                                    <PopoverBody>
                                        Are you sure you want to delete this year?
                                        <br/><br/>
                                        <Button color="danger" onClick={() => editor.removeYear(year)} title={"Remove Year"}>Remove Year</Button>
                                        &nbsp;
                                        <Button color="info" onClick={() => editor.toggleDeleteYearPopover(label, year)} title={"Cancel"}>Cancel</Button>
                                    </PopoverBody>
                                </Popover>
                            </div> : null}
                            <div className={"header-wrapper"}>
                                {year}<br/>
                                <DroppableFieldDisplayEdit
                                    type={'text'}
                                    hideIcon={true}
                                    ariaLabel={`Custom title for ${year}`}
                                    value={statement.customYearTitles[year]}
                                    onChange={(newValue) => editor.changeYearTitle(year, newValue)}
                                />
                            </div>
                        </Col>,
                        sizeOfBuilding ? <Col key={year.toString() + "-2"} className={"amount-column psf"}><div className={"header-wrapper"}>(psf)</div></Col> : null,
                    ];
                })}
                {state.pinnedYear === null ? <Col className={"add-column-column"}>
                    <Button
                        id={`add-column-button-${field}-${label.replace(/\W/g, "-")}`}
                        className={`add-column-button`}
                        color="secondary"
                        onClick={() => editor.toggleNewYearPopover(label, 'default')}
                        title={"Add Year"}
                        aria-label="Add a year after the latest year"
                    ><i className="fa fa-plus-square"></i></Button>
                    <Popover
                        placement="bottom"
                        isOpen={state.newYearPopoverShowing[label + "default"]}
                        target={`add-column-button-${field}-${label.replace(/\W/g, "-")}`}
                        toggle={() => editor.toggleNewYearPopover(label, 'default')}
                    >
                        <PopoverHeader>Add New Year</PopoverHeader>
                        <PopoverBody>
                            Add a new year. Apply Growth Rate to Items:
                            <br/><br/>
                            <NonDroppableFieldDisplayEdit
                                type={"percent"}
                                value={state.newYearGrowthPercent}
                                onChange={(newValue) => editor.setState({newYearGrowthPercent: newValue as number})}
                                hideField={false}
                            />
                            <br/>
                            <Button color="info" onClick={() => {editor.createNewYear(); editor.toggleNewYearPopover(label, 'default')}} title={"Add Year"}>Add Year</Button>
                            &nbsp;
                            <Button color="danger" onClick={() => editor.toggleNewYearPopover(label, 'default')} title={"Cancel"}>Cancel</Button>
                        </PopoverBody>
                    </Popover>
                </Col> : null}
            </Row>
        </Col>
    </li>;
}
