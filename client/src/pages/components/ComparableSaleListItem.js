import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Button, CardFooter, Collapse, CardHeader, CardTitle, Row, Col} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';
import axios from "axios/index";
import Datetime from 'react-datetime';
import PropertyTypeSelector from './PropertyTypeSelector';
import ComparableLeaseListItem from "./ComparableLeaseListItem";
import UploadableImage from "./UploadableImage";
import NumberFormat from 'react-number-format';

class ComparableSaleListItem extends React.Component
{
    static _newSale = Symbol('newSale');

    static defaultProps = {
        edit: true,
        detailsOpen: false
    };

    state = {
        comparableSale: {}
    };

    componentDidMount()
    {
        if (!this.props.comparableSale._id || this.props.openByDefault || this.props.comparableSale[ComparableSaleListItem._newSale])
        {
            this.setState({detailsOpen: true})
        }

        this.setState({
            comparableSale: this.props.comparableSale
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
            comparable[ComparableSaleListItem._newSale] = true;
            this.props.onChange(comparable);
        });
    }


    changeComparableField(field, newValue)
    {
        const comparable = this.state.comparableSale;

        comparable[field] = newValue;
        if (newValue)
        {
            comparable.calculateMissingNumbers();
        }

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


    defaultDescriptionText()
    {
        const comparableSale = this.props.comparableSale;


        let text = `In reference to the ${new Date(comparableSale.saleDate).getFullYear()}/${new Date(comparableSale.saleDate).getMonth()}/${new Date(comparableSale.saleDate).getDate()} sale of a ${comparableSale.propertyType} building located at ${comparableSale.address}. `;

        if (comparableSale.sizeSquareFootage)
        {
            text += `The building has gross rentable area of ${comparableSale.sizeSquareFootage}. `;
        }


        if(comparableSale.vendor && comparableSale.purchaser && comparableSale.salePrice)
        {
            text += `The property was sold by ${comparableSale.vendor} and was acquired by ${comparableSale.purchaser} for a consideration of $${comparableSale.salePrice}. `;
        }

        if(comparableSale.description)
        {
            text += comparableSale.description;
        }

        if(comparableSale.tenants)
        {
            text += `The property is leased to ${comparableSale.tenants}. `;
        }

        if(comparableSale.capitalizationRate)
        {
            text += `The net income of ${comparableSale.netOperatingIncome} yielded a ${comparableSale.capitalizationRate}% rate of return. `;
        }

        return text;
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
                                    <Col xs={1} className={"header-field-column"}>
                                        {
                                            comparableSale.saleDate ? <span>{new Date(comparableSale.saleDate).getMonth()} / {new Date(comparableSale.saleDate).getFullYear().toString().substr(2)}</span>
                                                : <span className={"no-data"}>No Sale Date</span>
                                        }
                                    </Col>
                                    <Col xs={3} className={"header-field-column"}>
                                        {comparableSale.address ? comparableSale.address : <span className={"no-data"}>No Address</span>}
                                    </Col>
                                    <Col className={"header-field-column middle-col"}>
                                        {comparableSale.sizeSquareFootage ? <NumberFormat
                                            value={comparableSale.sizeSquareFootage}
                                            displayType={'text'}
                                            thousandSeparator={', '}
                                            decimalScale={0}
                                            fixedDecimalScale={true}
                                        /> : <span className={"no-data"}>No Size</span>}
                                    </Col>
                                    <Col className={"header-field-column middle-col"}>
                                        {comparableSale.salePrice ? <span>$<NumberFormat
                                            value={comparableSale.salePrice}
                                            displayType={'text'}
                                            thousandSeparator={', '}
                                            decimalScale={0}
                                            fixedDecimalScale={true}
                                        /></span> : <span className={"no-data"}>No Price</span>}
                                    </Col>
                                    <Col xs={2} className={"header-field-column"}>
                                        {comparableSale.propertyType ? comparableSale.propertyType : <span className={"no-data"}>No Propery Type</span>}<br/>
                                        {comparableSale.propertyTags ? comparableSale.propertyTags.map((tag, tagIndex) => <span key={tag}>{tag}{tagIndex !== comparableSale.propertyTags.length ? ", " : null}</span>) : <span className={"no-data"}>No Sub Type</span>}
                                    </Col>
                                    <Col className={"header-field-column small-header-column middle-col"}>
                                        {comparableSale.capitalizationRate ? (comparableSale.capitalizationRate.toString() + "%") : <span className={"no-data"}>No Cap Rate</span>}
                                        <br/>
                                        {(comparableSale.salePrice && comparableSale.sizeSquareFootage) ?  "$" + (comparableSale.salePrice / comparableSale.sizeSquareFootage).toFixed(2) : <span className={"no-data"}>No PSF</span>}
                                    </Col>
                                </Row>
                            </CardTitle>
                        </CardHeader> : null
                    }
                    <Collapse isOpen={this.state.detailsOpen}>
                        <div className={`card-body comparable-sale-list-item-body ${editableClass}`}>
                            {
                                (comparableSale.address && comparableSale.address !== "") ?
                                    <UploadableImage value={`https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480&source=outdoor&location=${comparableSale.address}`} />
                                    : <UploadableImage  />
                            }
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

                                    <span className={"comparable-field-label"}>Sub Type:</span>

                                    <FieldDisplayEdit
                                        type={"tags"}
                                        edit={this.props.edit}
                                        placeholder={"Sub Type"}
                                        value={comparableSale.propertyTags}
                                        onChange={(newValue) => this.changeComparableField('propertyTags', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Building Size:</span>

                                    <FieldDisplayEdit
                                        type={"number"}
                                        edit={this.props.edit}
                                        placeholder={"Building Size"}
                                        value={comparableSale.sizeSquareFootage}
                                        onChange={(newValue) => this.changeComparableField('sizeSquareFootage', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Sale Price:</span>

                                    <FieldDisplayEdit
                                        type={"currency"}
                                        edit={this.props.edit}
                                        placeholder={"Sale Price"}
                                        value={comparableSale.salePrice}
                                        onChange={(newValue) => this.changeComparableField('salePrice', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>PPS:</span>

                                    <FieldDisplayEdit
                                        type={"currency"}
                                        edit={this.props.edit}
                                        placeholder={"Price Per Square Foot"}
                                        value={comparableSale.pricePerSquareFoot}
                                        onChange={(newValue) => this.changeComparableField('pricePerSquareFoot', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Cap Rate:</span>

                                    <FieldDisplayEdit
                                        type={"percent"}
                                        edit={this.props.edit}
                                        placeholder={"Capitalization Rate"}
                                        value={comparableSale.capitalizationRate}
                                        onChange={(newValue) => this.changeComparableField('capitalizationRate', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Sale Date:</span>

                                    <FieldDisplayEdit
                                        type={"date"}
                                        edit={this.props.edit}
                                        placeholder={"Sale Date"}
                                        value={comparableSale.saleDate}
                                        onChange={(newValue) => this.changeComparableField('saleDate', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Vendor:</span>

                                    <FieldDisplayEdit
                                        type={"text"}
                                        edit={this.props.edit}
                                        placeholder={"Vendor"}
                                        value={comparableSale.vendor}
                                        onChange={(newValue) => this.changeComparableField('vendor', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Purchaser:</span>

                                    <FieldDisplayEdit
                                        type={"text"}
                                        edit={this.props.edit}
                                        placeholder={"Purchaser"}
                                        value={comparableSale.purchaser}
                                        onChange={(newValue) => this.changeComparableField('purchaser', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>NOI: </span>

                                    <FieldDisplayEdit
                                        type={"currency"}
                                        edit={this.props.edit}
                                        placeholder={"Net Operating Income"}
                                        value={comparableSale.netOperatingIncome}
                                        onChange={(newValue) => this.changeComparableField('netOperatingIncome', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Occupancy Rate:</span>

                                    <FieldDisplayEdit
                                        type={"percent"}
                                        edit={this.props.edit}
                                        placeholder={"Occupancy Rate"}
                                        value={comparableSale.occupancyRate}
                                        onChange={(newValue) => this.changeComparableField('occupancyRate', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Tenants:</span>

                                    <FieldDisplayEdit
                                        type={"text"}
                                        edit={this.props.edit}
                                        placeholder={"Tenants"}
                                        value={comparableSale.tenants}
                                        onChange={(newValue) => this.changeComparableField('tenants', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Construction Date:</span>

                                    <FieldDisplayEdit
                                        type={"date"}
                                        edit={this.props.edit}
                                        placeholder={"Construction Date"}
                                        value={comparableSale.constructionDate}
                                        onChange={(newValue) => this.changeComparableField('constructionDate', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Site Area:</span>

                                    <FieldDisplayEdit
                                        type={"text"}
                                        edit={this.props.edit}
                                        placeholder={"Site Area"}
                                        value={comparableSale.siteArea}
                                        onChange={(newValue) => this.changeComparableField('siteArea', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Parking:</span>

                                    <FieldDisplayEdit
                                        type={"text"}
                                        edit={this.props.edit}
                                        placeholder={"Parking"}
                                        value={comparableSale.parking}
                                        onChange={(newValue) => this.changeComparableField('parking', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Additional Info:</span>

                                    <FieldDisplayEdit
                                        type={"text"}
                                        edit={this.props.edit}
                                        placeholder={"Additional Info"}
                                        value={comparableSale.additionalInfo}
                                        onChange={(newValue) => this.changeComparableField('additionalInfo', newValue)}
                                    />

                                    <span className={"comparable-field-label"}>Description:</span>

                                    <FieldDisplayEdit
                                        type={"textbox"}
                                        edit={this.props.edit}
                                        placeholder={"Description..."}
                                        value={comparableSale.description ? comparableSale.description : this.defaultDescriptionText()}
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