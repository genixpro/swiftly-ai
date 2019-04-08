import React from 'react';
import {Table} from 'reactstrap';
import ComparableSaleListItem from './ComparableSaleListItem';
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Col, CardHeader, CardTitle} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';
import Promise from 'bluebird';
import axios from "axios/index";
import ComparableSalesStatistics from "./ComparableSalesStatistics"
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


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
        if (this.props.comparableSales !== this.state.comparableSales)
        {
            // this.setState({comparableSales: _.filter(this.props.comparableSales, (sale) => excludeIds.indexOf(sale._id['$oid]']) !== -1 )});
            this.setState({comparableSales: this.props.comparableSales});
        }
    }


    addNewComparable(newComparable)
    {
        this.props.onNewComparable(newComparable);
        this.setState({isCreatingNewItem: false, newComparableSale: {}})
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
            if (this.state.comparableSales[i]._id === comparable._id)
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


    toggleNewItem()
    {
        this.setState({isCreatingNewItem: false});
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
                    <ComparableSalesStatistics comparableSales={this.state.comparableSales}  title={this.props.statsTitle}/>
                }
                {

                    <div className={`card b comparable-sale-list-header`}>
                        <CardHeader className={"comparable-sale-list-item-header"}>
                            <CardTitle>
                                <Row>
                                    <Col xs={1} className={"header-field-column"}>
                                        Date
                                    </Col>
                                    <Col xs={3} className={"header-field-column"}>
                                        Address
                                    </Col>
                                    <Col  xs={2} className={"header-field-column"}>
                                        Building Size (sf)
                                    </Col>
                                    <Col xs={2} className={"header-field-column"}>
                                        Sale Price
                                    </Col>
                                    <Col xs={2} className={"header-field-column"}>
                                        Property Type<br/>Sub Type
                                    </Col>
                                    <Col xs={2} className={"header-field-column"}>
                                        Cap Rate (%)
                                        <br/>
                                        PSF ($)
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
                                <ModalHeader toggle={this.toggleNewItem.bind(this)}>New Comparable Sale</ModalHeader>
                                <ModalBody>
                                    <ComparableSaleListItem comparableSale={_.clone(this.state.newComparableSale)}
                                                             onChange={(comp) => this.setState({newComparableSale: comp})} />
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary" onClick={() => this.addNewComparable(this.state.newComparableSale)}>Add</Button>{' '}
                                    <Button color="primary" onClick={() => this.toggleNewItem()}>Cancel</Button>{' '}
                                </ModalFooter>
                            </Modal>
                        </div> : null
                }
                {
                    this.state.comparableSales.map((comparableSale, index) =>
                    {
                        if (excludeIds.indexOf(comparableSale._id) === -1)
                        {
                            return <ComparableSaleListItem
                                key={comparableSale._id}
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
