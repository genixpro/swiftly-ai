import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Button, CardFooter} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';
import axios from "axios/index";
import Datetime from 'react-datetime';
import PropertyTypeSelector from './PropertyTypeSelector';

class ComparableLeaseListItem extends React.Component
{
    static defaultProps = {
        edit: true
    };

    state = {
        comparableLease: {}
    };

    componentDidMount()
    {
        this.setState({
            comparableLease: _.clone(this.props.comparableLease)
        })
    }

    saveComparable(updatedComparable)
    {
        axios.post(`/comparable_leases/` + this.state.comparableLease._id['$oid'], updatedComparable).then((response) => {
            // console.log(response.data.comparableLeases);
            // this.setState({comparableLeases: response.data.comparableLeases})
        });
    }

    createNewComparable(newComparable)
    {
        axios.post(`/comparable_leases`, newComparable).then((response) =>
        {
            const comparable = this.state.comparableLease;
            comparable["_id"] = {"$oid": response.data._id};
            this.props.onChange(comparable);
        });
    }


    changeComparableField(field, newValue)
    {
        const comparable = this.state.comparableLease;

        comparable[field] = newValue;

        if (this.state.comparableLease._id)
        {
            this.saveComparable(comparable);
            this.props.onChange(comparable);
        }
        else
        {
            this.createNewComparable(comparable);
        }
    }


    deleteComparable()
    {
        this.props.onDeleteComparable(this.state.comparableLease);

        axios.delete(`/comparable_leases/` + this.state.comparableLease._id['$oid']).then((response) => {
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

        const id = this.state.comparableLease._id['$oid'];

        for (let i = 0; i < appraisalComparables.length; i += 1)
        {
            if (appraisalComparables[i] === id)
            {
                return true;
            }
        }
        return false;
    }


    render()
    {
        const comparableLease = this.state.comparableLease;

        const editableClass = this.props.edit ? "editable" : "non-editable";

        return (
            <div className={`card b comparable-lease-list-item`}>
                <div className={`card-body comparable-lease-list-item-body ${editableClass}`}>
                    <div className={`comparable-lease-content`}>
                        <FieldDisplayEdit
                            type={"text"}
                            edit={this.props.edit}
                            placeholder={"Name..."}
                            className={"comparable-name"}
                            value={comparableLease.name}
                            onChange={(newValue) => this.changeComparableField('name', newValue)}
                        />
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
                                type={"number"}
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
                            <span className={"comparable-field-label"}>Sale Date:</span>

                            <FieldDisplayEdit
                                type={"date"}
                                edit={this.props.edit}
                                placeholder={"Lease Date"}
                                value={comparableLease.leaseDate}
                                onChange={(newValue) => this.changeComparableField('leaseDate', newValue)}
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
                <CardFooter>
                    {
                        this.props.onRemoveComparableClicked && this.isCompWithinAppraisal(this.props.appraisalComparables) ?
                            <div className={`comparable-button-row`}>
                                <Button color={"primary"} onClick={(evt) => this.props.onRemoveComparableClicked(comparableLease)} className={"move-comparable-button"}>
                                    <i className={"fa fa-angle-double-right"} />
                                    &nbsp;
                                    <span>Remove From Appraisal</span>
                                </Button>
                                <Button color={"danger"} onClick={(evt) => this.deleteComparable()} className={"delete-comparable-button"}>
                                    <i className={"fa fa-trash-alt"} />
                                </Button>
                            </div> : null
                    }
                    {
                        this.props.onAddComparableClicked && !this.isCompWithinAppraisal(this.props.appraisalComparables) ?
                            <div className={`comparable-button-row`}>
                                <Button color={"primary"} onClick={(evt) => this.props.onAddComparableClicked(comparableLease)} className={"move-comparable-button"}>
                                    <i className={"fa fa-angle-double-left"} />
                                    &nbsp;
                                    <span>Add to Appraisal</span>
                                </Button>
                                <Button color={"danger"} onClick={(evt) => this.deleteComparable()} className={"delete-comparable-button"}>
                                    <i className={"fa fa-trash-alt"} />
                                </Button>
                            </div> : null
                    }
                </CardFooter>
            </div>

        );
    }
}


export default ComparableLeaseListItem;