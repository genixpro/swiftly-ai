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

const sortableIndex = Symbol("sortableIndex");

class ViewExpenses extends React.Component
{
    state = {
        operatingExpenseTotal: {},
        managementExpenseTotal: {},
        taxesExpenseTotal: {},
        newYearGrowthPercent: 2.0
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
                            return [
                                <Col key={year.toString() + "-1"} className={"amount-column"}>
                                    <div className={"header-wrapper"}>{year} <YearlySourceTypeFormat
                                        value={this.props.appraisal.incomeStatement.yearlySourceTypes[year]}/></div>
                                </Col>,
                                this.props.appraisal.sizeSquareFootage ?
                                    <Col key={year.toString() + "-2"} className={"amount-column psf"}>
                                        <div className={"header-wrapper"}>(psf)</div>
                                    </Col> : null
                            ]
                        })
                    }
                    <Col className={"add-column-column"}>
                        <Button
                            id={"add-column-button"}
                            color="info"
                            onClick={(evt) => this.toggleNewYearPopover()}
                            title={"Add Year"}
                        >
                            <i className="fa fa-plus-square"></i>
                        </Button>
                        <Popover placement="bottom" isOpen={this.state.newYearPopoverShowing} target="add-column-button" toggle={() => this.toggleNewYearPopover()}>
                            <PopoverHeader>Popover Title</PopoverHeader>
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
                                    onClick={(evt) => this.createNewYear()}
                                    title={"Add Year"}
                                >
                                    Add Year
                                </Button>
                                &nbsp;
                                <Button
                                    color="danger"
                                    onClick={(evt) => this.toggleNewYearPopover()}
                                    title={"Cancel"}
                                >
                                    Cancel
                                </Button>
                            </PopoverBody>
                        </Popover>
                    </Col>
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
                    return [<Col key={year.toString() + "1"} className={"amount-column"}>
                        <div className={"value-wrapper"}>
                            <CurrencyFormat value={this.state[field][year]}/>
                        </div>
                    </Col>, this.props.appraisal.sizeSquareFootage ? <Col key={year.toString() + "2"} className={"amount-column psf"}/> :null]
                })
            }
            {this.renderHiddenActionColumn()}
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

                    <this.SortableStats name="Operating Total" index={operatingExpenses.length + 2} field="operatingExpenseTotal" />

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


    changeIncomeItemValue(item, year, newValue)
    {
        if (newValue === null)
        {
            newValue = 0;
        }

        item['yearlyAmounts'][year] = newValue;
        this.computeExpenseTotals();
        this.props.saveDocument(this.props.appraisal)
    }


    changeIncomeItemPSFValue(item, year, newValue)
    {
        if (newValue === null)
        {
            newValue = 0;
        }

        const yearlyAmountsPSF = item['yearlyAmountsPSF'];
        yearlyAmountsPSF[year] = newValue;
        item['yearlyAmountsPSF'] = yearlyAmountsPSF;
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
                <FieldDisplayEdit
                    hideIcon={true}
                    value={incomeStatementItem.name}
                    onChange={(newValue) => this.changeIncomeItemName(incomeStatementItem, newValue)}
                />
            </Col>

            {
                this.props.appraisal.incomeStatement.years.map((year, yearIndex) =>
                {
                    return [<Col key={year.toString() + "1"} className={"amount-column"}>
                        <FieldDisplayEdit
                            type="currency"
                            hideIcon={true}
                            edit={true}
                            value={incomeStatementItem.yearlyAmounts[year.toString()]}
                            onStartEditing={() => this.onViewExtractionReference(incomeStatementItem.extractionReferences[year.toString()])}
                            history={this.props.history}
                            onChange={(newValue) => this.changeIncomeItemValue(incomeStatementItem, year, newValue)}
                        />
                    </Col>,
                        this.props.appraisal.sizeSquareFootage ?
                            <Col key={year.toString() + "2"} className={"amount-column psf"}>
                                <FieldDisplayEdit
                                    type="currency"
                                    hideIcon={true}
                                    edit={true}
                                    value={incomeStatementItem.yearlyAmountsPSF[year.toString()] ? incomeStatementItem.yearlyAmountsPSF[year.toString()] : ""}
                                    onStartEditing={() => this.onViewExtractionReference(incomeStatementItem.extractionReferences[year.toString()])}
                                    onChange={(newValue) => this.changeIncomeItemPSFValue(incomeStatementItem, year, newValue)}
                                />
                            </Col> : null]
                })
            }
            <Col className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.removeIncomeItem(incomeStatementItem)}
                    title={"Delete Line Item"}
                >
                    <i className="fa fa-trash-alt"></i>
                </Button>
            </Col>
        </li>
    }

    createNewIncomeItem(field, value, incomeStatementItemType)
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
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewIncomeItem("name", newValue, incomeStatementItemType))}
                />
            </Col>
            {
                this.props.appraisal.incomeStatement.years.map((year, yearIndex) =>
                {
                    return [<Col key={year.toString() + "1"} className={"amount-column"}>
                        <FieldDisplayEdit
                            type="currency"
                            hideIcon={true}
                            value={""}
                            onChange={_.once((newValue) => newValue ? this.createNewIncomeItem("yearlyAmounts", {[year]: newValue}, incomeStatementItemType) : null)}
                        />
                    </Col>,
                        this.props.appraisal.sizeSquareFootage ? <Col key={year.toString() + "2"} className={"amount-column psf"}></Col> : null
                    ]
                })
            }
            <Col className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.createNewIncomeItem(null, null, incomeStatementItemType)}
                    title={"New Unit"}
                >
                    <i className="fa fa-plus-square"></i>
                </Button>
            </Col>
        </li>
    }

    toggleNewYearPopover()
    {
        this.setState({newYearPopoverShowing: !this.state.newYearPopoverShowing});
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
                                        <Col xs={6}>

                                            {
                                                this.props.appraisal.incomeStatement.expenses ?
                                                    <this.SortableList
                                                        useDragHandle={true}
                                                        items={this.sortIncomeStatementItems(this.props.appraisal.incomeStatement.expenses).sorted}
                                                        onSortEnd={this.onSortEnd.bind(this)}/>
                                                    : null
                                            }
                                        </Col>
                                        <Col xs={6}>
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
