import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Button, CardFooter, Collapse, CardHeader, CardTitle, Row, Col} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';
import axios from "axios/index";
import Datetime from 'react-datetime';
import PropertyTypeSelector from './PropertyTypeSelector';

class ComparableSaleListItem extends React.Component
{
    static defaultProps = {
        edit: true,
        detailsOpen: false
    };

    state = {
        comparableSale: {}
    };

    componentDidMount()
    {
        if (!this.props.comparableSale._id || this.props.openByDefault)
        {
            this.setState({detailsOpen: true})
        }

        this.setState({
            comparableSale: _.clone(this.props.comparableSale)
        })
    }

    saveComparable(updatedComparable)
    {
        axios.post(`/comparable_sales/` + this.state.comparableSale._id, updatedComparable).then((response) => {
            // console.log(response.data.comparableSales);
            // this.setState({comparableSales: response.data.comparableSales})
        });
    }

    createNewComparable(newComparable)
    {
        axios.post(`/comparable_sales`, newComparable).then((response) =>
        {
            const comparable = this.state.comparableSale;
            comparable["_id"] = response.data._id;
            this.props.onChange(comparable);
        });
    }


    changeComparableField(field, newValue)
    {
        const comparable = this.state.comparableSale;

        comparable[field] = newValue;

        if (this.state.comparableSale._id)
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
        this.props.onDeleteComparable(this.state.comparableSale);

        axios.delete(`/comparable_sales/` + this.state.comparableSale._id).then((response) => {
            // console.log(response.data.comparableSales);
            // this.setState({comparableSales: response.data.comparableSales})
        });
    }

    isCompWithinAppraisal(appraisalComparables)
    {
        if (!this.state.comparableSale._id)
        {
            return false;
        }
        if (!appraisalComparables)
        {
            return false;
        }

        const id = this.state.comparableSale._id;

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
        const comparableSale = this.state.comparableSale;

        const editableClass = this.props.edit ? "editable" : "non-editable";

        return (
            <div className={`card b comparable-sale-list-item`}>
                <div className={"comparable-sale-list-item-button-column"}>
                    {
                        this.props.onRemoveComparableClicked && this.isCompWithinAppraisal(this.props.appraisalComparables) ?
                            <div className={`comparable-button-row`}>
                                <Button color={"primary"} onClick={(evt) => this.props.onRemoveComparableClicked(comparableSale)} className={"move-comparable-button"}>
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
                                <Button color={"primary"} onClick={(evt) => this.props.onAddComparableClicked(comparableSale)} className={"move-comparable-button"}>
                                    <i className={"fa fa-square"} />
                                </Button>
                                <Button color={"danger"} onClick={(evt) => this.deleteComparable()} className={"delete-comparable-button " + (this.state.detailsOpen ? "" : "hidden")}>
                                    <i className={"fa fa-trash-alt"} />
                                </Button>
                            </div> : null
                    }
                </div>
                <div className={"comparable-sale-item-content"}>
                    {
                        comparableSale._id && !this.props.openByDefault ?
                        <CardHeader onClick={() => this.toggleDetails()} className={"comparable-sale-list-item-header"}>
                            <CardTitle>
                                <Row>
                                    <Col xs={2} className={"header-field-column"}>
                                        {
                                            comparableSale.saleDate ? <span>{new Date(comparableSale.saleDate.$date).getMonth()} / {new Date(comparableSale.saleDate.$date).getFullYear().toString().substr(2)}</span>
                                                : <span className={"no-data"}>No Sale Date</span>
                                        }
                                    </Col>
                                    <Col xs={4} className={"header-field-column"}>
                                        {comparableSale.address ? comparableSale.address : <span className={"no-data"}>No Address</span>}
                                    </Col>
                                    <Col xs={2} className={"header-field-column"}>
                                        {comparableSale.salePrice ? comparableSale.salePrice : <span className={"no-data"}>No Price</span>}
                                    </Col>
                                    <Col xs={2} className={"header-field-column"}>
                                        {comparableSale.description ? comparableSale.description : <span className={"no-data"}>No Description</span>}
                                    </Col>
                                    <Col xs={2} className={"header-field-column"}>
                                        {comparableSale.capitalizationRate ? comparableSale.capitalizationRate : <span className={"no-data"}>No Cap Rate</span>}
                                    </Col>
                                </Row>
                            </CardTitle>
                        </CardHeader> : null
                    }
                    <Collapse isOpen={this.state.detailsOpen}>
                        <div className={`card-body comparable-sale-list-item-body ${editableClass}`}>
                            <div className={`building-image`}>
                                <div className={"building-image-wrapper"}>
                                    <a href="">
                                        {
                                            (comparableSale.address && comparableSale.address !== "")?
                                                <img className="img-fluid img-thumbnail" src={`https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I  &size=640x480&source=outdoor&location=${comparableSale.address}`} alt="Demo"/>
                                                : <img className="img-fluid img-thumbnail" src="/img/no_building_image.png" alt="Demo"/>

                                        }
                                    </a>
                                    <div className={"upload-image-overlay"} />
                                    <div className={"upload-image-icon"}>
                                        <i className={"fa fa-upload"} />
                                    </div>
                                </div>
                            </div>
                            <div className={`comparable-sale-content`}>
                                <FieldDisplayEdit
                                    type={"text"}
                                    edit={this.props.edit}
                                    placeholder={"Name..."}
                                    className={"comparable-name"}
                                    value={comparableSale.name}
                                    onChange={(newValue) => this.changeComparableField('name', newValue)}
                                />
                                <div className={"comparable-fields-area"}>
                                    <span className={"comparable-field-label"}>Address:</span>

                                    <FieldDisplayEdit
                                        type={"address"}
                                        edit={this.props.edit}
                                        placeholder={"Address"}
                                        value={comparableSale.address}
                                        onChange={(newValue) => this.changeComparableField('address', newValue)}
                                        onGeoChange={(newValue) => this.changeComparableField('location', {"type": "Point", "coordinates": [newValue.lng, newValue.lat]})}
                                    />

                                    <span className={"comparable-field-label"}>Property Type:</span>

                                    <FieldDisplayEdit
                                        type={"propertyType"}
                                        edit={this.props.edit}
                                        placeholder={"Property Type"}
                                        value={comparableSale.propertyType}
                                        onChange={(newValue) => this.changeComparableField('propertyType', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>NOI: </span>

                                    <FieldDisplayEdit
                                        type={"currency"}
                                        edit={this.props.edit}
                                        placeholder={"Net Operating Income"}
                                        value={comparableSale.netOperatingIncome}
                                        onChange={(newValue) => this.changeComparableField('netOperatingIncome', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>TMI (psf):</span>

                                    <FieldDisplayEdit
                                        type={"currency"}
                                        edit={this.props.edit}
                                        placeholder={"Taxes Maintenance Insurance (psf)"}
                                        value={comparableSale.taxesMaintenanceInsurancePSF}
                                        onChange={(newValue) => this.changeComparableField('taxesMaintenanceInsurancePSF', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Sale Price:</span>

                                    <FieldDisplayEdit
                                        type={"currency"}
                                        edit={this.props.edit}
                                        placeholder={"Sale Price"}
                                        value={comparableSale.salePrice}
                                        onChange={(newValue) => this.changeComparableField('salePrice', newValue)}
                                    />
                                    <span className={"comparable-field-label"}>Sale Date:</span>

                                    <FieldDisplayEdit
                                        type={"date"}
                                        edit={this.props.edit}
                                        placeholder={"Sale Date"}
                                        value={comparableSale.saleDate}
                                        onChange={(newValue) => this.changeComparableField('saleDate', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Vacancy Rate:</span>

                                    <FieldDisplayEdit
                                        type={"number"}
                                        edit={this.props.edit}
                                        placeholder={"Vacancy Rate"}
                                        value={comparableSale.vacancyRate}
                                        onChange={(newValue) => this.changeComparableField('vacancyRate', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Cap Rate:</span>

                                    <FieldDisplayEdit
                                        type={"number"}
                                        edit={this.props.edit}
                                        placeholder={"Capitalization Rate"}
                                        value={comparableSale.capitalizationRate}
                                        onChange={(newValue) => this.changeComparableField('capitalizationRate', newValue)}
                                    />
                                    <span className={"comparable-field-label"}>Description:</span>

                                    <FieldDisplayEdit
                                        type={"textbox"}
                                        edit={this.props.edit}
                                        placeholder={"Description..."}
                                        value={comparableSale.description}
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


export default ComparableSaleListItem;