import React from 'react';
import {Row, Col, Card, CardBody, CardHeader, Table, Button} from 'reactstrap';
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

class ViewExpenses extends React.Component
{
    state = {
        operatingExpenseTotal: {},
        managementExpenseTotal: {},
        taxesExpenseTotal: {}
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
                        expenseTotals = taxesExpenseTotal;
                    }

                    if (expense.incomeStatementItemType === 'management_expense')
                    {
                        expenseTotals = managementExpenseTotal;
                    }

                    expenseTotals[year] += expense.yearlyAmounts[year];
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
            <Col className={"type-column"}>
                <FieldDisplayEdit
                    type={"incomeItemType"}
                    cashFlowType={"expense"}
                    hideIcon={true}
                    value={incomeStatementItem.incomeStatementItemType}
                    onChange={(newValue) => this.changeIncomeItemType(incomeStatementItem, newValue)}
                />
            </Col>
            {
                this.props.appraisal.incomeStatement.years.map((year, yearIndex) =>
                {
                    return [<Col key={year.toString() + "1"} className={"amount-column"}>
                        <FieldDisplayEdit
                            type="currency"
                            hideIcon={false}
                            edit={true}
                            value={incomeStatementItem.yearlyAmounts[year.toString()]}
                            extractionReference={incomeStatementItem.extractionReferences[year.toString()]}
                            onViewExtractionReference={(ref) => this.onViewExtractionReference(ref)}
                            history={this.props.history}
                            onChange={(newValue) => this.changeIncomeItemValue(incomeStatementItem, year, newValue)}
                        />
                    </Col>, <Col key={year.toString() + "2"} className={"amount-column psf"}>
                        <FieldDisplayEdit
                            type="currency"
                            hideIcon={true}
                            edit={true}
                            value={incomeStatementItem.yearlyAmountsPSF[year.toString()] ? incomeStatementItem.yearlyAmountsPSF[year.toString()] : ""}
                            onChange={(newValue) => this.changeIncomeItemPSFValue(incomeStatementItem, year, newValue)}
                        />
                    </Col>]
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
        const newItem = new IncomeStatementItemModel({
            type: type
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

    onViewExtractionReference(extractionReference)
    {
        if (this.fileViewer)
        {
            this.fileViewer.hilightWords(extractionReference.wordIndexes);
        }
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
            <Col className={"type-column"}>
                <FieldDisplayEdit
                    type={"incomeItemType"}
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewIncomeItem("incomeStatementItemType", newValue, type))}
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
                            onChange={_.once((newValue) => newValue ? this.createNewIncomeItem("yearlyAmounts", {[year]: newValue}, type) : null)}
                        />
                    </Col>, <Col key={year.toString() + "2"} className={"amount-column psf"}></Col>]
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
        const SortableItem = SortableElement(({value, index}) => this.renderIncomeStatementItemRow(value, index));

        const SortableList = SortableContainer(({items}) =>
        {
            return (
                <ul className={"sortable"}>
                    {items.map((value, index) => (
                        <SortableItem key={`item-${index}`} index={index} value={value}/>
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
                                            <Col xs={6}>
                                                <Row className={"expense-row expense-header-row"}>
                                                    {this.renderHiddenHandleColumn()}
                                                    <Col className={"name-column"}>
                                                        <div className={"header-wrapper"}>Name</div>
                                                    </Col>
                                                    <Col className={"type-column"}>
                                                        <div className={"header-wrapper"}>Type</div>
                                                    </Col>

                                                    {
                                                        this.props.appraisal.incomeStatement.years.map((year) =>
                                                        {
                                                            return [<Col key={year.toString() + "-1"} className={"amount-column"}>
                                                                <div className={"header-wrapper"}>{year} <YearlySourceTypeFormat value={this.props.appraisal.incomeStatement.yearlySourceTypes[year]} /></div>
                                                            </Col>,
                                                                <Col key={year.toString() + "-2"} className={"amount-column psf"}>
                                                                    <div className={"header-wrapper"}>(psf)</div>
                                                                </Col>]
                                                        })
                                                    }
                                                    {this.renderHiddenActionColumn()}
                                                </Row>
                                                {
                                                    this.props.appraisal.incomeStatement.expenses ?
                                                        <SortableList
                                                            useDragHandle={true}
                                                            items={this.props.appraisal.incomeStatement.expenses}
                                                            onSortEnd={this.onSortEnd.bind(this)}/>
                                                        : null
                                                }
                                                {
                                                    this.props.appraisal.incomeStatement.expenses ?
                                                        this.renderNewItemRow('expense')
                                                        : null
                                                }
                                                <Row className={"expense-row total-row"}>
                                                    {this.renderHiddenHandleColumn()}
                                                    <Col className={"name-column"}>
                                                        <div className={"value-wrapper"}>Operating & NR Total</div>
                                                    </Col>
                                                    <Col className={"type-column"}/>
                                                    {
                                                        this.props.appraisal.incomeStatement.years.map((year) =>
                                                        {
                                                            return [<Col key={year.toString() + "1"} className={"amount-column"}>
                                                                <div className={"value-wrapper"}>
                                                                    <CurrencyFormat value={this.state.operatingExpenseTotal[year]} />
                                                                </div>
                                                            </Col>, <Col key={year.toString() + "2"} className={"amount-column psf"}/>]
                                                        })
                                                    }
                                                    {this.renderHiddenActionColumn()}
                                                </Row>
                                                <Row className={"expense-row total-row"}>
                                                    {this.renderHiddenHandleColumn()}
                                                    <Col className={"name-column"}>
                                                        <div className={"value-wrapper"}>Taxes Total</div>
                                                    </Col>
                                                    <Col className={"type-column"}/>
                                                    {
                                                        this.props.appraisal.incomeStatement.years.map((year) =>
                                                        {
                                                            return [<Col key={year.toString() + "1"} className={"amount-column"}>
                                                                <div className={"value-wrapper"}>
                                                                    <CurrencyFormat value={this.state.taxesExpenseTotal[year]} />
                                                                </div>
                                                            </Col>, <Col key={year.toString() + "2"} className={"amount-column psf"}/>]
                                                        })
                                                    }
                                                    {this.renderHiddenActionColumn()}
                                                </Row>
                                                <Row className={"expense-row total-row"}>
                                                    {this.renderHiddenHandleColumn()}
                                                    <Col className={"name-column"}>
                                                        <div className={"value-wrapper"}>Management Total</div>
                                                    </Col>
                                                    <Col className={"type-column"}/>
                                                    {
                                                        this.props.appraisal.incomeStatement.years.map((year) =>
                                                        {
                                                            return [<Col key={year.toString() + "1"} className={"amount-column"}>
                                                                <div className={"value-wrapper"}>
                                                                    <CurrencyFormat value={this.state.managementExpenseTotal[year]} />
                                                                </div>
                                                            </Col>, <Col key={year.toString() + "2"} className={"amount-column psf"}/>]
                                                        })
                                                    }
                                                    {this.renderHiddenActionColumn()}
                                                </Row>
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
