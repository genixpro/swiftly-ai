import React from 'react';
import {Table} from 'reactstrap';
import ComparableLeaseListItem from './ComparableLeaseListItem';
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Col} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';
import Promise from 'bluebird';
import axios from "axios/index";


class ComparableLeaseList extends React.Component
{
    state = {
        comparableLeases: [],
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
        if (this.props.comparableLeases)
        {
            if (this.props.comparableLeases !== this.state.comparableLeases)
            {
                // this.setState({comparableLeases: _.filter(this.props.comparableLeases, (sale) => excludeIds.indexOf(sale._id['$oid]']) !== -1 )});
                this.setState({comparableLeases: this.props.comparableLeases});
            }
        }
        else if (this.props.comparableLeaseIds)
        {
            if (this.props.comparableLeaseIds !== this.state.comparableLeaseIds)
            {
                this.setState({comparableLeaseIds: this.props.comparableLeaseIds});

                Promise.map(this.props.comparableLeaseIds, (comparableLeaseId) =>
                {
                    if (this.loadedComparables[comparableLeaseId])
                    {
                        return this.loadedComparables[comparableLeaseId];
                    }
                    else
                    {
                        // alert('loading');
                        return axios.get(`/comparable_leases/` + comparableLeaseId).then((response) =>
                        {
                            this.loadedComparables[comparableLeaseId] = response.data.comparableLease;
                            return response.data.comparableLease;
                        });
                    }
                }).then((comparableLeases) =>
                {
                    this.setState({comparableLeases: comparableLeases})
                })
            }
        }
    }


    addNewComparable(newComparable)
    {
        // const comparables = this.props.comparableLeases;
        // comparables.push(newComparable);

        this.props.onNewComparable(newComparable);
        this.setState({isCreatingNewItem: false})
    }

    updateComparable(changedComp, index)
    {
        const comparables = this.state.comparableLeases;
        comparables[index] = changedComp;
        if (this.props.onChange)
        {
            this.props.onChange(comparables);
        }
    }


    onRemoveComparableClicked(comparable)
    {
        const comparables = this.state.comparableLeases;

        for (let i = 0; i < this.state.comparableLeases.length; i += 1)
        {
            if (this.state.comparableLeases[i]._id['$oid'] === comparable._id['$oid'])
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
                    this.props.allowNew ?
                        this.state.isCreatingNewItem ?
                            <ComparableLeaseListItem comparableLease={_.clone(this.state.newComparableSale)}
                                                    onChange={(comp) => this.addNewComparable(comp)}/>
                            : this.renderNewItemRow()
                        : null
                }
                {
                    this.state.comparableLeases.map((comparableLease, index) =>
                    {
                        if (excludeIds.indexOf(comparableLease._id['$oid']) === -1)
                        {
                            return <ComparableLeaseListItem
                                key={comparableLease._id['$oid']}
                                comparableLease={comparableLease}
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


export default ComparableLeaseList;
