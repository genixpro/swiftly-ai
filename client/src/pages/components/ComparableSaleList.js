import React from 'react';
import {Table} from 'reactstrap';
import ComparableSaleListItem from './ComparableSaleListItem';
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Col, CardHeader, CardTitle} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';
import Promise from 'bluebird';
import axios from "axios/index";
import ComparableSalesStatistics from "./ComparableSalesStatistics"


class ComparableSaleList extends React.Component
{
    state = {
        comparableSales: [],
        newComparableSale: {},
        isCreatingNewItem: false
    };

    loadedComparables = {};


    componentDidMount()
    {
        this.updateComparables();
    }


    componentDidUpdate()
    {
        this.updateComparables();
    }


    updateComparables()
    {
        if (this.props.comparableSales)
        {
            if (this.props.comparableSales !== this.state.comparableSales)
            {
                // this.setState({comparableSales: _.filter(this.props.comparableSales, (sale) => excludeIds.indexOf(sale._id['$oid]']) !== -1 )});
                this.setState({comparableSales: this.props.comparableSales});
            }
        }
        else if (this.props.comparableSaleIds)
        {
            if (this.props.comparableSaleIds !== this.state.comparableSaleIds)
            {
                this.setState({comparableSaleIds: this.props.comparableSaleIds});

                Promise.map(this.props.comparableSaleIds, (comparableSaleId) =>
                {
                    if (this.loadedComparables[comparableSaleId])
                    {
                        return this.loadedComparables[comparableSaleId];
                    }
                    else
                    {
                        // alert('loading');
                        return axios.get(`/comparable_sales/` + comparableSaleId).then((response) =>
                        {
                            this.loadedComparables[comparableSaleId] = response.data.comparableSale;
                            return response.data.comparableSale;
                        });
                    }
                }).then((comparableSales) =>
                {
                    this.setState({comparableSales: comparableSales})
                })
            }
        }
    }


    addNewComparable(newComparable)
    {
        // const comparables = this.props.comparableSales;
        // comparables.push(newComparable);

        this.props.onNewComparable(newComparable);
        this.setState({isCreatingNewItem: false})
    }

    updateComparable(changedComp, index)
    {
        const comparables = this.state.comparableSales;
        comparables[index] = changedComp;
        if (this.props.onChange)
        {
            this.props.onChange(comparables);
        }
    }


    onRemoveComparableClicked(comparable)
    {
        const comparables = this.state.comparableSales;

        for (let i = 0; i < this.state.comparableSales.length; i += 1)
        {
            if (this.state.comparableSales[i]._id['$oid'] === comparable._id['$oid'])
            {
                comparables.splice(i, 1);
                break;
            }
        }

        if (this.props.onChange)
        {
            this.props.onChange(comparables);
        }
    }


    toggleCreateNewItem()
    {
        this.setState({isCreatingNewItem: true})
    }


    renderNewItemRow()
    {
        return <div className="card b new-comparable" onClick={() => this.toggleCreateNewItem()}>
                <div className="card-body">
                    <span>Create new comparable...</span>
                </div>
            </div>
    }


    render()
    {
        let excludeIds = this.props.excludeIds;
        if (!excludeIds)
        {
            excludeIds = [];
        }

        return (
            <div>
                {
                    <ComparableSalesStatistics comparableSales={this.state.comparableSales}/>
                }
                {

                    <div className={`card b comparable-sale-list-header`}>
                        <CardHeader className={"comparable-sale-list-item-header"}>
                            <CardTitle>
                                <Row>
                                    <Col xs={2} className={"header-field-column"}>
                                        Date
                                    </Col>
                                    <Col xs={4} className={"header-field-column"}>
                                        Address
                                    </Col>
                                    <Col xs={2} className={"header-field-column"}>
                                        Sale Price
                                    </Col>
                                    <Col xs={2} className={"header-field-column"}>
                                        Description
                                    </Col>
                                    <Col xs={2} className={"header-field-column"}>
                                        Capitalization Rate
                                    </Col>
                                </Row>
                            </CardTitle>
                        </CardHeader>
                    </div>
                }
                {
                    this.props.allowNew ?
                        this.state.isCreatingNewItem ?
                            <ComparableSaleListItem comparableSale={_.clone(this.state.newComparableSale)}
                                                    onChange={(comp) => this.addNewComparable(comp)}/>
                            : this.renderNewItemRow()
                        : null
                }
                {
                    this.state.comparableSales.map((comparableSale, index) =>
                    {
                        if (excludeIds.indexOf(comparableSale._id['$oid']) === -1)
                        {
                            return <ComparableSaleListItem
                                key={comparableSale._id['$oid']}
                                comparableSale={comparableSale}
                                history={this.props.history}
                                onChange={(comp) => this.updateComparable(comp, index)}
                                appraisalComparables={this.props.appraisalComparables}
                                onAddComparableClicked={this.props.onAddComparableClicked}
                                onRemoveComparableClicked={this.props.onRemoveComparableClicked}
                                onDeleteComparable={(comp) => this.onRemoveComparableClicked(comp)}
                                appraisalId={this.props.appraisalId}
                            />;
                        }
                        else
                        {
                            return null;
                        }
                    })
                }
            </div>
        );
    }
}


export default ComparableSaleList;
