import React from 'react';
import { Button, Collapse, CardTitle, CardHeader, Row, Col} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';
import axios from "axios/index";
import CurrencyFormat from './CurrencyFormat';
import IntegerFormat from './IntegerFormat';
import UploadableImage from "./UploadableImage";
import {RentEscalation} from "../../models/ComparableLeaseModel";
import ComparableLeaseModel from "../../models/ComparableLeaseModel";
import PropTypes from "prop-types";
import AreaFormat from "./AreaFormat";
import PercentFormat from "./PercentFormat";

class ComparableLeaseListItemHeaderColumn extends React.Component
{
    static propTypes = {
        size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        renders: PropTypes.arrayOf(PropTypes.func).isRequired,
        noValueTexts: PropTypes.arrayOf(PropTypes.string).isRequired,
        fields: PropTypes.arrayOf(PropTypes.string).isRequired,
        comparableLease: PropTypes.instanceOf(ComparableLeaseModel).isRequired
    };

    render()
    {
        const colProps = {};
        let colClass = "";

        if (_.isNumber(this.props.size))
        {
            colProps['xs'] = this.props.size;
        }
        else if(this.props.size === 'middle')
        {
            colClass = "middle-col"
        }

        return <Col className={`header-field-column ${colClass}`} {...colProps}>

            {
                this.props.fields.map((field, fieldIndex) =>
                {
                    return this.props.comparableLease[field] && !(_.isArray(this.props.comparableLease[field]) && this.props.comparableLease[field].length === 0)
                        ? <span key={fieldIndex}>
                            {
                                this.props.renders[fieldIndex](this.props.comparableLease[field])
                            }
                            {fieldIndex !== this.props.fields.length - 1 ? <br /> : null}
                            </span>
                        : <span className={"no-data"} key={fieldIndex}>
                            {this.props.noValueTexts[fieldIndex]}
                            {fieldIndex !== this.props.fields.length - 1 ? <br /> : null}
                        </span>
                })
            }

        </Col>
    }
}

class ComparableLeaseListItem extends React.Component
{
    static _newLease = Symbol('newLease');

    static defaultProps = {
        edit: true
    };

    state = {
        comparableLease: {}
    };

    static getDerivedStateFromProps(props)
    {
        if (!props.comparableLease._id || props.openByDefault || props.comparableLease[ComparableLeaseListItem._newLease])
        {
            return {openByDefault: true}
        }
        else
        {
            return {openByDefault: false}
        }
    }

    componentDidMount()
    {
        this.setState({
            comparableLease: this.props.comparableLease
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


    createNewEscalation(key, value)
    {
        if (!_.isNull(value))
        {
            const escalation = RentEscalation.create({}, this.state.comparableLease, "rentEscalations");
            escalation[key] = value;

            let escalations = this.state.comparableLease.rentEscalations;
            if (!escalations)
            {
                escalations = [];
            }
            escalations.push(escalation);

            this.changeComparableField("rentEscalations", escalations);
        }
    }


    changeEscalationField(escalation, field, newValue)
    {
        escalation[field] = newValue;
        this.changeComparableField("rentEscalations", this.state.comparableLease.rentEscalations);
    }

    removeEscalation(escalationIndex)
    {
        let escalations = this.state.comparableLease.rentEscalations;
        escalations.splice(escalationIndex, 1);
        this.changeComparableField("rentEscalations", escalations);
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
            this.props.onChange(this.cleanItem(comparable));
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

        const lastClass = this.props.last ? "last" : "";

        const headerConfigurations = {
            leaseDate: {
                render: (value) => <span>{new Date(value).getMonth() + 1} / {new Date(value).getFullYear().toString().substr(2)}</span>,
                noValueText: "No Lease Date",
                size: 2
            },
            address: {
                render: (value) => <span>{value}</span>,
                noValueText: "No Address",
                size: 4
            },
            rentEscalations: {
                render: (value) => value.map((escalation, escalationIndex) =>
                {
                    if (escalation.startYear && escalation.endYear)
                    {
                        return <span key={escalationIndex}>Yrs. {escalation.startYear} - {escalation.endYear} @ <CurrencyFormat value={escalation.yearlyRent} cents={false} /><br/></span>
                    }
                    else if (escalation.startYear || escalation.endYear)
                    {
                        return <span key={escalationIndex}>Yr. {escalation.startYear || escalation.endYear} @ <CurrencyFormat value={escalation.yearlyRent} cents={false} /><br/></span>
                    }
                    else
                    {
                        return null;
                    }
                }),
                noValueText: "No Rent",
                size: 2
            },
            sizeOfUnit: {
                render: (value) => <AreaFormat value={value} />,
                noValueText: "No Size",
                size: 2
            },
            taxesMaintenanceInsurance: {
                render: (value) => <CurrencyFormat value={value} />,
                noValueText: "No TMI",
                size: 2
            },
            tenantInducements: {
                render: (value) => <span>{value}</span>,
                noValueText: "No Inducements",
                size: 2
            },
            freeRent: {
                render: (value) => <span>{value}</span>,
                noValueText: "No Free Rent",
                size: 2
            }
        };

        this.props.headers.forEach((headerFieldList) =>
        {
            headerFieldList.forEach((field) =>
            {
                if (!headerConfigurations[field])
                {
                    const message = `Error! No header configuration for ${field}`;
                    console.error(message);

                    if (process.env.VALUATE_ENVIRONMENT.REACT_APP_DEBUG)
                    {
                        alert(message);
                    }
                }
            })
        });

        return (
            <div className={`card b comparable-lease-list-item ${expandedClass} ${lastClass}`}>
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
                                        {
                                            this.props.headers.map((headerFieldList, headerIndex) =>
                                            {
                                                return <ComparableLeaseListItemHeaderColumn
                                                    key={headerIndex}
                                                    size={headerConfigurations[headerFieldList[0]].size}
                                                    renders={headerFieldList.map((field) => headerConfigurations[field].render)}
                                                    noValueTexts={headerFieldList.map((field) => headerConfigurations[field].noValueText)}
                                                    fields={headerFieldList}
                                                    comparableLease={this.props.comparableLease}/>
                                            })
                                        }
                                    </Row>
                                </CardTitle>
                            </CardHeader> : null
                    }
                    <Collapse isOpen={_.isUndefined(this.state.detailsOpen) ? this.state.openByDefault : this.state.detailsOpen}>
                        <div className={`card-body comparable-lease-list-item-body ${editableClass}`}>
                            {
                                    (comparableLease.address && comparableLease.address !== "") ?
                                        <UploadableImage
                                            editable={this.props.edit}
                                            value={`https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480&source=outdoor&location=${comparableLease.address}`}
                                            onChange={(newUrl) => this.changeComparableField('imageUrl', newUrl)}
                                        />
                                        : <UploadableImage  />
                            }

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

                                    <span className={"comparable-field-label"}>Sub Type:</span>

                                    <FieldDisplayEdit
                                        type={"tags"}
                                        edit={this.props.edit}
                                        placeholder={"Property Tags"}
                                        value={comparableLease.propertyTags}
                                        onChange={(newValue) => this.changeComparableField('propertyTags', newValue)}
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

                                    <div className={"escalation-list"}>
                                        {
                                            comparableLease.rentEscalations ? comparableLease.rentEscalations.map((escalation, escalationIndex) =>
                                            {
                                                return <div className={"escalation"} key={escalationIndex}>
                                                    From:
                                                    <FieldDisplayEdit
                                                        type={"number"}
                                                        hideIcon={true}
                                                        edit={this.props.edit}
                                                        placeholder={"Start Year"}
                                                        value={escalation.startYear}
                                                        onChange={(newValue) => this.changeEscalationField(escalation, 'startYear', newValue)}
                                                    />
                                                    To:
                                                    <FieldDisplayEdit
                                                        type={"number"}
                                                        hideIcon={true}
                                                        edit={this.props.edit}
                                                        placeholder={"End Year"}
                                                        value={escalation.endYear}
                                                        onChange={(newValue) => this.changeEscalationField(escalation, 'endYear', newValue)}
                                                    />
                                                    Rent:
                                                    <FieldDisplayEdit
                                                        type={"currency"}
                                                        hideIcon={true}
                                                        edit={this.props.edit}
                                                        placeholder={"Yearly Rent"}
                                                        value={escalation.yearlyRent}
                                                        onChange={(newValue) => this.changeEscalationField(escalation, 'yearlyRent', newValue)}
                                                    />
                                                    <Button color={"secondary"} onClick={() => this.removeEscalation(escalationIndex)}><i className={"fa fa-trash"} /></Button>
                                                </div>
                                            }) : null
                                        }

                                        <div className={"escalation"}>
                                            From:
                                            <FieldDisplayEdit
                                                type={"number"}
                                                hideIcon={true}
                                                edit={this.props.edit}
                                                placeholder={"Start Year"}
                                                onChange={(newValue) => this.createNewEscalation('startYear', newValue)}
                                            />
                                            To:
                                            <FieldDisplayEdit
                                                type={"number"}
                                                hideIcon={true}
                                                edit={this.props.edit}
                                                placeholder={"End Year"}
                                                onChange={(newValue) => this.createNewEscalation('endYear', newValue)}
                                            />
                                            Rent:
                                            <FieldDisplayEdit
                                                hideIcon={true}
                                                type={"currency"}
                                                edit={this.props.edit}
                                                placeholder={"Yearly Rent"}
                                                onChange={(newValue) => this.createNewEscalation('yearlyRent', newValue)}
                                            />
                                            <Button color={"secondary"} onClick={() => this.createNewEscalation('yearlyRent', 0)}><i className={"fa fa-plus"} /></Button>
                                        </div>
                                    </div>

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
                                    {
                                        comparableLease.propertyType === "office" ?
                                            [
                                                <span key={1} className={"comparable-field-label"}>Floor Number:</span>,

                                                <FieldDisplayEdit
                                                    key={2}
                                                    type={"number"}
                                                    edit={this.props.edit}
                                                    placeholder={"Floor Number"}
                                                    value={comparableLease.floorNumber}
                                                    onChange={(newValue) => this.changeComparableField('floorNumber', newValue)}
                                                />
                                            ] : null
                                    }
                                    {
                                        comparableLease.propertyType === "retail" ?
                                            [
                                                <span key={1} className={"comparable-field-label"}>Retail Location:</span>,

                                                <FieldDisplayEdit
                                                    key={2}
                                                    type={"retailLocationType"}
                                                    edit={this.props.edit}
                                                    placeholder={"Retail Location"}
                                                    value={comparableLease.retailLocationType}
                                                    onChange={(newValue) => this.changeComparableField('retailLocationType', newValue)}
                                                />
                                            ] : null
                                    }

                                    {
                                        comparableLease.propertyType === 'industrial' ?
                                            [
                                                <span className={"comparable-field-label"} key={1} >Clear Ceiling Height:</span>,
                                                <FieldDisplayEdit
                                                    key={2}
                                                    type={"length"}
                                                    edit={this.props.edit}
                                                    placeholder={"Clear Ceiling Height"}
                                                    value={comparableLease.clearCeilingHeight}
                                                    onChange={(newValue) => this.changeComparableField('clearCeilingHeight', newValue)}
                                                />,
                                                <span className={"comparable-field-label"} key={3} >Shipping Doors:</span>,
                                                <FieldDisplayEdit
                                                    key={4}
                                                    type={"number"}
                                                    edit={this.props.edit}
                                                    placeholder={"Shipping Doors"}
                                                    value={comparableLease.shippingDoors}
                                                    onChange={(newValue) => this.changeComparableField('shippingDoors', newValue)}
                                                />

                                            ] : null
                                    }

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

                                    <span className={"comparable-field-label"}>Remarks:</span>

                                    <FieldDisplayEdit
                                        type={"text"}
                                        edit={this.props.edit}
                                        placeholder={"Remarks"}
                                        value={comparableLease.remarks}
                                        onChange={(newValue) => this.changeComparableField('remarks', newValue)}
                                    />

                                    {/*<span className={"comparable-field-label"}>Description:</span>*/}

                                    {/*<FieldDisplayEdit*/}
                                        {/*type={"textbox"}*/}
                                        {/*edit={this.props.edit}*/}
                                        {/*placeholder={"Description..."}*/}
                                        {/*value={comparableLease.description}*/}
                                        {/*onChange={(newValue) => this.changeComparableField('description', newValue)}*/}
                                    {/*/>*/}
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