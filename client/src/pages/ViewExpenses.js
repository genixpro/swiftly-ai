import React from 'react';
import {Row, Col, Card, CardBody, CardHeader, Table, Button} from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import _ from 'underscore';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';
import arrayMove from "array-move";

class ViewExpenses extends React.Component
{
    state = {
        expenseTotal: {}

    };

    componentDidMount()
    {
        this.computeExpenseTotals();
    }

    componentDidUpdate()
    {

    }

    computeExpenseTotals()
    {
        let expenseTotal = {};

        if (this.props.appraisal.incomeStatement.expenses)
        {
            this.props.appraisal.incomeStatement.expenses.forEach((expense) =>
            {
                for (let year of Object.keys(expense.yearlyAmounts))
                {
                    if (_.isUndefined(expenseTotal[year]))
                    {
                        expenseTotal[year] = 0;
                    }
                    expenseTotal[year] += expense.yearlyAmounts[year];
                }
            });
        }

        this.setState({expenseTotal: expenseTotal});
    }


    changeIncomeItemValue(item, year, newValue)
    {
        item['yearlyAmounts'][year] = newValue;
        this.computeExpenseTotals();
        this.props.saveDocument(this.props.appraisal)
    }


    changeIncomeItemName(item, newName)
    {
        item['name'] = newName;
        this.props.saveDocument(this.props.appraisal)
    }


    removeIncomeItem(item, itemIndex)
    {
        if (item.cashFlowType === 'income')
        {
            this.props.appraisal.incomeStatement.incomes.splice(itemIndex, 1);
        }
        else
        {
            this.props.appraisal.incomeStatement.expenses.splice(itemIndex, 1);
        }
        this.computeExpenseTotals();
        this.props.saveDocument(this.props.appraisal);
    }


    renderIncomeStatementItemRow(incomeStatementItem, itemIndex)
    {
        const DragHandle = SortableHandle(() => <i className={"fa fa-bars"} />);


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
                    return <Col key={year} className={"amount-column"}>
                        <FieldDisplayEdit
                            type="currency"
                            hideIcon={false}
                            edit={yearIndex === this.props.appraisal.incomeStatement.years.length - 1}
                            value={incomeStatementItem.yearlyAmounts[year.toString()]}
                            extractionReference={incomeStatementItem.extractionReferences[year.toString()]}
                            history={this.props.history}
                            onChange={(newValue) => this.changeIncomeItemValue(incomeStatementItem, year, newValue)}
                        />
                    </Col>
                })
            }
            <Col className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.removeIncomeItem(incomeStatementItem, itemIndex)}
                    title={"Delete Line Item"}
                >
                    <i className="fa fa-trash-alt"></i>
                </Button>
            </Col>
        </li>
    }

    createNewIncomeItem(field, value, type)
    {
        const newItem = {
            type: type
        };

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

        if (type === 'income')
        {
            this.props.appraisal.incomeStatement.incomes.push(newItem);
        }
        else
        {
            this.props.appraisal.incomeStatement.expenses.push(newItem);
        }

        this.computeExpenseTotals();
        this.props.saveDocument(this.props.appraisal)

    }

    renderNewItemRow(type)
    {
        return <Row className={"expense-row"}>
            {this.renderHiddenHandleColumn()}
            <Col className={"name-column"}>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewIncomeItem("name", newValue, type))}
                />
            </Col>
            {
                this.props.appraisal.incomeStatement.years.map((year, yearIndex) =>
                {
                    return <Col key={year} className={"amount-column"}>
                        <FieldDisplayEdit
                            type="currency"
                            hideIcon={true}
                            value={""}
                            onChange={_.once((newValue) => this.createNewIncomeItem("yearlyAmounts", {[year]: newValue}, type))}
                        />
                    </Col>
                })
            }
            <Col className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.createNewIncomeItem(null, null, type)}
                    title={"New Unit"}
                >
                    <i className="fa fa-plus-square"></i>
                </Button>
            </Col>
        </Row>
    }

    onSortEnd({oldIndex, newIndex})
    {
        const appraisal = this.props.appraisal;
        appraisal.incomeStatement.expenses = arrayMove(appraisal.incomeStatement.expenses, oldIndex, newIndex);
        this.props.saveDocument(appraisal)

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


    render()
    {
        const SortableItem = SortableElement(({value, index}) => this.renderIncomeStatementItemRow(value, index));

        const SortableList = SortableContainer(({items}) => {
            return (
                <ul className={"sortable"}>
                    {items.map((value, index) => (
                        <SortableItem key={`item-${index}`} index={index} value={value} />
                    ))}
                </ul>
            );
        });

        return (
            <div className={"view-expenses"}>
                <AppraisalContentHeader appraisal={this.props.appraisal} title="Expenses"/>,
                <Row>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                {(this.props.appraisal && this.props.appraisal.incomeStatement) ?
                                    <div id={"view-expenses-body"} className={"view-expenses-body"}>
                                        <Row>
                                            <Col xs={12} md={10} lg={8} xl={6}>
                                                <Row className={"expense-row expense-header-row"}>
                                                    {this.renderHiddenHandleColumn()}
                                                    <Col className={"name-column"}>
                                                        Name
                                                    </Col>

                                                    {
                                                        this.props.appraisal.incomeStatement.years.map((year) =>
                                                        {
                                                            return <Col key={year} className={"amount-column"}>
                                                                {year}
                                                            </Col>
                                                        })
                                                    }
                                                    {this.renderHiddenActionColumn()}
                                                </Row>
                                                {
                                                    this.props.appraisal.incomeStatement.expenses ?
                                                        <SortableList
                                                            useDragHandle={true}
                                                            items={this.props.appraisal.incomeStatement.expenses}
                                                            onSortEnd={this.onSortEnd.bind(this)} />
                                                        : null
                                                }
                                                {
                                                    this.props.appraisal.incomeStatement.expenses ?
                                                        this.renderNewItemRow('expense')
                                                        : null
                                                }
                                                <Row className={"expense-row total-row"}>
                                                    {this.renderHiddenHandleColumn()}
                                                    <Col className={"name-column"}>Total</Col>
                                                    {
                                                        this.props.appraisal.incomeStatement.years.map((year) =>
                                                        {
                                                            return <Col key={year} className={"amount-column"}>
                                                                $<NumberFormat value={this.state.expenseTotal[year]}
                                                                               displayType={'text'}
                                                                               thousandSeparator={', '}
                                                                               decimalScale={2}
                                                                               fixedDecimalScale={true}/>
                                                            </Col>
                                                        })
                                                    }
                                                    {this.renderHiddenActionColumn()}
                                                </Row>
                                            </Col>
                                        </Row>
                                    </div>
                                    : null}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ViewExpenses;
