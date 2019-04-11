import React from 'react';
import {Row, Col, Card, CardBody, CardHeader, Table, Button, Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import _ from 'underscore';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';
import arrayMove from "array-move";
import FileViewer from "./components/FileViewer"
import FileSelector from "./components/FileSelector"
import {IncomeStatementItemModel} from "../models/IncomeStatementModel";
import FileModel from "../models/FileModel";
import CurrencyFormat from "./components/CurrencyFormat";
import YearlySourceTypeFormat from "./components/YearlySourceTypeFormat";
import { DropTarget } from 'react-dnd';

const sortableIndex = Symbol("sortableIndex");

/**
 * Your Component
 */
function FieldDisplayEditWrapper({ isDragging, connectDropTarget, ...props}) {
    return connectDropTarget(<div><FieldDisplayEdit {...props} /></div>)
}

/**
 * Implement the drag source contract.
 */
const dragTarget = {
    drop: (props, monitor) => {
        props.onChange(monitor.getItem().word.word, [monitor.getItem().word.index])
    }
};


function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
    }
}

// Export the wrapped component:
const DroppableFieldDisplayEdit = DropTarget("Word", dragTarget, collect)(FieldDisplayEditWrapper);


class ViewExpenses extends React.Component
{
    state = {
        operatingExpenseTotal: {},
        managementExpenseTotal: {},
        taxesExpenseTotal: {},
        newYearGrowthPercent: 2.0,
        newYearPopoverShowing: {},
        pinnedYear: null,
        deleteYearPopoverShowing: {}
    };

    constructor()
    {
        super();


        this.IncomeStatementItemRow = this.renderIncomeStatementItemRow.bind(this);
        this.NewItemRow = this.renderNewItemRow.bind(this);

        this.SortableItem = SortableElement(({value, index}) => <this.IncomeStatementItemRow value={value} index={index}/>);

        this.SortableNewItemRow = SortableElement(({value, index}) => <this.NewItemRow value={value} index={index}/>);

        this.SortableHeader = SortableElement(({value, index}) => <li className={"row expense-group-row"}>
            <Col>
                <Row><Col><div className={"header-label"}>{value}</div></Col></Row>
                <Row className={"expense-row expense-header-row"}>
                    {this.renderHiddenHandleColumn()}
                    <Col className={"name-column"}>
                        <div className={"header-wrapper"}>Name</div>
                    </Col>
                    {
                        this.props.appraisal.incomeStatement.years.map((year) =>
                        {
                            if (this.state.pinnedYear !== null && year !== this.state.pinnedYear)
                            {
                                return null;
                            }

                            return [
                                <Col key={year.toString() + "-1"} className={"amount-column"}>
                                    <Button
                                        className={`pin-column-button`}
                                        color={this.state.pinnedYear === year ? "info" : "secondary"}
                                        onClick={(evt) => this.togglePinYear(year)}
                                        title={"Pin Column"}
                                        style={{"float": "left"}}
                                    >
                                        <em className="icon-pin" />
                                    </Button>
                                    {
                                        this.state.pinnedYear === null ? <div className={"remove-column-button-wrapper"}><Button
                                            id={`remove-year-${year.toString()}`}
                                            className={`remove-column-button`}
                                            color="secondary"
                                            onClick={(evt) =>this.toggleDeleteYearPopover(value, year)}
                                            title={"Remove Column"}
                                            style={{"float": "left"}}
                                        >
                                            <i className="fa fa-minus-square" />
                                        </Button>
                                                <Popover placement="bottom" isOpen={this.state.deleteYearPopoverShowing[value.toString() + year.toString()]} target={() => document.getElementById(`remove-year-${year.toString()}`)} toggle={() => this.toggleDeleteYearPopover(value, year)}>
                                                    <PopoverHeader>Delete Year</PopoverHeader>
                                                    <PopoverBody>
                                                        Are you sure you want to delete this year?
                                                        <br/>
                                                        <br/>
                                                        <Button
                                                            color="danger"
                                                            onClick={(evt) => this.removeYear(year)}
                                                            title={"Remove Year"}
                                                        >
                                                            Remove Year
                                                        </Button>
                                                        &nbsp;
                                                        <Button
                                                            color="info"
                                                            onClick={(evt) => this.toggleDeleteYearPopover(value, year)}
                                                            title={"Cancel"}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </PopoverBody>
                                                </Popover>
                                            </div>
                                            : null
                                    }
                                    <div className={"header-wrapper"}>
                                    {year}
                                    <br/>
                                        {
                                            this.state.pinnedYear === null ? <YearlySourceTypeFormat value={this.props.appraisal.incomeStatement.yearlySourceTypes[year]}/> : null
                                        }
                                    </div>
                                </Col>,
                                this.props.appraisal.sizeOfBuilding ?
                                    <Col key={year.toString() + "-2"} className={"amount-column psf"}>
                                        <div className={"header-wrapper"}>(psf)</div>
                                    </Col> : null
                            ]
                        })
                    }
                    {
                        this.state.pinnedYear === null ? <Col className={"add-column-column"}>
                            <Button
                                id={`add-column-button-${value.replace(/ /g, "")}`}
                                className={`add-column-button`}
                                color="secondary"
                                onClick={(evt) => this.toggleNewYearPopover(value)}
                                title={"Add Year"}
                            >
                                <i className="fa fa-plus-square"></i>
                            </Button>
                            <Popover placement="bottom" isOpen={this.state.newYearPopoverShowing[value]} target={`add-column-button-${value.replace(/ /g, "")}`} toggle={() => this.toggleNewYearPopover(value)}>
                                <PopoverHeader>Add New Year</PopoverHeader>
                                <PopoverBody>
                                    Add a new year. Apply Growth Rate to expenses:
                                    <br/>
                                    <br/>
                                    <FieldDisplayEdit
                                        type={"percent"}
                                        value={this.state.newYearGrowthPercent}
                                        onChange={(newValue) => this.setState({newYearGrowthPercent: newValue})}
                                        hideField={false}
                                    />
                                    <br/>

                                    <Button
                                        color="info"
                                        onClick={(evt) => {this.createNewYear(); this.toggleNewYearPopover(value)}}
                                        title={"Add Year"}
                                    >
                                        Add Year
                                    </Button>
                                    &nbsp;
                                    <Button
                                        color="danger"
                                        onClick={(evt) => this.toggleNewYearPopover(value)}
                                        title={"Cancel"}
                                    >
                                        Cancel
                                    </Button>
                                </PopoverBody>
                            </Popover>
                        </Col> : null
                    }
                </Row>
            </Col>
        </li> );

        this.SortableStats = SortableElement(({value, index, name, field}) => <li className={"row expense-row total-row"}>
            {this.renderHiddenHandleColumn()}
            <Col className={"name-column"}>
                <div className={"value-wrapper"}>{name}</div>
            </Col>
            {
                this.props.appraisal.incomeStatement.years.map((year) =>
                {
                    if (this.state.pinnedYear !== null && year !== this.state.pinnedYear)
                    {
                        return null;
                    }

                    return [<Col key={year.toString() + "1"} className={"amount-column"}>
                        <div className={"value-wrapper"}>
                            <CurrencyFormat value={this.state[field][year]}/>
                        </div>
                    </Col>, this.props.appraisal.sizeOfBuilding ? <Col key={year.toString() + "2"} className={"amount-column psf"}/> :null]
                })
            }
            {this.state.pinnedYear === null ? this.renderHiddenActionColumn() : null}
        </li>);

        this.SortableList = SortableContainer(({items}) =>
        {
            const operatingExpenses = _.filter(items, (item) => item.incomeStatementItemType === 'operating_expense');
            const management = _.filter(items, (item) => item.incomeStatementItemType === 'management_expense');
            const taxes = _.filter(items, (item) => item.incomeStatementItemType === 'taxes');
            const others = _.filter(items, (item) => item.incomeStatementItemType !== 'operating_expense' && item.incomeStatementItemType !== 'management_expense' && item.incomeStatementItemType !== 'taxes');

            return (
                <ul className={"sortable"}>
                    <this.SortableHeader value="Operating Expenses" index={0}> </this.SortableHeader>

                    {operatingExpenses.map((value, index) => (
                        <this.SortableItem key={`item-${value[sortableIndex]}`} index={value[sortableIndex]} value={value}/>
                    ))}

                    <this.SortableNewItemRow index={operatingExpenses.length + 1} value="operating_expense" />

                    <this.SortableStats name="Operating Expense Total" index={operatingExpenses.length + 2} field="operatingExpenseTotal" />

                    <this.SortableHeader value="Management" index={operatingExpenses.length + 3}> </this.SortableHeader>

                    {management.map((value, index) => (
                        <this.SortableItem key={`item-${value[sortableIndex]}`} index={value[sortableIndex]} value={value}/>
                    ))}

                    <this.SortableNewItemRow index={operatingExpenses.length + 3 + management.length + 1} value="management_expense" />

                    <this.SortableStats name="Management Total" index={operatingExpenses.length + 2 + management.length + 2} field="managementExpenseTotal" />

                    <this.SortableHeader value="Taxes" index={operatingExpenses.length + 2 + management.length + 3}> </this.SortableHeader>

                    {taxes.map((value, index) => (
                        <this.SortableItem key={`item-${value[sortableIndex]}`} index={value[sortableIndex]} value={value}/>
                    ))}

                    <this.SortableNewItemRow index={operatingExpenses.length + 3 + management.length + 3 + taxes.length + 1} value="taxes" />

                    <this.SortableStats name="Taxes Total" index={operatingExpenses.length + 3 + management.length + 3 + taxes.length + 2} field="taxesExpenseTotal" />

                    <this.SortableHeader value="Ignored" index={operatingExpenses.length + 3 + management.length + 3 + taxes.length + 3}> </this.SortableHeader>

                    {others.map((value, index) => (
                        <this.SortableItem key={`item-${value[sortableIndex]}`} index={value[sortableIndex]} value={value}/>
                    ))}
                </ul>
            );
        });
    }


    togglePinYear(year)
    {
        if (year === this.state.pinnedYear)
        {
            this.setState({pinnedYear: null});
        }
        else
        {
            this.setState({pinnedYear: year});
        }
    }

    sortIncomeStatementItems(items)
    {
        let newItems = [];

        let index = 1;

        const operatingExpenses = _.filter(items, (item) => item.incomeStatementItemType === 'operating_expense');
        const management = _.filter(items, (item) => item.incomeStatementItemType === 'management_expense');
        const taxes = _.filter(items, (item) => item.incomeStatementItemType === 'taxes');
        const others = _.filter(items, (item) => (item.incomeStatementItemType !== 'operating_expense' && item.incomeStatementItemType !== 'management_expense' && item.incomeStatementItemType !== 'taxes'));

        operatingExpenses.forEach((item) =>
        {
            item[sortableIndex] = index;
            index += 1;
        });

        index += 3;

        management.forEach((item) =>
        {
            item[sortableIndex] = index;
            index += 1;
        });

        index += 3;

        taxes.forEach((item) =>
        {
            item[sortableIndex] = index;
            index += 1;
        });

        index += 3;

        others.forEach((item) =>
        {
            item[sortableIndex] = index;
            index += 1;
        });

        newItems = operatingExpenses.concat(management).concat(taxes).concat(others);

        return {sorted: newItems, operatingExpenses: operatingExpenses.length, management: management.length, taxes: taxes.length, others: others.length}
    }


    componentDidMount()
    {
        this.computeExpenseTotals();
    }

    componentDidUpdate()
    {

    }

    computeExpenseTotals()
    {
        let operatingExpenseTotal = {};
        let taxesExpenseTotal = {};
        let managementExpenseTotal = {};
        for (let year of this.props.appraisal.incomeStatement.years)
        {
            operatingExpenseTotal[year] = 0;
            taxesExpenseTotal[year] = 0;
            managementExpenseTotal[year] = 0;
        }

        if (this.props.appraisal.incomeStatement.expenses)
        {
            this.props.appraisal.incomeStatement.expenses.forEach((expense) =>
            {
                for (let year of Object.keys(expense.yearlyAmounts))
                {
                    let expenseTotals = operatingExpenseTotal;
                    if (expense.incomeStatementItemType === 'taxes')
                    {
                        taxesExpenseTotal[year] += expense.yearlyAmounts[year];
                    }
                    else if (expense.incomeStatementItemType === 'management_expense')
                    {
                        managementExpenseTotal[year] += expense.yearlyAmounts[year];
                    }
                    else if (expense.incomeStatementItemType === 'operating_expense')
                    {
                        operatingExpenseTotal[year] += expense.yearlyAmounts[year];
                    }

                }
            });
        }

        this.setState({operatingExpenseTotal, taxesExpenseTotal, managementExpenseTotal});
    }

    cleanNumericalValue(value)
    {
        value = value.toString();
        const cleanText = value.replace(/[^0-9\.]/g, "");
        const isNegative = value.indexOf("-") !== -1 || value.indexOf("(") !== -1 || value.indexOf(")") !== -1;

        if (cleanText === "")
        {
            return 0;
        }

        try {
            if (isNegative)
            {
                return -Number(cleanText);
            }
            else
            {
                return Number(cleanText);
            }
        }
        catch(err) {
            return 0;
        }
    }

    changeIncomeItemValue(item, year, newValue, newReference)
    {
        if (newValue === null)
        {
            newValue = 0;
        }

        item['yearlyAmounts'][year] = this.cleanNumericalValue(newValue);

        if (newReference)
        {
            const references = item['extractionReferences'];
            references[year] = {
                appraisalId: this.props.appraisal._id,
                fileId: this.state.file._id,
                wordIndexes: newReference
            };
            item['extractionReferences'] = references;
        }

        this.computeExpenseTotals();
        this.props.saveDocument(this.props.appraisal)
    }


    changeIncomeItemPSFValue(item, year, newValue, newReference)
    {
        if (newValue === null)
        {
            newValue = 0;
        }

        const yearlyAmountsPSF = item['yearlyAmountsPSF'];
        yearlyAmountsPSF[year] = this.cleanNumericalValue(newValue);
        item['yearlyAmountsPSF'] = yearlyAmountsPSF;

        if (newReference)
        {
            const references = item['extractionReferences'];
            references[year] = {
                appraisalId: this.props.appraisal._id,
                fileId: this.state.file._id,
                wordIndexes: newReference
            };
            item['extractionReferences'] = references;
        }

        this.computeExpenseTotals();
        this.props.saveDocument(this.props.appraisal)
    }


    changeIncomeItemType(item, newType)
    {
        item['incomeStatementItemType'] = newType;
        this.props.saveDocument(this.props.appraisal)
    }


    changeIncomeItemName(item, newName)
    {
        item['name'] = newName;
        this.props.saveDocument(this.props.appraisal)
    }

    createNewYear()
    {
        const currentYear = this.props.appraisal.incomeStatement.latestYear;
        const newYear = currentYear + 1;
        this.props.appraisal.incomeStatement.years.push(newYear);
        this.props.appraisal.incomeStatement.yearlySourceTypes[newYear] = 'user';

        const adjustFunction = (expense) =>
        {
            if (expense.yearlyAmounts[currentYear])
            {
                expense.yearlyAmounts[newYear] = expense.yearlyAmounts[currentYear] * (1 + this.state.newYearGrowthPercent/100.0);
            }
            else
            {
                expense.yearlyAmounts[newYear] = 0;
            }
        };

        this.props.appraisal.incomeStatement.incomes.forEach(adjustFunction);
        this.props.appraisal.incomeStatement.expenses.forEach(adjustFunction);

        this.props.saveDocument(this.props.appraisal);
    }

    removeYear(year)
    {
        this.props.appraisal.incomeStatement.years.splice(this.props.appraisal.incomeStatement.years.indexOf(year), 1);
        delete this.props.appraisal.incomeStatement.yearlySourceTypes[year];

        const deleteFunction = (expense) =>
        {
            if (!_.isUndefined(expense.yearlyAmounts[year]))
            {
                delete expense.yearlyAmounts[year];
            }
        };

        this.props.appraisal.incomeStatement.incomes.forEach(deleteFunction);
        this.props.appraisal.incomeStatement.expenses.forEach(deleteFunction);

        this.props.saveDocument(this.props.appraisal);
    }


    removeIncomeItem(item)
    {
        let expensedGrouped = this.sortIncomeStatementItems(this.props.appraisal.incomeStatement.expenses);
        const expensesSorted = expensedGrouped.sorted;
        const origIndex = _.indexOf(expensesSorted, _.filter(expensesSorted, (expense) => expense[sortableIndex] === item[sortableIndex])[0]);

        expensesSorted.splice(origIndex, 1);

        this.props.appraisal.incomeStatement.expenses = expensesSorted;

        this.computeExpenseTotals();
        this.props.saveDocument(this.props.appraisal);
    }


    renderIncomeStatementItemRow(values)
    {
        let incomeStatementItem = values.value, itemIndex = values.index;

        const DragHandle = SortableHandle(() => <i className={"fa fa-bars"}/>);


        return <li key={itemIndex} className={"row expense-row"}>
            <Col className={"handle-column"}>
                <div>
                    <DragHandle/>
                </div>
            </Col>
            <Col className={"name-column"}>
                <DroppableFieldDisplayEdit
                    hideIcon={true}
                    value={incomeStatementItem.name}
                    onChange={(newValue) => this.changeIncomeItemName(incomeStatementItem, newValue)}
                />
            </Col>

            {
                this.props.appraisal.incomeStatement.years.map((year, yearIndex) =>
                {
                    if (this.state.pinnedYear && year !== this.state.pinnedYear)
                    {
                        return null;
                    }

                    return [<Col key={year.toString() + "1"} className={"amount-column"}>
                        <DroppableFieldDisplayEdit
                            type="currency"
                            hideIcon={true}
                            edit={true}
                            value={incomeStatementItem.yearlyAmounts[year.toString()]}
                            onStartEditing={() => this.onViewExtractionReference(incomeStatementItem.extractionReferences[year.toString()])}
                            history={this.props.history}
                            onChange={(newValue, newReference) => this.changeIncomeItemValue(incomeStatementItem, year, newValue, newReference)}
                        />
                    </Col>,
                        this.props.appraisal.sizeOfBuilding ?
                            <Col key={year.toString() + "2"} className={"amount-column psf"}>
                                <DroppableFieldDisplayEdit
                                    type="currency"
                                    hideIcon={true}
                                    edit={true}
                                    value={incomeStatementItem.yearlyAmountsPSF[year.toString()] ? incomeStatementItem.yearlyAmountsPSF[year.toString()] : ""}
                                    onStartEditing={() => this.onViewExtractionReference(incomeStatementItem.extractionReferences[year.toString()])}
                                    onChange={(newValue, newReference) => this.changeIncomeItemPSFValue(incomeStatementItem, year, newValue, newReference)}
                                />
                            </Col> : null]
                })
            }
            {
                this.state.pinnedYear === null ? <Col className={"action-column"}>
                    <Button
                        color="secondary"
                        onClick={(evt) => this.removeIncomeItem(incomeStatementItem)}
                        title={"Delete Expense"}
                    >
                        <i className="fa fa-trash-alt"></i>
                    </Button>
                </Col> : null
            }

        </li>
    }

    createNewIncomeItem(field, value, incomeStatementItemType, extractionReferences)
    {
        const newItem = new IncomeStatementItemModel({
            cashFlowType: "expense",
            incomeStatementItemType: incomeStatementItemType
        }, this.props.appraisal.incomeStatement);

        if (field)
        {
            newItem[field] = value;
        }

        if (_.isUndefined(newItem['yearlyAmounts']))
        {
            newItem['yearlyAmounts'] = {};
        }

        if (_.isUndefined(newItem['name']))
        {
            newItem['name'] = 'New Item';
        }

        if (_.isUndefined(newItem['extractionReferences']))
        {
            newItem['extractionReferences'] = {};
        }

        if (extractionReferences && extractionReferences.wordIndexes)
        {
            newItem['extractionReferences'] = extractionReferences
        }

        this.props.appraisal.incomeStatement.expenses.push(newItem);

        this.computeExpenseTotals();
        this.props.saveDocument(this.props.appraisal)

    }

    onViewExtractionReference(extractionReference)
    {
        if (this.fileViewer && extractionReference)
        {
            this.fileViewer.hilightWords(extractionReference.wordIndexes);
        }
    }

    renderNewItemRow(data)
    {
        const incomeStatementItemType = data.value;
        return <li className={"row expense-row"}>
            {this.renderHiddenHandleColumn()}
            <Col className={"name-column"}>
                <DroppableFieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewIncomeItem("name", newValue, incomeStatementItemType))}
                />
            </Col>
            {
                this.props.appraisal.incomeStatement.years.map((year, yearIndex) =>
                {
                    if (this.state.pinnedYear !== null && year !== this.state.pinnedYear)
                    {
                        return null;
                    }

                    return [<Col key={year.toString() + "1"} className={"amount-column"}>
                        <DroppableFieldDisplayEdit
                            type="currency"
                            hideIcon={true}
                            value={""}
                            onChange={_.once((newValue, extractionReference) => newValue ? this.createNewIncomeItem("yearlyAmounts", {[year]: this.cleanNumericalValue(newValue)}, incomeStatementItemType, {[year]: {
                                    appraisalId: this.props.appraisal._id,
                                    fileId: this.state.file._id,
                                    wordIndexes: extractionReference
                                }}) : null)}
                        />
                    </Col>,
                        this.props.appraisal.sizeOfBuilding ? <Col key={year.toString() + "2"} className={"amount-column psf"}></Col> : null
                    ]
                })
            }
            {
                this.state.pinnedYear === null ? <Col className={"action-column"}>
                    <Button
                        color="secondary"
                        onClick={(evt) => this.createNewIncomeItem(null, null, incomeStatementItemType)}
                        title={"New Expense"}
                    >
                        <i className="fa fa-plus-square"></i>
                    </Button>
                </Col> : null
            }
        </li>
    }

    toggleNewYearPopover(group)
    {
        const newYearPopoverShowing = this.state.newYearPopoverShowing;
        newYearPopoverShowing[group] = !newYearPopoverShowing[group];
        this.setState({newYearPopoverShowing: newYearPopoverShowing});
    }

    toggleDeleteYearPopover(group, year)
    {
        const deleteYearPopoverShowing = this.state.deleteYearPopoverShowing;
        deleteYearPopoverShowing[group.toString() + year.toString()] = !deleteYearPopoverShowing[group.toString() + year.toString()];
        this.setState({deleteYearPopoverShowing: deleteYearPopoverShowing});
    }

    onSortEnd({oldIndex, newIndex})
    {
        let expensedGrouped = this.sortIncomeStatementItems(this.props.appraisal.incomeStatement.expenses);

        let expensesSorted = expensedGrouped.sorted;

        const origOldIndex = _.indexOf(expensesSorted, _.filter(expensesSorted, (expense) => expense[sortableIndex] === oldIndex)[0]);
        let origNewIndex = _.indexOf(expensesSorted, _.filter(expensesSorted, (expense) => expense[sortableIndex] === newIndex)[0]);

        let newIncomeStatementItemType = "";
        if (newIndex <= expensedGrouped.operatingExpenses + 1 || (newIndex <= expensedGrouped.operatingExpenses + 3 && newIndex < oldIndex))
        {
            newIncomeStatementItemType = "operating_expense";
        }
        else if (newIndex <= (expensedGrouped.operatingExpenses + expensedGrouped.management + 4) || (newIndex <= (expensedGrouped.operatingExpenses + expensedGrouped.management + 6) && newIndex < oldIndex))
        {
            newIncomeStatementItemType = "management_expense";
        }
        else if (newIndex <= (expensedGrouped.operatingExpenses + expensedGrouped.management + expensedGrouped.taxes + 7) || (newIndex <= (expensedGrouped.operatingExpenses + expensedGrouped.management + expensedGrouped.taxes + 9) && newIndex < oldIndex))
        {
            newIncomeStatementItemType = "taxes";
        }
        else
        {
            newIncomeStatementItemType = "unknown";
        }

        if (newIndex === 0)
        {
            origNewIndex = 0;
        }
        else
        {
            let start = 1;
            while (origNewIndex === -1 && (newIndex-start) > 0)
            {
                origNewIndex = _.indexOf(expensesSorted, _.filter(expensesSorted, (expense) => expense[sortableIndex] === newIndex-start)[0]);
                start += 1;
            }
        }

        const appraisal = this.props.appraisal;

        if (origNewIndex !== -1)
        {
            // Special case if you are sliding an item into the bottom of a grouping.
            if (origNewIndex > 0 && origNewIndex < expensesSorted.length && newIndex < oldIndex && expensesSorted[origNewIndex].incomeStatementItemType !== expensesSorted[origNewIndex + 1].incomeStatementItemType)
            {
                expensesSorted[origOldIndex].incomeStatementItemType = newIncomeStatementItemType;
                if (origOldIndex !== origNewIndex + 1)
                {
                    expensesSorted = arrayMove(expensesSorted, origOldIndex, origNewIndex+1);
                }
            }
            else
            {
                expensesSorted[origOldIndex].incomeStatementItemType = newIncomeStatementItemType;
                expensesSorted = arrayMove(expensesSorted, origOldIndex, origNewIndex);
            }
        }
        else
        {
            expensesSorted[origOldIndex].incomeStatementItemType = newIncomeStatementItemType;
        }

        appraisal.incomeStatement.expenses = expensesSorted;

        this.props.saveDocument(appraisal);
        this.computeExpenseTotals();

        // this.setState({appraisal: appraisal});
    };

    renderHiddenHandleColumn()
    {
        return <Col className={"handle-column"}>
            <div>
                <i className={"fa fa-bars"} style={{"visibility": "hidden"}}/>
            </div>
        </Col>;
    }

    renderHiddenActionColumn()
    {
        return <Col className={"action-column"}>
            <Button style={{"visibility": "hidden"}}>
                <i className="fa fa-trash-alt"></i>
            </Button>
        </Col>
    }

    onFileChanged(fileId)
    {
        if (!this.state.file || this.state.file._id !== fileId)
        {
            axios.get(`/appraisal/${this.props.appraisal._id}/files/${fileId}`).then((response) =>
            {
                this.setState({file: new FileModel(response.data.file)});
            });
        }
    }

    render()
    {
        return (
            <div className={"view-expenses"}>
                <AppraisalContentHeader appraisal={this.props.appraisal} title="Expenses"/>,
                <Row>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                {/*{(this.props.appraisal && this.props.appraisal.incomeStatement) ?*/}
                                <div id={"view-expenses-body"} className={"view-expenses-body"}>
                                    <Row>
                                        <Col xs={this.state.pinnedYear !== null ? 3 : 7}>

                                            {
                                                this.props.appraisal.incomeStatement.expenses ?
                                                    <this.SortableList
                                                        useDragHandle={true}
                                                        items={this.sortIncomeStatementItems(this.props.appraisal.incomeStatement.expenses).sorted}
                                                        onSortEnd={this.onSortEnd.bind(this)}/>
                                                    : null
                                            }
                                        </Col>
                                        <Col  xs={this.state.pinnedYear !== null ? 9: 5}>
                                            <Row className={"file-selector-row"}>
                                                <Col xs={12}>
                                                    <FileSelector
                                                        appraisalId={this.props.appraisal._id}
                                                        onChange={(fileId) => this.onFileChanged(fileId)}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                {
                                                    this.state.file ?
                                                        <Col xs={12}>
                                                            <FileViewer
                                                                ref={(ref) => this.fileViewer = ref}
                                                                document={this.state.file}
                                                                hilightWords={this.state.hoverReference ? this.state.hoverReference.wordIndexes : []}
                                                            />
                                                        </Col> : null
                                                }
                                            </Row>
                                        </Col>
                                    </Row>
                                </div>
                                {/*: null}*/}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ViewExpenses;
