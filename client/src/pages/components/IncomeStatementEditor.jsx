import React from 'react';
import {Row, Col, Button, Popover, PopoverHeader, PopoverBody} from 'reactstrap';
import {filesApi} from '@api/resources';
import {DroppableFieldDisplayEdit, NonDroppableFieldDisplayEdit} from './FieldDisplayEdit';
import _ from 'underscore';
import {arrayMove} from '@dnd-kit/sortable';
import FileViewer from "./FileViewer"
import FileSelector from "./FileSelector"
import {IncomeStatementItemModel} from "../../models/IncomeStatementModel";
import FileModel from "../../models/FileModel";
import CurrencyFormat from "./CurrencyFormat";
import YearlySourceTypeFormat from "./YearlySourceTypeFormat";
import {calculateGroupTotals, cleanNumericalValue} from './income-statement/domain';

const sortableIndex = Symbol("sortableIndex");

class IncomeStatementEditor extends React.Component
{
    state = {
        newYearGrowthPercent: 2.0,
        newYearPopoverShowing: {},
        pinnedYear: null,
        deleteYearPopoverShowing: {},
        reorderMessage: ""
    };

    constructor()
    {
        super();

        this.IncomeStatementItemRow = this.renderIncomeStatementItemRow.bind(this);
        this.NewItemRow = this.renderNewItemRow.bind(this);

        this.SortableItem = ({value, index}) => <this.IncomeStatementItemRow value={value} index={index}/>;

        this.SortableNewItemRow = ({value, index}) => <this.NewItemRow value={value} index={index}/>;

        this.SortableHeader = ({value, index}) => <li className={"row expense-group-row"}>
            <Col>
                <Row><Col><div className={"header-label"}>{value}</div></Col></Row>
                <Row className={"expense-row expense-header-row"}>
                    {this.renderHiddenHandleColumn()}
                    <Col className={"name-column"}>
                        <div className={"header-wrapper"}>Name</div>
                    </Col>
                    {
                        this.props.appraisal[this.props.field].years.map((year) =>
                        {
                            if (this.state.pinnedYear !== null && year !== this.state.pinnedYear)
                            {
                                return null;
                            }

                            return [
                                <Col key={year.toString() + "-1"} className={"amount-column"}>
                                    <div className={"column-left-buttons"}>
                                        <Button
                                            className={`pin-column-button`}
                                            color={this.state.pinnedYear === year ? "info" : "secondary"}
                                            onClick={(evt) => this.togglePinYear(year)}
                                            title={"Pin Column"}
                                            aria-label={this.state.pinnedYear === year ? `Unpin ${year}` : `Pin ${year}`}
                                            style={{"float": "left"}}
                                        >
                                            {
                                                this.state.pinnedYear === null ?
                                                    <em className="fas fa-search-plus" />
                                                    : <em className="fas fa-search-minus" />
                                            }
                                        </Button>

                                        {
                                            year === this.props.appraisal[this.props.field].years[0] ?
                                                [
                                                    <Button
                                                        key={1}
                                                        id={`add-column-button-year-${this.props.field}-${value.replace(/\W/g, "-")}-${year}`}
                                                        className={`add-column-button-year`}
                                                        color="secondary"
                                                        onClick={(evt) => this.toggleNewYearPopover(value, year)}
                                                        title={"Add Year"}
                                                        aria-label={`Add a year before ${year}`}
                                                    >
                                                        <i className="fa fa-plus-square"></i>
                                                    </Button>,
                                                    <Popover
                                                        key={2}
                                                        placement="bottom" isOpen={this.state.newYearPopoverShowing[value + year]} target={`add-column-button-year-${this.props.field}-${value.replace(/\W/g, "-")}-${year}`} toggle={() => this.toggleNewYearPopover(value, year)}>
                                                        <PopoverHeader>Add New Year</PopoverHeader>
                                                        <PopoverBody>
                                                            Add a new year. Apply Discount Rate to Items:
                                                            <br/>
                                                            <br/>
                                                            <NonDroppableFieldDisplayEdit
                                                                type={"percent"}
                                                                value={this.state.newYearGrowthPercent}
                                                                onChange={(newValue) => this.setState({newYearGrowthPercent: newValue})}
                                                                hideField={false}
                                                            />
                                                            <br/>

                                                            <Button
                                                                color="info"
                                                                onClick={(evt) => {this.createNewYear(year); this.toggleNewYearPopover(value, year)}}
                                                                title={"Add Year"}
                                                            >
                                                                Add Year
                                                            </Button>
                                                            &nbsp;
                                                            <Button
                                                                color="danger"
                                                                onClick={(evt) => this.toggleNewYearPopover(value, year)}
                                                                title={"Cancel"}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </PopoverBody>
                                                    </Popover>
                                                ] : null
                                        }
                                    </div>
                                    {
                                        this.state.pinnedYear === null ? <div className={"remove-column-button-wrapper"}><Button
                                            id={`remove-year-${this.props.field}-${value.replace(/\W/g, "-")}-${year.toString()}`}
                                            className={`remove-column-button`}
                                            color="secondary"
                                            onClick={(evt) =>this.toggleDeleteYearPopover(value, year)}
                                            title={"Remove Column"}
                                            aria-label={`Remove year ${year}`}
                                            style={{"float": "left"}}
                                        >
                                            <i className="fa fa-times" />
                                        </Button>
                                                <Popover placement="bottom" isOpen={this.state.deleteYearPopoverShowing[value.toString() + year.toString()]} target={() => document.getElementById(`remove-year-${this.props.field}-${value.replace(/\W/g, "-")}-${year.toString()}`)} toggle={() => this.toggleDeleteYearPopover(value, year)}>
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
                                            <DroppableFieldDisplayEdit
                                                type={'text'}
                                                hideIcon={true}
                                                ariaLabel={`Custom title for ${year}`}
                                                value={this.props.appraisal[this.props.field].customYearTitles[year]}
                                                onChange={(newValue) => this.changeYearTitle(year, newValue)}
                                            />
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
                                id={`add-column-button-${this.props.field}-${value.replace(/\W/g, "-")}`}
                                className={`add-column-button`}
                                color="secondary"
                                onClick={(evt) => this.toggleNewYearPopover(value, 'default')}
                                title={"Add Year"}
                                aria-label="Add a year after the latest year"
                            >
                                <i className="fa fa-plus-square"></i>
                            </Button>
                            <Popover placement="bottom" isOpen={this.state.newYearPopoverShowing[value+"default"]} target={`add-column-button-${this.props.field}-${value.replace(/\W/g, "-")}`} toggle={() => this.toggleNewYearPopover(value, 'default')}>
                                <PopoverHeader>Add New Year</PopoverHeader>
                                <PopoverBody>
                                    Add a new year. Apply Growth Rate to Items:
                                    <br/>
                                    <br/>
                                    <NonDroppableFieldDisplayEdit
                                        type={"percent"}
                                        value={this.state.newYearGrowthPercent}
                                        onChange={(newValue) => this.setState({newYearGrowthPercent: newValue})}
                                        hideField={false}
                                    />
                                    <br/>

                                    <Button
                                        color="info"
                                        onClick={(evt) => {this.createNewYear(); this.toggleNewYearPopover(value, 'default')}}
                                        title={"Add Year"}
                                    >
                                        Add Year
                                    </Button>
                                    &nbsp;
                                    <Button
                                        color="danger"
                                        onClick={(evt) => this.toggleNewYearPopover(value, 'default')}
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
        </li>;

        this.SortableStats = ({value, index, name, field}) => <li className={"row expense-row total-row"}>
            {this.renderHiddenHandleColumn()}
            <Col className={"name-column"}>
                <div className={"value-wrapper"}>{name}</div>
            </Col>
            {
                this.props.appraisal[this.props.field].years.map((year) =>
                {
                    if (this.state.pinnedYear !== null && year !== this.state.pinnedYear)
                    {
                        return null;
                    }

                    return [<Col key={year.toString() + "1"} className={"amount-column"}>
                        <div className={"value-wrapper"}>
                            <CurrencyFormat value={this.state[field] ? this.state[field][year] : null}/>
                        </div>
                    </Col>, this.props.appraisal.sizeOfBuilding ? <Col key={year.toString() + "2"} className={"amount-column psf"}/> :null]
                })
            }
            {this.state.pinnedYear === null ? this.renderHiddenActionColumn() : null}
        </li>;

        this.SortableList = ({items}) =>
        {
            // const others = _.filter(items, (item) => Object.keys(this.props.groups).indexOf(item.incomeStatementItemType) === -1);

            let increment = 0;

            return (
                <ul className={"sortable"}>
                    {
                        Object.keys(this.props.groups).map((groupType) =>
                        {
                            const groupItems = _.filter(items, (item) => item.incomeStatementItemType === groupType);

                            const output = [
                                <this.SortableHeader key={groupType + "header"} value={this.props.groups[groupType]} index={increment}> </this.SortableHeader>,
                                groupItems.map((value, index) => (
                                    <this.SortableItem key={`item-${value[sortableIndex]}`} index={value[sortableIndex]} value={value}/>
                                )),
                                <this.SortableNewItemRow key={groupType + "new"} index={increment + groupItems.length + 1} value={groupType} />,
                                <this.SortableStats key={groupType + "stats"} name="Totals" index={increment + groupItems.length + 2} field={groupType + "_total"} />
                            ];

                            increment += groupItems.length + 3;

                            return output;
                        })
                    }

                    {/*<this.SortableHeader value="Not Included" index={increment}> </this.SortableHeader>*/}

                    {/*{others.map((value, index) => (*/}
                        {/*<this.SortableItem key={`item-${value[sortableIndex]}`} index={value[sortableIndex]} value={value}/>*/}
                    {/*))}*/}
                    {/*{*/}
                        {/*others.length === 0 ?*/}
                            {/*<li className={"row expense-row"} index={increment + 1}>*/}
                                {/*{this.renderHiddenHandleColumn()}*/}
                                {/*<Col className={"name-column"}>&nbsp;No entries*/}
                                {/*</Col>*/}

                                {/*{*/}
                                    {/*this.props.appraisal[this.props.field].years.map((year) =>*/}
                                    {/*{*/}
                                        {/*if (this.state.pinnedYear !== null && year !== this.state.pinnedYear)*/}
                                        {/*{*/}
                                            {/*return null;*/}
                                        {/*}*/}

                                        {/*return <Col key={year.toString() + "1"} className={"amount-column"} />*/}
                                    {/*})*/}
                                {/*}*/}
                                {/*{this.state.pinnedYear === null ? this.renderHiddenActionColumn() : null}*/}
                            {/*</li>*/}
                            {/*: null*/}
                    {/*}*/}

                </ul>
            );
        };
    }


    changeYearTitle(year, newValue)
    {
        const appraisal = this.props.appraisal;

        appraisal[this.props.field].customYearTitles[year] = newValue;

        this.props.saveAppraisal(this.props.appraisal)
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

        let index = 0;

        const others = _.filter(items, (item) => Object.keys(this.props.groups).indexOf(item.incomeStatementItemType) === -1);

        const result = {

        };

        Object.keys(this.props.groups).forEach((groupType) =>
        {
            index += 1;

            const groupItems = _.filter(items, (item) => item.incomeStatementItemType === groupType);
            groupItems.forEach((item) =>
            {
                item[sortableIndex] = index;
                index += 1;
            });

            index += 2;

            newItems = newItems.concat(groupItems);

            result[groupType] = groupItems.length;
        });

        index += 1;

        others.forEach((item) =>
        {
            item[sortableIndex] = index;
            index += 1;
        });

        result.others = others.length;

        newItems = newItems.concat(others);

        result.sorted = newItems;

        return result
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
        this.setState(calculateGroupTotals(this.props.groups, this.props.appraisal[this.props.field]));
    }

    cleanNumericalValue(value)
    {
        return cleanNumericalValue(value);
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
        this.props.saveAppraisal(this.props.appraisal)
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
        this.props.saveAppraisal(this.props.appraisal)
    }


    changeIncomeItemType(item, newType)
    {
        item['incomeStatementItemType'] = newType;
        this.props.saveAppraisal(this.props.appraisal)
    }


    changeIncomeItemName(item, newName)
    {
        item['name'] = newName;
        this.props.saveAppraisal(this.props.appraisal)
    }

    createNewYear(givenYear)
    {
        let newYear = null;
        if (givenYear)
        {
            newYear = givenYear - 1;
            this.props.appraisal[this.props.field].years.splice(0, 0, newYear);
        }
        else
        {
            const currentYear = this.props.appraisal[this.props.field].latestYear || new Date().getFullYear();
            newYear = currentYear + 1;
            this.props.appraisal[this.props.field].years.push(newYear);
        }

        this.props.appraisal[this.props.field].yearlySourceTypes[newYear] = 'user';

        const adjustFunction = (expense) =>
        {
            if (!expense.yearlyAmounts)
            {
                expense.yearlyAmounts = {};
            }

            if (givenYear)
            {
                if (expense.yearlyAmounts[givenYear])
                {
                    expense.yearlyAmounts[newYear] = expense.yearlyAmounts[givenYear] / (1 + this.state.newYearGrowthPercent / 100.0);
                }
                else
                {
                    expense.yearlyAmounts[newYear] = 0;
                }
            }
            else
            {
                if (expense.yearlyAmounts[newYear-1])
                {
                    expense.yearlyAmounts[newYear] = expense.yearlyAmounts[newYear-1] * (1 + this.state.newYearGrowthPercent / 100.0);
                }
                else
                {
                    expense.yearlyAmounts[newYear] = 0;
                }
            }
        };

        this.props.appraisal[this.props.field].items.forEach(adjustFunction);

        this.props.saveAppraisal(this.props.appraisal);
    }

    removeYear(year)
    {
        this.props.appraisal[this.props.field].years.splice(this.props.appraisal[this.props.field].years.indexOf(year), 1);
        delete this.props.appraisal[this.props.field].yearlySourceTypes[year];

        const deleteFunction = (expense) =>
        {
            if (!_.isUndefined(expense.yearlyAmounts[year]))
            {
                delete expense.yearlyAmounts[year];
            }
        };

        this.props.appraisal[this.props.field].items.forEach(deleteFunction);

        this.props.saveAppraisal(this.props.appraisal);
    }


    removeIncomeItem(item)
    {
        let expensedGrouped = this.sortIncomeStatementItems(this.props.appraisal[this.props.field].items);
        const expensesSorted = expensedGrouped.sorted;
        const origIndex = _.indexOf(expensesSorted, _.filter(expensesSorted, (expense) => expense[sortableIndex] === item[sortableIndex])[0]);

        expensesSorted.splice(origIndex, 1);

        this.props.appraisal[this.props.field].items = expensesSorted;

        this.computeExpenseTotals();
        this.props.saveAppraisal(this.props.appraisal);
    }

    moveIncomeItem(item, direction)
    {
        let expensesSorted = this.sortIncomeStatementItems(this.props.appraisal[this.props.field].items).sorted;
        const currentIndex = expensesSorted.indexOf(item);
        const newIndex = currentIndex + direction;
        if (currentIndex < 0 || newIndex < 0 || newIndex >= expensesSorted.length) return;

        item.incomeStatementItemType = expensesSorted[newIndex].incomeStatementItemType;
        expensesSorted = arrayMove(expensesSorted, currentIndex, newIndex);
        this.props.appraisal[this.props.field].items = expensesSorted;
        this.computeExpenseTotals();
        this.props.saveAppraisal(this.props.appraisal);
        this.setState({reorderMessage: `${item.name || 'Expense'} moved ${direction < 0 ? 'up' : 'down'}.`});
    }


    renderIncomeStatementItemRow(values)
    {
        let incomeStatementItem = values.value, itemIndex = values.index;

        const itemName = incomeStatementItem.name || "expense";
        const DragHandle = () => <button type="button" className="drag-handle icon-button" aria-label={`Drag to reorder ${itemName}`}>
            <i className={"fa fa-bars"} aria-hidden="true"/>
        </button>;


        return <li key={itemIndex} className={"row expense-row"} draggable
                   onDragStart={(event) => event.dataTransfer.setData('text/swiftly-income-index', String(itemIndex))}
                   onDragOver={(event) => event.preventDefault()}
                   onDrop={(event) => {
                       event.preventDefault();
                       const oldIndex = Number(event.dataTransfer.getData('text/swiftly-income-index'));
                       if (Number.isFinite(oldIndex) && oldIndex !== itemIndex) this.onSortEnd({oldIndex, newIndex: itemIndex});
                   }}>
            <Col className={"handle-column"}>
                <div>
                    <DragHandle/>
                    <div className="keyboard-reorder-controls">
                        <Button color="secondary" className="icon-button" onClick={() => this.moveIncomeItem(incomeStatementItem, -1)} aria-label={`Move ${itemName} up`}>
                            <i className="fa fa-chevron-up" aria-hidden="true" />
                        </Button>
                        <Button color="secondary" className="icon-button" onClick={() => this.moveIncomeItem(incomeStatementItem, 1)} aria-label={`Move ${itemName} down`}>
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
                    value={incomeStatementItem.name}
                    onChange={(newValue) => this.changeIncomeItemName(incomeStatementItem, newValue)}
                />
            </Col>

            {
                this.props.appraisal[this.props.field].years.map((year, yearIndex) =>
                {
                    if (this.state.pinnedYear && year !== this.state.pinnedYear)
                    {
                        return null;
                    }

                    return [<Col key={year.toString() + "1"} className={"amount-column"}>
                        <DroppableFieldDisplayEdit
                            type="currency"
                            ariaLabel={`${itemName}, ${year} amount`}
                            hideIcon={true}
                            edit={true}
                            value={incomeStatementItem.yearlyAmounts[year.toString()]}
                            onStartEditing={() => this.onViewExtractionReference(incomeStatementItem.extractionReferences[year.toString()])}
                            navigate={this.props.navigate} search={this.props.search}
                            onChange={(newValue, newReference) => this.changeIncomeItemValue(incomeStatementItem, year, newValue, newReference)}
                        />
                    </Col>,
                        this.props.appraisal.sizeOfBuilding ?
                            <Col key={year.toString() + "2"} className={"amount-column psf"}>
                                <DroppableFieldDisplayEdit
                                    type="currency"
                                    ariaLabel={`${itemName}, ${year} amount per square foot`}
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
                        aria-label={`Delete ${itemName}`}
                        className="icon-button"
                    >
                        <i className="fa fa-trash-alt" aria-hidden="true"></i>
                    </Button>
                </Col> : null
            }

        </li>
    }

    createNewIncomeItem(field, value, incomeStatementItemType, extractionReferences)
    {
        const newItem = IncomeStatementItemModel.create({
            cashFlowType: "expense",
            incomeStatementItemType: incomeStatementItemType
        }, this.props.appraisal[this.props.field], this.props.field);

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

        this.props.appraisal[this.props.field].items.push(newItem);

        this.computeExpenseTotals();
        this.props.saveAppraisal(this.props.appraisal)

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
                    ariaLabel={`New ${incomeStatementItemType} name`}
                    value={""}
                    onChange={_.once((newValue) => this.createNewIncomeItem("name", newValue, incomeStatementItemType))}
                />
            </Col>
            {
                this.props.appraisal[this.props.field].years.map((year, yearIndex) =>
                {
                    if (this.state.pinnedYear !== null && year !== this.state.pinnedYear)
                    {
                        return null;
                    }

                    return [<Col key={year.toString() + "1"} className={"amount-column"}>
                        <DroppableFieldDisplayEdit
                            type="currency"
                            ariaLabel={`New ${incomeStatementItemType}, ${year} amount`}
                            hideIcon={true}
                            value={""}
                            onChange={_.once((newValue, extractionReference) => newValue ? this.createNewIncomeItem("yearlyAmounts", {[year]: this.cleanNumericalValue(newValue)}, incomeStatementItemType, extractionReference ? {[year]: {
                                    appraisalId: this.props.appraisal._id,
                                    fileId: this.state.file._id,
                                    wordIndexes: extractionReference
                                }} : {}) : null)}
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
                        aria-label={`Add ${incomeStatementItemType} expense`}
                        className="icon-button"
                    >
                        <i className="fa fa-plus-square" aria-hidden="true"></i>
                    </Button>
                </Col> : null
            }
        </li>
    }

    toggleNewYearPopover(group, year)
    {
        const newYearPopoverShowing = this.state.newYearPopoverShowing;
        newYearPopoverShowing[group+year] = !newYearPopoverShowing[group+year];
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
        let expensedGrouped = this.sortIncomeStatementItems(this.props.appraisal[this.props.field].items);

        let expensesSorted = expensedGrouped.sorted;

        const origOldIndex = _.indexOf(expensesSorted, _.filter(expensesSorted, (expense) => expense[sortableIndex] === oldIndex)[0]);
        let origNewIndex = _.indexOf(expensesSorted, _.filter(expensesSorted, (expense) => expense[sortableIndex] === newIndex)[0]);

        let currentIndex = 0;
        let newIncomeStatementItemType = "";
        let groupIndex = 0;
        for (let group of Object.keys(this.props.groups))
        {
            let header = currentIndex;
            let itemsEnd = currentIndex + expensedGrouped[group];
            let statsRow = itemsEnd + 2;

            if ((groupIndex === 0 && newIndex <= statsRow)
                || (groupIndex > 0 && newIndex >= header && newIndex <= statsRow)
                || (newIndex < oldIndex && groupIndex > 0 && newIndex === statsRow + 1)
            )
            {
                newIncomeStatementItemType = group;
                break;
            }

            currentIndex = statsRow + 1;
            groupIndex += 1;
        }

        if (!newIncomeStatementItemType)
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
            const expenseFilter = (expense) => expense[sortableIndex] === newIndex-start;
            while (origNewIndex === -1 && (newIndex-start) > 0)
            {
                origNewIndex = _.indexOf(expensesSorted, _.filter(expensesSorted, expenseFilter)[0]);
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

        appraisal[this.props.field].items = expensesSorted;

        this.props.saveAppraisal(appraisal);
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
        this.setState({selectedFileId: fileId});
        if (!this.state.file || this.state.file._id !== fileId)
        {
            filesApi.get(this.props.appraisal._id, fileId).then((file) =>
            {
                this.setState({file: FileModel.create(file)});
            });
        }
    }

    getDefaultFile()
    {
        const dataType = this.props.field === 'expenseStatement' ? 'EXPENSE_STATEMENT' : 'INCOME_STATEMENT';
        const references = (this.props.appraisal.dataTypeReferences || {})[dataType] || [];
        const reference = references[0];

        return {
            fileId: reference ? reference.fileId : null,
            page: reference && reference.pageNumbers.length > 0 ? reference.pageNumbers[0] : 1
        };
    }


    render()
    {
        return (
                <div id={`income-statement-editor-${this.props.field}`} className={"income-statement-editor"}>
                    <div className="visually-hidden" role="status" aria-live="polite">{this.state.reorderMessage}</div>
                    <Row>
                        <Col xs={12} md={this.state.pinnedYear !== null ? 5 : 7} lg={this.state.pinnedYear !== null ? 4 : 7} xl={this.state.pinnedYear !== null ? 3 : 7}>

                            {
                                this.props.appraisal[this.props.field].items ?
                                    <div>
                                    <div className="horizontal-scroll-hint">Scroll horizontally to review all years and amounts.</div>
                                    <div className="income-statement-table-scroll" tabIndex="0" aria-label="Income statement table; scroll horizontally for more columns">
                                    <this.SortableList
                                        items={this.sortIncomeStatementItems(this.props.appraisal[this.props.field].items).sorted}
                                        onSortEnd={this.onSortEnd.bind(this)}/>
                                    </div>
                                    </div>
                                    : null
                            }
                        </Col>
                        <Col xs={12} md={this.state.pinnedYear !== null ? 7 : 5} lg={this.state.pinnedYear !== null ? 8 : 5} xl={this.state.pinnedYear !== null ? 9 : 5} className="income-statement-preview-column">
                            <Row className={"file-selector-row"}>
                                <Col xs={12}>
                                    <FileSelector
                                        appraisalId={this.props.appraisal._id}
                                        ariaLabel="Preview source file"
                                        onChange={(fileId) => this.onFileChanged(fileId)}
                                        defaultFile={this.getDefaultFile().fileId}
                                        value={this.state.selectedFileId ? this.state.selectedFileId : null}
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
                                                defaultPage={(this.state.file && this.state.file._id === this.getDefaultFile().fileId) ? this.getDefaultFile().page : 0}
                                                hilightWords={this.state.hoverReference ? this.state.hoverReference.wordIndexes : []}
                                            />
                                        </Col> : null
                                }
                            </Row>
                        </Col>
                    </Row>
                </div>
        );
    }
}

export default IncomeStatementEditor;
