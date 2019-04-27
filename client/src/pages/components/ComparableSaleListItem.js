import React from 'react';
import { Button, Collapse, CardHeader, CardTitle, Row, Col} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import axios from "axios/index";
import UploadableImage from "./UploadableImage";
import NumberFormat from 'react-number-format';

class ComparableSaleListItem extends React.Component
{
    static _newSale = Symbol('newSale');

    static defaultProps = {
        edit: true,
        detailsOpen: false,
        showPropertyTypeInHeader: true
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
            this.props.onChange(comparable);
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

    isCompWithinAppraisal()
    {
        if (!this.state.comparableSale._id)
        {
            return false;
        }
        const id = this.state.comparableSale._id;

        if (!this.props.appraisal.comparableSalesCapRate)
        {
            return false;
        }
        else
        {
            for (let i = 0; i < this.props.appraisal.comparableSalesCapRate.length; i += 1)
            {
                if (this.props.appraisal.comparableSalesCapRate[i] === id)
                {
                    return true;
                }
            }
        }

        if (!this.props.appraisal.comparableSalesDCA)
        {
            return false;
        }
        else
        {
            for (let i = 0; i < this.props.appraisal.comparableSalesDCA.length; i += 1)
            {
                if (this.props.appraisal.comparableSalesDCA[i] === id)
                {
                    return true;
                }
            }
        }
        return false;
    }

    isCompWithinDCA()
    {
        if (!this.state.comparableSale._id)
        {
            return false;
        }
        const id = this.state.comparableSale._id;

        if (!this.props.appraisal.comparableSalesDCA)
        {
            return false;
        }
        else
        {
            for (let i = 0; i < this.props.appraisal.comparableSalesDCA.length; i += 1)
            {
                if (this.props.appraisal.comparableSalesDCA[i] === id)
                {
                    return true;
                }
            }
        }
        return false;
    }

    isCompWithinCapRate()
    {
        if (!this.state.comparableSale._id)
        {
            return false;
        }
        const id = this.state.comparableSale._id;

        if (!this.props.appraisal.comparableSalesCapRate)
        {
            return false;
        }
        else
        {
            for (let i = 0; i < this.props.appraisal.comparableSalesCapRate.length; i += 1)
            {
                if (this.props.appraisal.comparableSalesCapRate[i] === id)
                {
                    return true;
                }
            }
        }
    }

    toggleDetails()
    {
        this.setState({detailsOpen: !this.state.detailsOpen});
    }


    defaultDescriptionText()
    {
        const comparableSale = this.props.comparableSale;

        let text = '';

        if (comparableSale.saleDate && comparableSale.propertyType && comparableSale.address)
        {
            text += `In reference to the ${comparableSale.saleDate.getFullYear()}/${comparableSale.saleDate.getMonth() + 1}/${comparableSale.saleDate.getDate()} sale of a ${comparableSale.propertyType} building located at ${comparableSale.address}. `;
        }

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

        const expandedClass = this.state.detailsOpen ? "expanded" : "";

        const lastClass = this.props.last ? "last" : "";

        return (
            <div className={`card b comparable-sale-list-item ${expandedClass} ${lastClass}`}>
                <div className={"comparable-sale-list-item-button-column"}>
                    {
                        this.props.onRemoveComparableClicked && this.isCompWithinAppraisal() ?
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
                        this.props.onAddComparableClicked && !this.isCompWithinAppraisal() ?
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
                                            comparableSale.saleDate ? <span>{new Date(comparableSale.saleDate).getMonth() + 1} / {new Date(comparableSale.saleDate).getFullYear().toString().substr(2)}</span>
                                                : <span className={"no-data"}>No Sale Date</span>
                                        }
                                    </Col>
                                    <Col xs={3} className={"header-field-column"}>
                                        {comparableSale.address ? comparableSale.address : <span className={"no-data"}>No Address</span>}
                                    </Col>
                                    {
                                        this.props.appraisal.propertyType !== "land" ? <Col className={"header-field-column middle-col"}>
                                            {comparableSale.sizeSquareFootage ? <NumberFormat
                                                value={comparableSale.sizeSquareFootage}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={0}
                                                fixedDecimalScale={true}
                                            /> : <span className={"no-data"}>No Size</span>}
                                        </Col> : null
                                    }
                                    {
                                        this.props.appraisal.propertyType === "land" ? <Col className={"header-field-column middle-col"}>
                                            {comparableSale.sizeOfLandAcres ? <NumberFormat
                                                value={comparableSale.sizeOfLandAcres}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            /> : <span className={"no-data"}>No Size</span>}
                                            <br/>
                                            {comparableSale.sizeOfBuildableAreaSqft ? <NumberFormat
                                                value={comparableSale.sizeOfBuildableAreaSqft}
                                                displayType={'text'}
                                                thousandSeparator={', '}
                                                decimalScale={0}
                                                fixedDecimalScale={true}
                                            /> : <span className={"no-data"}>No Buildable Area</span>}

                                        </Col> : null
                                    }
                                    <Col className={"header-field-column middle-col"}>
                                        {comparableSale.salePrice ? <span>$<NumberFormat
                                            value={comparableSale.salePrice}
                                            displayType={'text'}
                                            thousandSeparator={', '}
                                            decimalScale={0}
                                            fixedDecimalScale={true}
                                        /></span> : <span className={"no-data"}>No Price</span>}
                                    </Col>
                                    {
                                        this.props.showPropertyTypeInHeader ?
                                            <Col xs={2} className={"header-field-column"}>
                                                {comparableSale.propertyType ? comparableSale.propertyType : <span className={"no-data"}>No Propery Type</span>}<br/>
                                                {comparableSale.propertyTags ? comparableSale.propertyTags.map((tag, tagIndex) => <span key={tag}>{tag}{tagIndex !== comparableSale.propertyTags.length ? ", " : null}</span>) : <span className={"no-data"}>No Sub Type</span>}
                                            </Col> : null
                                    }
                                    {
                                        this.props.appraisal.propertyType !== 'land' ? this.props.showPropertyTypeInHeader ?
                                            <Col className={"header-field-column small-header-column middle-col"}>
                                                {comparableSale.capitalizationRate ? (comparableSale.capitalizationRate.toString() + "%") : <span className={"no-data"}>No Cap Rate</span>}
                                                <br/>
                                                {(comparableSale.salePrice && comparableSale.sizeSquareFootage) ?  "$" + (comparableSale.salePrice / comparableSale.sizeSquareFootage).toFixed(2) : <span className={"no-data"}>No PSF</span>}
                                            </Col> : [
                                                <Col key={1} className={"header-field-column small-header-column middle-col"}>
                                                    {comparableSale.capitalizationRate ? (comparableSale.capitalizationRate.toString() + "%") : <span className={"no-data"}>No Cap Rate</span>}
                                                </Col>,
                                                <Col key={2} className={"header-field-column small-header-column middle-col"}>
                                                    {(comparableSale.salePrice && comparableSale.sizeSquareFootage) ?  "$" + (comparableSale.salePrice / comparableSale.sizeSquareFootage).toFixed(2) : <span className={"no-data"}>No PSF</span>}
                                                </Col>
                                            ] : null
                                    }
                                    {
                                        this.props.appraisal.propertyType === 'land' ? this.props.showPropertyTypeInHeader ?
                                            <Col className={"header-field-column small-header-column middle-col"}>
                                                {comparableSale.pricePerAcreLand ? ("$" + comparableSale.pricePerAcreLand.toFixed(2)) : <span className={"no-data"}>No PPA</span>}
                                                <br/>
                                                {(comparableSale.pricePerSquareFootBuildableArea) ?  "$" + (comparableSale.pricePerSquareFootBuildableArea).toFixed(2) : <span className={"no-data"}>No Buildable PSF</span>}
                                            </Col> : [
                                                <Col key={1} className={"header-field-column small-header-column middle-col"}>
                                                    {comparableSale.pricePerAcreLand ? ("$" + comparableSale.pricePerAcreLand.toFixed(2)) : <span className={"no-data"}>No PPA</span>}
                                                </Col>,
                                                <Col key={2} className={"header-field-column small-header-column middle-col"}>
                                                    {(comparableSale.pricePerSquareFootBuildableArea) ?  "$" + (comparableSale.pricePerSquareFootBuildableArea).toFixed(2) : <span className={"no-data"}>No Buildable PSF</span>}
                                                </Col>
                                            ] : null
                                    }
                                </Row>
                            </CardTitle>
                        </CardHeader> : null
                    }
                    <Collapse isOpen={this.state.detailsOpen}>
                        <div className={`card-body comparable-sale-list-item-body ${editableClass}`}>
                                <div className={"comparable-sale-list-item-left-column"}>
                                    {
                                    (comparableSale.imageUrl) ?
                                    <UploadableImage
                                        editable={this.props.edit}
                                        value={comparableSale.imageUrl}
                                        onChange={(newUrl) => this.changeComparableField('imageUrl', newUrl)} />
                                    :
                                    (comparableSale.address && comparableSale.address !== "") ?
                                    <UploadableImage
                                        editable={this.props.edit}
                                        value={`https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480&source=outdoor&location=${comparableSale.address}`}
                                        onChange={(newUrl) => this.changeComparableField('imageUrl', newUrl)}
                                    />
                                    : <UploadableImage  />
                                    }
                                    {
                                        this.props.onRemoveDCAClicked ? <div className={"comparable-list-boxes"}>
                                            <span>Include in Direct Comparison&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            <FieldDisplayEdit
                                                type={"boolean"}
                                                hideIcon={true}
                                                value={this.isCompWithinDCA()}
                                                onChange={() => this.isCompWithinDCA() ? this.props.onRemoveDCAClicked(comparableSale) : this.props.onAddDCAClicked(comparableSale)}
                                            />
                                        </div> : null
                                    }
                                    {
                                        this.props.onRemoveCapRateClicked ? <div className={"comparable-list-boxes"}>
                                            <span>Include in Capitalization Approach</span>
                                            <FieldDisplayEdit
                                                type={"boolean"}
                                                hideIcon={true}
                                                value={this.isCompWithinCapRate()}
                                                onChange={() => this.isCompWithinCapRate() ? this.props.onRemoveCapRateClicked(comparableSale) : this.props.onAddCapRateClicked(comparableSale)}
                                            />
                                        </div> : null
                                    }


                                </div>
                            <div className={`comparable-sale-content`}>
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

                                    <h4 className={"group-heading"}>Sales Information</h4>
                                    <span className={"group-heading"}></span>

                                    <span className={"comparable-field-label"}>Sale Price:</span>

                                    <FieldDisplayEdit
                                        type={"currency"}
                                        edit={this.props.edit}
                                        placeholder={"Sale Price"}
                                        value={comparableSale.salePrice}
                                        onChange={(newValue) => this.changeComparableField('salePrice', newValue)}
                                    />


                                    {
                                        comparableSale.propertyType !== "land" ? [
                                            <span key={1} className={"comparable-field-label"}>Cap Rate:</span>,

                                            <FieldDisplayEdit
                                                key={2}
                                                type={"percent"}
                                                edit={this.props.edit}
                                                placeholder={"Capitalization Rate"}
                                                value={comparableSale.capitalizationRate}
                                                onChange={(newValue) => this.changeComparableField('capitalizationRate', newValue)}
                                            />
                                        ] : null
                                    }

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



                                    {
                                        comparableSale.propertyType !== "land" ? [
                                            <span key={1} className={"comparable-field-label"}>NOI: </span>,

                                            <FieldDisplayEdit
                                                key={2}
                                                type={"currency"}
                                                edit={this.props.edit}
                                                placeholder={"Net Operating Income"}
                                                value={comparableSale.netOperatingIncome}
                                                onChange={(newValue) => this.changeComparableField('netOperatingIncome', newValue)}
                                            />
                                        ] : null
                                    }

                                    {
                                        comparableSale.propertyType !== "land" ? [
                                            <span key={1} className={"comparable-field-label"}>Price Per Square Foot:</span>,

                                            <FieldDisplayEdit
                                                key={2}
                                                type={"currency"}
                                                edit={this.props.edit}
                                                placeholder={"Price Per Square Foot"}
                                                value={comparableSale.pricePerSquareFoot}
                                                onChange={(newValue) => this.changeComparableField('pricePerSquareFoot', newValue)}
                                            />
                                        ] : null
                                    }


                                    {
                                        comparableSale.propertyType === 'land' ?
                                            <h4 className={"group-heading"}>Property Information</h4>
                                            : <h4 className={"group-heading"}>Building Information</h4>
                                    }

                                    {
                                        comparableSale.propertyType !== "land" ? [
                                            <span key={1} className={"comparable-field-label"}>Building Size:</span>,

                                            <FieldDisplayEdit
                                                key={2}
                                                type={"area"}
                                                edit={this.props.edit}
                                                placeholder={"Building Size"}
                                                value={comparableSale.sizeSquareFootage}
                                                onChange={(newValue) => this.changeComparableField('sizeSquareFootage', newValue)}
                                            />
                                        ] : null
                                    }

                                    {
                                        comparableSale.propertyType !== "land" ? [

                                            <span key={1} className={"comparable-field-label"}>Construction Date:</span>,
                                            <FieldDisplayEdit
                                                key={2}
                                                type={"date"}
                                                edit={this.props.edit}
                                                placeholder={"Construction Date"}
                                                value={comparableSale.constructionDate}
                                                onChange={(newValue) => this.changeComparableField('constructionDate', newValue)}
                                                />
                                        ] : null
                                    }
                                    {
                                        comparableSale.propertyType !== "land" ? [
                                            <span key={1} className={"comparable-field-label"}>Site Area:</span>,
                                            <FieldDisplayEdit
                                                key={2}
                                                type={"text"}
                                                edit={this.props.edit}
                                                placeholder={"Site Area"}
                                                value={comparableSale.siteArea}
                                                onChange={(newValue) => this.changeComparableField('siteArea', newValue)}
                                            />
                                        ] : null
                                    }


                                    {
                                        comparableSale.propertyType === 'industrial' ?
                                            [
                                                <span className={"comparable-field-label"} key={5} >Site Coverage:</span>,
                                                <FieldDisplayEdit
                                                    key={6}
                                                    type={"percent"}
                                                    edit={this.props.edit}
                                                    placeholder={"Site Coverage"}
                                                    value={comparableSale.siteCoverage}
                                                    onChange={(newValue) => this.changeComparableField('siteCoverage', newValue)}
                                                />

                                            ] : null
                                    }

                                    {
                                        comparableSale.propertyType !== "land" ? [
                                            <span key={1} className={"comparable-field-label"}>Occupancy Rate:</span>,

                                            <FieldDisplayEdit
                                                key={2}
                                                type={"percent"}
                                                edit={this.props.edit}
                                                placeholder={"Occupancy Rate"}
                                                value={comparableSale.occupancyRate}
                                                onChange={(newValue) => this.changeComparableField('occupancyRate', newValue)}
                                            />
                                        ] : null
                                    }

                                    {
                                        comparableSale.propertyType === 'industrial' ?
                                        [
                                            <span className={"comparable-field-label"} key={1} >Clear Ceiling Height:</span>,
                                            <FieldDisplayEdit
                                                key={2}
                                                type={"length"}
                                                edit={this.props.edit}
                                                placeholder={"Clear Ceiling Height"}
                                                value={comparableSale.clearCeilingHeight}
                                                onChange={(newValue) => this.changeComparableField('clearCeilingHeight', newValue)}
                                            />,
                                            <span className={"comparable-field-label"} key={3} >Finished Office Percentage:</span>,
                                            <FieldDisplayEdit
                                                key={4}
                                                type={"percent"}
                                                edit={this.props.edit}
                                                placeholder={"Finished Office Percent"}
                                                value={comparableSale.finishedOfficePercent}
                                                onChange={(newValue) => this.changeComparableField('finishedOfficePercent', newValue)}
                                            />,
                                            <span className={"comparable-field-label"} key={5} >Shipping Doors:</span>,
                                            <FieldDisplayEdit
                                                key={6}
                                                type={"number"}
                                                edit={this.props.edit}
                                                placeholder={"Shipping Doors"}
                                                value={comparableSale.shippingDoors}
                                                onChange={(newValue) => this.changeComparableField('shippingDoors', newValue)}
                                            />

                                        ] : null
                                    }

                                    {
                                        comparableSale.propertyType === 'land' ?
                                            [
                                                <span className={"comparable-field-label"} key={1}>Zoning:</span>,
                                                <FieldDisplayEdit
                                                    key={2}
                                                    type={"zone"}
                                                    edit={this.props.edit}
                                                    placeholder={"Zoning"}
                                                    value={comparableSale.zoning}
                                                    onChange={(newValue) => this.changeComparableField('zoning', newValue)}
                                                />,
                                                <span className={"comparable-field-label"} key={3}>Development Proposals:</span>,
                                                <FieldDisplayEdit
                                                    key={4}
                                                    type={"text"}
                                                    edit={this.props.edit}
                                                    placeholder={"Development Proposals"}
                                                    value={comparableSale.developmentProposals}
                                                    onChange={(newValue) => this.changeComparableField('developmentProposals', newValue)}
                                                />,
                                                <span className={"comparable-field-label"} key={5}>Size of Land (sqft):</span>,
                                                <FieldDisplayEdit
                                                    key={6}
                                                    type={"area"}
                                                    edit={this.props.edit}
                                                    placeholder={"Size of Land"}
                                                    value={comparableSale.sizeOfLandSqft}
                                                    onChange={(newValue) => this.changeComparableField('sizeOfLandSqft', newValue)}
                                                />,
                                                <span className={"comparable-field-label"} key={7}>Size of Land (acres):</span>,
                                                <FieldDisplayEdit
                                                    key={8}
                                                    type={"acres"}
                                                    edit={this.props.edit}
                                                    placeholder={"Size of Land"}
                                                    value={comparableSale.sizeOfLandAcres}
                                                    onChange={(newValue) => this.changeComparableField('sizeOfLandAcres', newValue)}
                                                />,
                                                <span className={"comparable-field-label"} key={9}>Buildable Area (sqft):</span>,
                                                <FieldDisplayEdit
                                                    key={10}
                                                    type={"area"}
                                                    edit={this.props.edit}
                                                    placeholder={"Size of Buildable Area"}
                                                    value={comparableSale.sizeOfBuildableAreaSqft}
                                                    onChange={(newValue) => this.changeComparableField('sizeOfBuildableAreaSqft', newValue)}
                                                />,
                                                <span className={"comparable-field-label"} key={10}>Buildable Units:</span>,
                                                <FieldDisplayEdit
                                                    key={11}
                                                    type={"number"}
                                                    edit={this.props.edit}
                                                    placeholder={"Buildable Units"}
                                                    value={comparableSale.buildableUnits}
                                                    onChange={(newValue) => this.changeComparableField('buildableUnits', newValue)}
                                                />,
                                            ] : null
                                    }
                                    {
                                        comparableSale.propertyType === 'land' ?
                                            [
                                                <h4 className={"group-heading"}>Stats</h4>,
                                                <span className={"group-heading"}></span>,
                                                <span className={"comparable-field-label"} key={13} >Price per Square Foot of Land:</span>,
                                                <FieldDisplayEdit
                                                    key={14}
                                                    type={"currency"}
                                                    edit={this.props.edit}
                                                    placeholder={"PSF of Land"}
                                                    value={comparableSale.pricePerSquareFootLand}
                                                    onChange={(newValue) => this.changeComparableField('pricePerSquareFootLand', newValue)}
                                                />,
                                                <span className={"comparable-field-label"} key={15} >Price per Acre of Land:</span>,
                                                <FieldDisplayEdit
                                                    key={16}
                                                    type={"currency"}
                                                    edit={this.props.edit}
                                                    placeholder={"Price Per Acre of Land"}
                                                    value={comparableSale.pricePerAcreLand}
                                                    onChange={(newValue) => this.changeComparableField('pricePerAcreLand', newValue)}
                                                />,
                                                <span className={"comparable-field-label"} key={17} >Price per Square Foot of Buildable Area:</span>,
                                                <FieldDisplayEdit
                                                    key={18}
                                                    type={"currency"}
                                                    edit={this.props.edit}
                                                    placeholder={"PSF of Buildable Area"}
                                                    value={comparableSale.pricePerSquareFootBuildableArea}
                                                    onChange={(newValue) => this.changeComparableField('pricePerSquareFootBuildableArea', newValue)}
                                                />,
                                                <span className={"comparable-field-label"} key={19} >Price per Acre of Buildable Area:</span>,
                                                <FieldDisplayEdit
                                                    key={20}
                                                    type={"currency"}
                                                    edit={this.props.edit}
                                                    placeholder={"Price Per Acre of Buildable Area"}
                                                    value={comparableSale.pricePerAcreBuildableArea}
                                                    onChange={(newValue) => this.changeComparableField('pricePerAcreBuildableArea', newValue)}
                                                />,
                                                <span className={"comparable-field-label"} key={21} >Price per Buildable Unit:</span>,
                                                <FieldDisplayEdit
                                                    key={22}
                                                    type={"currency"}
                                                    edit={this.props.edit}
                                                    placeholder={"Price Per Buildable Unit"}
                                                    value={comparableSale.pricePerBuildableUnit}
                                                    onChange={(newValue) => this.changeComparableField('pricePerBuildableUnit', newValue)}
                                                />,
                                                <span className={"comparable-field-label"} key={23} >Floor Space Index:</span>,
                                                <FieldDisplayEdit
                                                    key={24}
                                                    type={"float"}
                                                    edit={this.props.edit}
                                                    placeholder={"Floor Space Index"}
                                                    value={comparableSale.floorSpaceIndex}
                                                    onChange={(newValue) => this.changeComparableField('floorSpaceIndex', newValue)}
                                                />
                                            ] : null
                                    }

                                    {
                                        comparableSale.propertyType !== "land" ? [
                                            <span key={1} className={"comparable-field-label"}>Tenants:</span>,

                                            <FieldDisplayEdit
                                                type={"text"}
                                                key={2}
                                                edit={this.props.edit}
                                                placeholder={"Tenants"}
                                                value={comparableSale.tenants}
                                                onChange={(newValue) => this.changeComparableField('tenants', newValue)}
                                            />
                                        ] : null
                                    }

                                    {
                                        comparableSale.propertyType !== "land" ? [
                                            <span key={1} className={"comparable-field-label"}>Parking:</span>,
                                            <FieldDisplayEdit
                                                key={2}
                                                type={"text"}
                                                edit={this.props.edit}
                                                placeholder={"Parking"}
                                                value={comparableSale.parking}
                                                onChange={(newValue) => this.changeComparableField('parking', newValue)}
                                            />
                                        ] : null
                                    }

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