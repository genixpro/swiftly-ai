import React from 'react';
import ComparableLeaseListItem from './ComparableLeaseListItem';
import {Row, Col, CardHeader, CardTitle} from 'reactstrap';
import Promise from 'bluebird';
import axios from "axios/index";
import ComparableLeasesStatistics from "./ComparableLeasesStatistics";
import ComparableLeaseModel from "../../models/ComparableLeaseModel";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SortDirection from "./SortDirection";


class ComparableLeaseList extends React.Component
{
    static defaultProps = {
        "noCompMessage": "There are no comparables. Please add a new one or change your search settings."
    };

    state = {
        comparableLeases: [],
        newComparableLease: ComparableLeaseModel.create({
            rentType: "net"
        }),
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
                            this.loadedComparables[comparableLeaseId] = ComparableLeaseModel.create(response.data.comparableLease);
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

    toggleNewItem()
    {
        this.setState({isCreatingNewItem: false});
    }


    addNewComparable(newComparable)
    {
        axios.post(`/comparable_leases`, newComparable).then((response) =>
        {
            newComparable["_id"] = response.data._id;
            newComparable[ComparableLeaseListItem._newLease] = true;

            this.props.onNewComparable(newComparable);
            this.setState({isCreatingNewItem: false, newComparableLease: ComparableLeaseModel.create({})})
        });
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
            if (this.state.comparableLeases[i]._id === comparable._id)
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

    changeSortColumn(field)
    {
        let newSort = "";
        if (("+" + field) === this.props.sort)
        {
            newSort = "-" + field;
        }
        else if (("-" + field) === this.props.sort)
        {
            newSort = "+" + field;
        }
        else
        {
            newSort = "-" + field;
        }

        if (this.props.onSortChanged)
        {
            this.props.onSortChanged(newSort);
        }

        this.setState({sort: newSort});
    }

    render()
    {
        let excludeIds = this.props.excludeIds;
        if (!excludeIds)
        {
            excludeIds = [];
        }

        let firstSpacing = '';
        if (this.props.onRemoveComparableClicked)
        {
            firstSpacing = 'first-spacing';
        }

        return (
            <div>
                {
                    <ComparableLeasesStatistics comparableLeases={this.state.comparableLeases} title={this.props.statsTitle} />
                }
                {
                    <div className={`card b comparable-lease-list-header`}>
                        <CardHeader className={`comparable-lease-list-item-header ${firstSpacing}`}>
                            <CardTitle>
                                <Row>
                                    <Col xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("leaseDate")}>
                                        Date <SortDirection field={"leaseDate"} sort={this.props.sort} />
                                    </Col>
                                    <Col xs={4} className={"header-field-column"} onClick={() => this.changeSortColumn("address")}>
                                        Address <SortDirection field={"address"} sort={this.props.sort} />
                                    </Col>
                                    <Col xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("sizeOfUnit")}>
                                        Size (sf) <SortDirection field={"sizeOfUnit"} sort={this.props.sort} />
                                    </Col>
                                    <Col xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("rentEscalations[0].yearlyRent")}>
                                        Rent ($) <SortDirection field={"rentEscalations[0].yearlyRent"} sort={this.props.sort} />
                                    </Col>
                                    <Col xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("taxesMaintenanceInsurance")}>
                                        TMI ($) <SortDirection field={"taxesMaintenanceInsurance"} sort={this.props.sort} />
                                        <br/>
                                        Inducements
                                        <br/>
                                        Free Rent
                                    </Col>
                                </Row>
                            </CardTitle>
                        </CardHeader>
                    </div>
                }
                {
                    this.props.allowNew ?
                        <div>
                            {this.renderNewItemRow()}
                            <Modal isOpen={this.state.isCreatingNewItem} toggle={this.toggleNewItem.bind(this)} className={"new-comp-dialog"}>
                                        <ModalHeader toggle={this.toggleNewItem.bind(this)}>New Comparable Lease</ModalHeader>
                                        <ModalBody>
                                            <ComparableLeaseListItem comparableLease={this.state.newComparableLease}
                                                                     openByDefault={true}
                                                onChange={(comp) => this.setState({newComparableLease: comp})}/>
                                        </ModalBody>
                                        <ModalFooter>
                                        <Button color="primary" onClick={() => this.addNewComparable(this.state.newComparableLease)}>Save</Button>{' '}
                                        <Button color="primary" onClick={() => this.toggleNewItem.bind(this)}>Cancel</Button>{' '}
                                </ModalFooter>
                            </Modal>
                        </div> : null
                }
                {
                    this.state.comparableLeases.map((comparableLease, index) =>
                    {
                        if (excludeIds.indexOf(comparableLease._id) === -1)
                        {
                            return <ComparableLeaseListItem
                                key={comparableLease._id}
                                comparableLease={comparableLease}
                                history={this.props.history}
                                onChange={(comp) => this.updateComparable(comp, index)}
                                appraisalComparables={this.props.appraisalComparables}
                                onAddComparableClicked={this.props.onAddComparableClicked}
                                onRemoveComparableClicked={this.props.onRemoveComparableClicked}
                                onDeleteComparable={(comp) => this.onRemoveComparableClicked(comp)}
                                appraisalId={this.props.appraisalId}
                                last={index===this.state.comparableLeases.length-1}
                            />;
                        }
                        else
                        {
                            return null;
                        }
                    })
                }
                <div>
                    {
                        this.state.comparableLeases.length === 0 ? <div className="card b no-comparables-found">
                            <div className="card-body">
                                <span>{this.props.noCompMessage}</span>
                            </div>
                        </div> : null
                    }
                </div>
            </div>
        );
    }
}


export default ComparableLeaseList;
