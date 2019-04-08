import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Button, CardFooter, Collapse, CardTitle, CardHeader, Row, Col} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import Datetime from 'react-datetime';
import PropertyTypeSelector from './PropertyTypeSelector';
import CurrencyFormat from './CurrencyFormat';
import IntegerFormat from './IntegerFormat';
import AreaFormat from './AreaFormat';

class ComparableLeaseListItem extends React.Component
{
    static _newLease = Symbol('newLease');

    static defaultProps = {
        edit: true
    };

    state = {
        comparableLease: {}
    };

    componentDidMount()
    {
        if (!this.props.comparableLease._id || this.props.openByDefault || this.props.comparableLease[ComparableLeaseListItem._newLease])
        {
            this.setState({detailsOpen: true})
        }

        this.setState({
            comparableLease: _.clone(this.props.comparableLease)
        })
    }

    cleanItem(item)
    {
        if (!item.rentType)
        {
            item.rentType = "net";
        }
        return item;
    }

    saveComparable(updatedComparable)
    {
        axios.post(`/comparable_leases/` + this.state.comparableLease._id, updatedComparable).then((response) => {
            // console.log(response.data.comparableLeases);
            // this.setState({comparableLeases: response.data.comparableLeases})
        });
    }

    createNewComparable(newComparable)
    {
        axios.post(`/comparable_leases`, newComparable).then((response) =>
        {
            const comparable = this.state.comparableLease;
            comparable["_id"] = response.data._id;
            comparable[ComparableLeaseListItem._newLease] = true;
            this.props.onChange(comparable);
        });
    }


    changeComparableField(field, newValue)
    {
        const comparable = this.state.comparableLease;

        comparable[field] = newValue;

        if (this.state.comparableLease._id)
        {
            this.saveComparable(this.cleanItem(comparable));
            this.props.onChange(this.cleanItem(comparable));
        }
        else
        {
            this.createNewComparable(this.cleanItem(comparable));
        }
    }


    deleteComparable()
    {
        this.props.onDeleteComparable(this.state.comparableLease);

        axios.delete(`/comparable_leases/` + this.state.comparableLease._id).then((response) => {
            // console.log(response.data.comparableLeases);
            // this.setState({comparableLeases: response.data.comparableLeases})
        });
    }

    isCompWithinAppraisal(appraisalComparables)
    {
        if (!this.state.comparableLease._id)
        {
            return false;
        }
        if (!appraisalComparables)
        {
            return false;
        }

        const id = this.state.comparableLease._id;

        for (let i = 0; i < appraisalComparables.length; i += 1)
        {
            if (appraisalComparables[i] === id)
            {
                return true;
            }
        }
        return false;
    }

    toggleDetails()
    {
        this.setState({detailsOpen: !this.state.detailsOpen});
    }


    render()
    {
        const comparableLease = this.state.comparableLease;

        const editableClass = this.props.edit ? "editable" : "non-editable";

        const expandedClass = this.state.detailsOpen ? "expanded" : "";

        return (
            <div className={`card b comparable-lease-list-item ${expandedClass}`}>
                <div>
                    {
                        this.props.onRemoveComparableClicked && this.isCompWithinAppraisal(this.props.appraisalComparables) ?
                            <div className={`comparable-button-row`}>
                                <Button color={"primary"} onClick={(evt) => this.props.onRemoveComparableClicked(comparableLease)} className={"move-comparable-button"}>
                                    <i className={"fa fa-check-square"} />
                                </Button>
                                <Button color={"danger"} onClick={(evt) => this.deleteComparable()} className={"delete-comparable-button " + (this.state.detailsOpen ? "" : "hidden")}>
                                    <i className={"fa fa-trash-alt"} />
                                </Button>
                            </div> : null
                    }
                    {
                        this.props.onAddComparableClicked && !this.isCompWithinAppraisal(this.props.appraisalComparables) ?
                            <div className={`comparable-button-row`}>
                                <Button color={"primary"} onClick={(evt) => this.props.onAddComparableClicked(comparableLease)} className={"move-comparable-button"}>
                                    <i className={"fa fa-square"} />
                                </Button>
                                <Button color={"danger"} onClick={(evt) => this.deleteComparable()} className={"delete-comparable-button " + (this.state.detailsOpen ? "" : "hidden")}>
                                    <i className={"fa fa-trash-alt"} />
                                </Button>
                            </div> : null
                    }
                </div>
                <div className={"comparable-lease-item-content"}>
                    {
                        comparableLease && comparableLease._id && !this.props.openByDefault ?
                            <CardHeader onClick={() => this.toggleDetails()} className={"comparable-lease-list-item-header"}>
                                <CardTitle>
                                    <Row>
                                        <Col xs={2} className={"header-field-column"}>
                                            {
                                                comparableLease.leaseDate ? <span>{new Date(comparableLease.leaseDate).getMonth()} / {new Date(comparableLease.leaseDate).getFullYear().toString().substr(2)}</span>
                                                    : <span className={"no-data"}>No Lease Date</span>
                                            }
                                        </Col>
                                        <Col xs={4} className={"header-field-column"}>
                                            {comparableLease.address ? comparableLease.address : <span className={"no-data"}>No Address</span>}
                                        </Col>
                                        <Col xs={2} className={"header-field-column"}>
                                            {comparableLease.sizeOfUnit ? <IntegerFormat value={comparableLease.sizeOfUnit} /> : <span className={"no-data"}>No Size</span>}
                                        </Col>
                                        <Col xs={2} className={"header-field-column"}>
                                            {comparableLease.yearlyRent ? <CurrencyFormat value={comparableLease.yearlyRent} /> : <span className={"no-data"}>No Rent</span>}
                                        </Col>
                                    </Row>
                                </CardTitle>
                            </CardHeader> : null
                    }
                    <Collapse isOpen={this.state.detailsOpen}>
                        <div className={`card-body comparable-lease-list-item-body ${editableClass}`}>
                            <div className={`comparable-lease-content`}>
                                <div className={"comparable-fields-area"}>
                                    <span className={"comparable-field-label"}>Address:</span>

                                    <FieldDisplayEdit
                                        type={"address"}
                                        edit={this.props.edit}
                                        placeholder={"Address"}
                                        value={comparableLease.address}
                                        onChange={(newValue) => this.changeComparableField('address', newValue)}
                                        onGeoChange={(newValue) => this.changeComparableField('location', {"type": "Point", "coordinates": [newValue.lng, newValue.lat]})}
                                    />

                                    <span className={"comparable-field-label"}>Property Type:</span>

                                    <FieldDisplayEdit
                                        type={"propertyType"}
                                        edit={this.props.edit}
                                        placeholder={"Property Type"}
                                        value={comparableLease.propertyType}
                                        onChange={(newValue) => this.changeComparableField('propertyType', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Size Of Unit: </span>

                                    <FieldDisplayEdit
                                        type={"area"}
                                        edit={this.props.edit}
                                        placeholder={"Size of Unit"}
                                        value={comparableLease.sizeOfUnit}
                                        onChange={(newValue) => this.changeComparableField('sizeOfUnit', newValue)}
                                    />
                                    <span className={"comparable-field-label"}>Yearly Rent:</span>

                                    <FieldDisplayEdit
                                        type={"currency"}
                                        edit={this.props.edit}
                                        placeholder={"Yearly Rent"}
                                        value={comparableLease.yearlyRent}
                                        onChange={(newValue) => this.changeComparableField('yearlyRent', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Free Rent:</span>

                                    <FieldDisplayEdit
                                        type={"text"}
                                        edit={this.props.edit}
                                        placeholder={"Free Rent"}
                                        value={comparableLease.freeRent}
                                        onChange={(newValue) => this.changeComparableField('freeRent', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Tenant Inducements:</span>

                                    <FieldDisplayEdit
                                        type={"text"}
                                        edit={this.props.edit}
                                        placeholder={"Tenant Inducements"}
                                        value={comparableLease.tenantInducements}
                                        onChange={(newValue) => this.changeComparableField('tenantInducements', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>TMI:</span>

                                    <FieldDisplayEdit
                                        type={"currency"}
                                        edit={this.props.edit}
                                        placeholder={"Taxes Maintenance Insurance"}
                                        value={comparableLease.taxesMaintenanceInsurance}
                                        onChange={(newValue) => this.changeComparableField('taxesMaintenanceInsurance', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Net / Gross:</span>

                                    <FieldDisplayEdit
                                        type={"rentType"}
                                        edit={this.props.edit}
                                        placeholder={"Net / Gross"}
                                        value={comparableLease.rentType}
                                        onChange={(newValue) => this.changeComparableField('rentType', newValue)}
                                    />
                                    <span className={"comparable-field-label"}>Tenant Name:</span>

                                    <FieldDisplayEdit
                                        type={"text"}
                                        edit={this.props.edit}
                                        placeholder={"Tenant Name"}
                                        value={comparableLease.tenantName}
                                        onChange={(newValue) => this.changeComparableField('tenantName', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Lease Date:</span>

                                    <FieldDisplayEdit
                                        type={"date"}
                                        edit={this.props.edit}
                                        placeholder={"Lease Date"}
                                        value={comparableLease.leaseDate}
                                        onChange={(newValue) => this.changeComparableField('leaseDate', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Tags:</span>

                                    <FieldDisplayEdit
                                        type={"tags"}
                                        edit={this.props.edit}
                                        placeholder={"Property Tags"}
                                        value={comparableLease.propertyTags}
                                        onChange={(newValue) => this.changeComparableField('propertyTags', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Description:</span>

                                    <FieldDisplayEdit
                                        type={"textbox"}
                                        edit={this.props.edit}
                                        placeholder={"Description..."}
                                        value={comparableLease.description}
                                        onChange={(newValue) => this.changeComparableField('description', newValue)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Collapse>
                </div>
            </div>

        );
    }
}


export default ComparableLeaseListItem;