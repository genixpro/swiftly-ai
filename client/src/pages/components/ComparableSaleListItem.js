import React from 'react';
import { Button, Collapse, CardHeader, CardTitle, Row, Col, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import axios from "axios/index";
import UploadableImageSet from "./UploadableImageSet";
import NumberFormat from 'react-number-format';
import PropTypes from "prop-types";
import ComparableSaleModel from "../../models/ComparableSaleModel";
import AppraisalModel from "../../models/AppraisalModel";
import _ from 'underscore';
import GoogleMapReact from 'google-map-react';
import CurrencyFormat from "./CurrencyFormat";
import PercentFormat from "./PercentFormat";
import FloatFormat from "./FloatFormat";
import IntegerFormat from "./IntegerFormat";
import ComparableLeaseListItem from "./ComparableLeaseListItem";
import Auth from "../../Auth";


class ComparableSaleListItemField extends React.Component
{
    static propTypes = {
        title: PropTypes.string.isRequired,
        field: PropTypes.string.isRequired,
        fieldType: PropTypes.string.isRequired,
        edit: PropTypes.bool.isRequired,
        cents: PropTypes.bool.isRequired,
        propertyType: PropTypes.string,
        excludedPropertyType: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        comparableSale: PropTypes.instanceOf(ComparableSaleModel).isRequired
    };

    render()
    {
        if (this.props.propertyType && this.props.comparableSale.propertyType !== this.props.propertyType)
        {
            return null;
        }

        if (this.props.excludedPropertyType && this.props.comparableSale.propertyType === this.props.excludedPropertyType)
        {
            return null;
        }

        return [
            <span key={1} className={"comparable-field-label"}>{this.props.title}:</span>,

            <FieldDisplayEdit
                key={2}
                type={this.props.fieldType}
                edit={this.props.edit}
                cents={this.props.cents}
                placeholder={this.props.placeholder || this.props.title}
                value={this.props.comparableSale[this.props.field]}
                propertyType={this.props.comparableSale.propertyType}
                onChange={(newValue) => this.props.onChange(this.props.field, newValue)}
                onGeoChange={(newValue) => this.props.onChange('location', {"type": "Point", "coordinates": [newValue.lng, newValue.lat]})}
            />
        ]
    }
}


class ComparableSaleListItemHeaderColumn extends React.Component
{
    static propTypes = {
        size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        renders: PropTypes.arrayOf(PropTypes.func).isRequired,
        noValueTexts: PropTypes.arrayOf(PropTypes.string).isRequired,
        fields: PropTypes.arrayOf(PropTypes.string).isRequired,
        comparableSale: PropTypes.instanceOf(ComparableSaleModel).isRequired,
        spacers: PropTypes.arrayOf(PropTypes.object)
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
                    return this.props.comparableSale[field] && !(_.isArray(this.props.comparableSale[field]) && this.props.comparableSale[field].length === 0)
                        ? <span>
                            {
                                this.props.renders[fieldIndex](this.props.comparableSale[field])
                            }
                            {fieldIndex !== this.props.fields.length - 1 ?
                                (!_.isUndefined(this.props.spacers[fieldIndex]) ? this.props.spacers[fieldIndex] : <br />)
                                    : null}
                            </span>
                        : <span className={"no-data"}>
                            <span>{!_.isUndefined(this.props.noValueTexts[fieldIndex]) ? this.props.noValueTexts[fieldIndex] : "n/a"}</span>
                            {fieldIndex !== this.props.fields.length - 1 ? (!_.isUndefined(this.props.spacers[fieldIndex]) ? "" : <br />) : null}
                        </span>
                })
            }

        </Col>
    }
}

class ComparableSaleListItem extends React.Component
{
    static _newSale = Symbol('newSale');

    static defaultProps = {
        edit: true,
        openByDefault: false,
        showPropertyTypeInHeader: true,
        last: false
    };

    static propTypes = {
        edit: PropTypes.bool,
        openByDefault: PropTypes.bool,
        showPropertyTypeInHeader: PropTypes.bool,
        last: PropTypes.bool,

        headers: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),

        comparableSale: PropTypes.instanceOf(ComparableSaleModel).isRequired,
        appraisal: PropTypes.instanceOf(AppraisalModel).isRequired,

        onChange: PropTypes.func,
        onDeleteComparable: PropTypes.func,
        onAddCapRateClicked: PropTypes.func,
        onRemoveCapRateClicked: PropTypes.func,
        onRemoveDCAClicked: PropTypes.func,
        onAddDCAClicked: PropTypes.func,
    };

    state = {
        comparableSale: {},
        isDraggingPin: true,
        droppingPinX: 0,
        droppingPinY: 0
    };

    static getDerivedStateFromProps(props)
    {
        if (!props.comparableSale._id || props.openByDefault || props.comparableSale[ComparableSaleListItem._newLease])
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

    getDefaultMapParams()
    {
        const mapParams = {
            defaultCenter: {
                lat: 41.3625202,
                lng: -100.5995477
            },
            defaultZoom: 5
        };

        if (this.state.comparableSale.location)
        {
            mapParams.defaultCenter.lng = this.state.comparableSale.location.coordinates[0];
            mapParams.defaultCenter.lat = this.state.comparableSale.location.coordinates[1];
            mapParams.defaultZoom = 12;
        }

        return mapParams;
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
        if (window.confirm("Are you sure you want to delete the comparable?"))
        {
            this.props.onDeleteComparable(this.state.comparableSale);

            axios.delete(`/comparable_sales/` + this.state.comparableSale._id).then((response) => {
                // console.log(response.data.comparableSales);
                // this.setState({comparableSales: response.data.comparableSales})
            });
        }
    }

    toggleDetails()
    {
        this.setState({detailsOpen: !this.state.detailsOpen});
    }

    placePinButtonClicked()
    {
        this.setState({placePinOnMapPopoverOpen: true})
    }


    onPinMapMouseMove(evt)
    {
        const mapElem = document.getElementById("place-pin-body-wrapper");
        const position = mapElem.getBoundingClientRect();
        const scroll = window.scrollX;
        const mouseX = evt.pageX + 12.5;
        const mouseY = evt.pageY - 3;
        const state = {droppingPinX: mouseX - position.left - window.scrollX, droppingPinY: mouseY - position.top - window.scrollY};
        this.setState(state);
    }

    onPinMapMouseClicked(evt)
    {
        this.changeComparableField("location", {"type": "Point", "coordinates": [evt.lng, evt.lat]})
    }

    togglePlacePinView()
    {
        this.setState({placePinOnMapPopoverOpen: !this.state.placePinOnMapPopoverOpen})
    }



    render()
    {
        const comparableSale = this.state.comparableSale;

        const editableClass = this.props.edit ? "editable" : "non-editable";

        const expandedClass = this.state.detailsOpen ? "expanded" : "";

        const lastClass = this.props.last ? "last" : "";

        const headerConfigurations = {
            saleDate: {
                render: (value) => <span>{new Date(value).getMonth() + 1} / {new Date(value).getFullYear().toString().substr(2)}</span>,
                noValueText: "No Sale Date",
                size: 1
            },
            address: {
                render: (value) => <span>{value}</span>,
                noValueText: "No Address",
                size: 3
            },
            sizeSquareFootage: {
                render: (value) => <NumberFormat
                    value={value}
                    displayType={'text'}
                    thousandSeparator={', '}
                    decimalScale={0}
                    fixedDecimalScale={true}
                />,
                size: "middle"
            },
            sizeOfLandSqft: {
                render: (value) => <NumberFormat
                    value={value}
                    displayType={'text'}
                    thousandSeparator={', '}
                    decimalScale={0}
                    fixedDecimalScale={true}
                />,
                size: "middle"
            },
            sizeOfLandAcres: {
                render: (value) => <NumberFormat
                    value={value}
                    displayType={'text'}
                    thousandSeparator={', '}
                    decimalScale={1}
                    fixedDecimalScale={true}
                />,
                size: "middle"
            },
            sizeOfBuildableAreaSqft: {
                render: (value) => <NumberFormat
                    value={value}
                    displayType={'text'}
                    thousandSeparator={', '}
                    decimalScale={0}
                    fixedDecimalScale={true}
                />,
                size: "middle"
            },
            salePrice: {
                render: (value) => <CurrencyFormat value={value} cents={false}/>,
                size: "middle"
            },
            capitalizationRate: {
                render: (value) => <PercentFormat value={value} />,
                size: "middle"
            },
            propertyType: {
                render: (value) => <span>{value}</span>,
                size: "middle"
            },
            propertyTags: {
                render: (value) => value.map((tag, tagIndex) => <span key={tag}>{tag}{tagIndex !== value.length - 1 ? ", " : ""}</span>),
                size: "middle"
            },
            pricePerSquareFoot: {
                render: (value) => <CurrencyFormat value={value} />,
                size: "middle"
            },
            pricePerAcreLand: {
                render: (value) => <CurrencyFormat value={value} cents={false} />,
                size: "middle"
            },
            pricePerSquareFootLand: {
                render: (value) => <CurrencyFormat value={value} cents={false} />,
                size: "middle"
            },
            pricePerSquareFootBuildableArea: {
                render: (value) => <CurrencyFormat value={value} />,
                size: "middle"
            },
            pricePerBuildableUnit: {
                render: (value) => <CurrencyFormat value={value} cents={false} />,
                size: "middle"
            },
            netOperatingIncome: {
                render: (value) => <CurrencyFormat value={value} cents={false} />,
                size: "middle"
            },
            netOperatingIncomePSF: {
                render: (value) => <CurrencyFormat value={value} cents={true} />,
                size: "middle"
            },
            noiPSFMultiple: {
                render: (value) => <FloatFormat value={value} />,
                size: "middle"
            },
            buildableUnits: {
                render: (value) => <IntegerFormat value={value} />,
                size: "middle"
            },
            siteCoverage: {
                render: (value) => <span>(<PercentFormat value={value} digits={0} />)</span>,
                size: "middle"
            },
            occupancyRate: {
                render: (value) => <span>(<PercentFormat value={value} digits={0} />)</span>,
                size: "middle"
            },
            zoning: {
                render: (value) => <span>{value}</span>,
                size: "middle"
            },
            floorSpaceIndex: {
                render: (value) => <FloatFormat value={value} />,
                size: "middle"
            },
            noiPerBedroom: {
                render: (value) => <CurrencyFormat value={value} cents={false}/>,
                size: "middle"
            },
            noiPerUnit: {
                render: (value) => <CurrencyFormat value={value} cents={false}/>,
                size: "middle"
            },
            averageMonthlyRentPerUnit: {
                render: (value) => <CurrencyFormat value={value} cents={false}/>,
                size: "middle"
            },
            numberOfUnits: {
                render: (value) => <IntegerFormat value={value}/>,
                size: "middle"
            },
            totalBedrooms: {
                render: (value) => <IntegerFormat value={value}/>,
                size: "middle"
            },
            pricePerUnit: {
                render: (value) => <CurrencyFormat value={value} cents={false}/>,
                size: "middle"
            },
            pricePerBedroom: {
                render: (value) => <CurrencyFormat value={value} cents={false}/>,
                size: "middle"
            },
            shippingDoorsTruckLevel: {
                render: (value) => <span><IntegerFormat value={value}/> T/L</span>,
                noValueText: "",
                spacer: <span>, </span>,
                size: "middle"
            },
            shippingDoorsDoubleMan: {
                render: (value) => <span><IntegerFormat value={value}/> D/M</span>,
                noValueText: "",
                spacer: <span>, </span>,
                size: "middle"
            },
            shippingDoorsDriveIn: {
                render: (value) => <span><IntegerFormat value={value}/> D/I</span>,
                noValueText: "",
                spacer: <span>, </span>,
                size: "middle"
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
            <div className={`card b comparable-sale-list-item ${expandedClass} ${lastClass}`}>
                <div className={"comparable-sale-list-item-button-column"}>
                    {
                        this.props.onRemoveComparableClicked && this.props.appraisal.hasComparableSale(this.props.comparableSale) ?
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
                        this.props.onAddComparableClicked && !this.props.appraisal.hasComparableSale(this.props.comparableSale) ?
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
                                    {
                                        this.props.headers.map((headerFieldList, headerIndex) =>
                                        {
                                            return <ComparableSaleListItemHeaderColumn
                                                key={headerIndex}
                                                size={headerConfigurations[headerFieldList[0]].size}
                                                renders={headerFieldList.map((field) => headerConfigurations[field].render)}
                                                noValueTexts={headerFieldList.map((field) => headerConfigurations[field].noValueText)}
                                                fields={headerFieldList}
                                                spacers={headerFieldList.map((field) => headerConfigurations[field].spacer)}
                                                comparableSale={this.props.comparableSale}/>
                                        })
                                    }
                                </Row>
                            </CardTitle>
                        </CardHeader> : null
                    }
                    <Collapse isOpen={_.isUndefined(this.state.detailsOpen) ? this.state.openByDefault : this.state.detailsOpen}>
                        <div className={`card-body comparable-sale-list-item-body ${editableClass}`}>
                                <div className={"comparable-sale-list-item-left-column"}>
                                    <UploadableImageSet
                                        editable={this.props.edit}
                                        address={this.props.comparableSale.address}
                                        accessToken={Auth.getAccessToken()}
                                        value={this.props.comparableSale.imageUrls}
                                        onChange={(newUrls) => this.changeComparableField('imageUrls', newUrls)}
                                    />

                                    {
                                        this.props.onRemoveDCAClicked ? <div className={"comparable-list-boxes"}>
                                            <span>Include in Direct Comparison&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            <FieldDisplayEdit
                                                type={"boolean"}
                                                hideIcon={true}
                                                value={this.props.appraisal.hasComparableSaleInDCA(this.props.comparableSale)}
                                                onChange={() => this.props.appraisal.hasComparableSaleInDCA(this.props.comparableSale) ? this.props.onRemoveDCAClicked(comparableSale) : this.props.onAddDCAClicked(comparableSale)}
                                            />
                                        </div> : null
                                    }
                                    {
                                        this.props.onRemoveCapRateClicked ? <div className={"comparable-list-boxes"}>
                                            <span>Include in Capitalization Approach</span>
                                            <FieldDisplayEdit
                                                type={"boolean"}
                                                hideIcon={true}
                                                value={this.props.appraisal.hasComparableSaleInCapRate(this.props.comparableSale)}
                                                onChange={() => this.props.appraisal.hasComparableSaleInCapRate(this.props.comparableSale) ? this.props.onRemoveCapRateClicked(comparableSale) : this.props.onAddCapRateClicked(comparableSale)}
                                            />
                                        </div> : null
                                    }


                                </div>
                            <div className={`comparable-sale-content`}>
                                <div className={"comparable-fields-area"}>
                                    <ComparableSaleListItemField
                                        title="Address"
                                        field="address"
                                        fieldType="address"
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <span>
                                    </span>
                                    <div className={"place-pin-on-map-button-container"}>
                                        <Button onClick={() => this.placePinButtonClicked()} id={`place-pin-on-map-button`}>
                                            Place Pin on Map
                                        </Button>

                                        <Popover placement="bottom" isOpen={this.state.placePinOnMapPopoverOpen} target={"place-pin-on-map-button"} toggle={() => this.togglePlacePinView()} className={"place-pin-on-map-popover"}>
                                            <PopoverBody>
                                                <div id="place-pin-body-wrapper" className={"place-pin-body-wrapper"} onMouseMove={(evt) => this.onPinMapMouseMove(evt)}>
                                                    <GoogleMapReact
                                                        bootstrapURLKeys={{ key: "AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I" }}
                                                        defaultCenter={this.getDefaultMapParams().defaultCenter}
                                                        defaultZoom={this.getDefaultMapParams().defaultZoom}
                                                        onClick={(evt) => this.onPinMapMouseClicked(evt)}
                                                    >
                                                        {
                                                            this.props.comparableSale.location ?
                                                                <div
                                                                    lat={this.props.comparableSale.location.coordinates[1]}
                                                                    lng={this.props.comparableSale.location.coordinates[0]}>
                                                                    <img
                                                                        alt={"Droppable Map Pin"}
                                                                        className={"current-building-map-icon"}
                                                                        src={"/img/building-icon.png"}
                                                                    />
                                                                </div> : null
                                                        }
                                                    </GoogleMapReact>
                                                    {
                                                        this.state.isDraggingPin ?
                                                            <div style={{"left": `${this.state.droppingPinX}px`, "top": `${this.state.droppingPinY}px`, "position": "absolute"}}>
                                                                <img
                                                                    alt={"Droppable Map Pin"}
                                                                    className={"pin-map-icon"}
                                                                    src={"/img/building-icon.png"}
                                                                />
                                                            </div> : null
                                                    }
                                                </div>
                                            </PopoverBody>
                                        </Popover>
                                    </div>

                                    <ComparableSaleListItemField
                                        title="Property Type"
                                        field="propertyType"
                                        fieldType="propertyType"
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Sub Type"
                                        field="propertyTags"
                                        fieldType="tags"
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Tenancy Type"
                                        field="tenancyType"
                                        fieldType="tenancyType"
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Building Size"
                                        field="sizeSquareFootage"
                                        fieldType="area"
                                        excludedPropertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <h4 className={"group-heading"}>Sales Information</h4>
                                    <span className={"group-heading"} />

                                    <ComparableSaleListItemField
                                        title="Sale Price"
                                        field="salePrice"
                                        fieldType="currency"
                                        cents={false}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Cap Rate"
                                        field="capitalizationRate"
                                        fieldType="percent"
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        excludedPropertyType={"land"}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Sale Date"
                                        field="saleDate"
                                        fieldType="date"
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Vendor"
                                        field="vendor"
                                        fieldType="text"
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Purchaser"
                                        field="purchaser"
                                        fieldType="text"
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="NOI"
                                        placeholder={"Net Operating Income"}
                                        field="netOperatingIncome"
                                        fieldType="currency"
                                        excludedPropertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="NOI PSF"
                                        placeholder={"Net Operating Income Per Square Foot"}
                                        field="netOperatingIncomePSF"
                                        fieldType="currency"
                                        excludedPropertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Price Per Square Foot"
                                        field="pricePerSquareFoot"
                                        fieldType="currency"
                                        excludedPropertyType={"land"}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Price Per Unit"
                                        field="pricePerUnit"
                                        fieldType="currency"
                                        propertyType={"residential"}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Avg Monthly Rent Per Unit"
                                        field="averageMonthlyRentPerUnit"
                                        fieldType="currency"
                                        propertyType={"residential"}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Price Per Bedroom"
                                        field="pricePerBedroom"
                                        fieldType="currency"
                                        propertyType={"residential"}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Number Of Units"
                                        field="numberOfUnits"
                                        fieldType="number"
                                        propertyType={"residential"}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="NOI Per Unit"
                                        field="noiPerUnit"
                                        fieldType="currency"
                                        propertyType={"residential"}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="NOI Per Bedroom"
                                        field="noiPerBedroom"
                                        fieldType="currency"
                                        propertyType={"residential"}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Bachelors"
                                        field="numberOfBachelors"
                                        fieldType="number"
                                        propertyType={"residential"}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="One Bedrooms"
                                        field="numberOfOneBedrooms"
                                        fieldType="number"
                                        propertyType={"residential"}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Two Bedrooms"
                                        field="numberOfTwoBedrooms"
                                        fieldType="number"
                                        propertyType={"residential"}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Three+ Bedrooms"
                                        field="numberOfThreePlusBedrooms"
                                        fieldType="number"
                                        propertyType={"residential"}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Total Bedrooms"
                                        field="totalBedrooms"
                                        fieldType="number"
                                        propertyType={"residential"}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />


                                    {
                                        comparableSale.propertyType === 'land' ?
                                            <h4 className={"group-heading"}>Property Information</h4>
                                            : <h4 className={"group-heading"}>Building Information</h4>
                                    }
                                    {
                                        comparableSale.propertyType === 'land' ?
                                            <span className={"group-heading"}></span>
                                            : <span className={"group-heading"}></span>
                                    }

                                    <ComparableSaleListItemField
                                        title="Floors"
                                        field="floors"
                                        fieldType="text"
                                        excludedPropertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Construction Date"
                                        field="constructionDate"
                                        fieldType="text"
                                        excludedPropertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Site Area"
                                        field="siteArea"
                                        fieldType="acres"
                                        excludedPropertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Site Coverage"
                                        field="siteCoverage"
                                        fieldType="percent"
                                        propertyType={"industrial"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Occupancy Rate"
                                        field="occupancyRate"
                                        fieldType="percent"
                                        excludedPropertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Clear Ceiling Height"
                                        field="clearCeilingHeight"
                                        fieldType="length"
                                        propertyType={"industrial"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Finished Office Percentage"
                                        field="finishedOfficePercent"
                                        fieldType="percent"
                                        propertyType={"industrial"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    {
                                        this.state.comparableSale.propertyType === 'industrial' ?
                                            [
                                                <span className={"comparable-field-label"} key={0} >Shipping Doors:</span>,
                                                <div className={"shipping-doors"} key={1}>
                                                    <div className={"shipping-doors-line"}>
                                                        <span>Double Man:</span>
                                                        <FieldDisplayEdit
                                                            type={"number"}
                                                            edit={this.props.edit}
                                                            placeholder={"Shipping Doors Double Man"}
                                                            value={comparableSale.shippingDoorsDoubleMan}
                                                            onChange={(newValue) => this.changeComparableField('shippingDoorsDoubleMan', newValue)}
                                                        />
                                                    </div>
                                                    <div className={"shipping-doors-line"}>
                                                        <span>Drive In:</span>
                                                        <FieldDisplayEdit
                                                            type={"number"}
                                                            edit={this.props.edit}
                                                            placeholder={"Shipping Doors Drive In"}
                                                            value={comparableSale.shippingDoorsDriveIn}
                                                            onChange={(newValue) => this.changeComparableField('shippingDoorsDriveIn', newValue)}
                                                        />
                                                    </div>
                                                    <div className={"shipping-doors-line"}>
                                                        <span>Truck Level:</span>
                                                        <FieldDisplayEdit
                                                            type={"number"}
                                                            edit={this.props.edit}
                                                            placeholder={"Shipping Doors Truck Level"}
                                                            value={comparableSale.shippingDoorsTruckLevel}
                                                            onChange={(newValue) => this.changeComparableField('shippingDoorsTruckLevel', newValue)}
                                                        />
                                                    </div>
                                                </div>
                                            ] : null
                                    }

                                    <ComparableSaleListItemField
                                        title="Zoning"
                                        field="zoning"
                                        fieldType="zone"
                                        propertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Development Proposals"
                                        field="developmentProposals"
                                        fieldType="text"
                                        propertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Size of Land (sqft)"
                                        field="sizeOfLandSqft"
                                        fieldType="area"
                                        propertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Size of Land (acres)"
                                        field="sizeOfLandAcres"
                                        fieldType="acres"
                                        propertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Buildable Area (sqft)"
                                        field="sizeOfBuildableAreaSqft"
                                        fieldType="area"
                                        propertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Buildable Units"
                                        field="buildableUnits"
                                        fieldType="number"
                                        propertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    {
                                        comparableSale.propertyType === 'land' ? <h4 className={"group-heading"}>Property Information</h4> : null
                                    }

                                    {
                                        comparableSale.propertyType === 'land' ? <span className={"group-heading"}></span> : null
                                    }

                                    <ComparableSaleListItemField
                                        title="Price per Square Foot of Land"
                                        field="pricePerSquareFootLand"
                                        fieldType="currency"
                                        propertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Price per Acre of Land"
                                        field="pricePerAcreLand"
                                        fieldType="currency"
                                        propertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Price per Square Foot of Buildable Area"
                                        field="pricePerSquareFootBuildableArea"
                                        fieldType="currency"
                                        propertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Price per Buildable Unit"
                                        field="pricePerBuildableUnit"
                                        fieldType="currency"
                                        propertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Floor Space Index"
                                        field="floorSpaceIndex"
                                        fieldType="float"
                                        propertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Tenants"
                                        field="tenants"
                                        fieldType="text"
                                        excludedPropertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Parking"
                                        field="parking"
                                        fieldType="text"
                                        excludedPropertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Additional Info"
                                        field="additionalInfo"
                                        fieldType="text"
                                        excludedPropertyType={"land"}
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
                                    />

                                    <ComparableSaleListItemField
                                        title="Description"
                                        field="computedDescriptionText"
                                        fieldType="textbox"
                                        edit={this.props.edit}
                                        comparableSale={comparableSale}
                                        onChange={this.changeComparableField.bind(this)}
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