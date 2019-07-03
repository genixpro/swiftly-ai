import React from 'react';
import { Button, Collapse, CardHeader, CardTitle, Row, Col, Popover, PopoverBody, PopoverHeader, Table} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import {NonDroppableFieldDisplayEdit} from "./FieldDisplayEdit";
import axios from "axios/index";
import UploadableImageSet from "./UploadableImageSet";
import NumberFormat from 'react-number-format';
import PropTypes from "prop-types";
import ComparableSaleModel from "../../models/ComparableSaleModel";
import AppraisalModel from "../../models/AppraisalModel";
import _ from 'underscore';
import Promise from "bluebird";
import GoogleMapReact from 'google-map-react';
import CurrencyFormat from "./CurrencyFormat";
import PercentFormat from "./PercentFormat";
import FloatFormat from "./FloatFormat";
import IntegerFormat from "./IntegerFormat";
import ComparableLeaseListItem from "./ComparableLeaseListItem";
import Auth from "../../Auth";
import FreeRentLossForUnitCalculationPopoverWrapper from "./FreeRentLossForUnitCalculationPopoverWrapper";


class ComparableSaleListItemField extends React.Component
{
    static propTypes = {
        title: PropTypes.string.isRequired,
        field: PropTypes.string.isRequired,
        fieldType: PropTypes.string.isRequired,
        edit: PropTypes.bool.isRequired,
        cents: PropTypes.bool,
        propertyType: PropTypes.string,
        excludedPropertyType: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        location: PropTypes.object,
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

        if (!this.props.edit && (this.props.comparableSale[this.props.field] === null || this.props.comparableSale[this.props.field] === ""))
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
                location={this.props.location ? {lat: () => this.props.location.coordinates[1], lng: () => this.props.location.coordinates[0]} : null}
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
                        ? <span key={fieldIndex}>
                            {
                                this.props.renders[fieldIndex](this.props.comparableSale[field])
                            }
                            {fieldIndex !== this.props.fields.length - 1 ?
                                (!_.isUndefined(this.props.spacers[fieldIndex]) ? this.props.spacers[fieldIndex] : <br />)
                                    : null}
                            </span>
                        : <span className={"no-data"} key={fieldIndex}>
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

    static instance = 0;

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
        droppingPinY: 0,
        stabilizePopoverOpen: false,
        portfolioComps: [],
        selectedPortfolioComp: -1
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

    constructor()
    {
        super();
        this.popoverId = `comparable-sale-list-item-${ComparableSaleListItem.instance}`;
        ComparableSaleListItem.instance += 1;
    }

    componentDidMount()
    {
        if (this.props.comparableSale.isPortfolioCompilation)
        {
            Promise.map(this.props.comparableSale.portfolioLinkedComps, (compId) =>
            {
                return axios.get(`/comparable_sales/${compId}`).then((response) =>
                {
                    return ComparableSaleModel.create(response.data.comparableSale);
                })
            }).then((comps) =>
            {
                this.setState({portfolioComps: comps})
            });
        }
    }

    saveComparable(updatedComparable)
    {
        // alert(updatedComparable._id);
        axios.post(`/comparable_sales/` + updatedComparable._id, updatedComparable).then((response) => {
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

        const comparableSale = this.getSelectedComparable();

        if (comparableSale.location)
        {
            mapParams.defaultCenter.lng = comparableSale.location.coordinates[0];
            mapParams.defaultCenter.lat = comparableSale.location.coordinates[1];
            mapParams.defaultZoom = 12;
        }

        return mapParams;
    }

    getSelectedComparable()
    {
        if (this.state.selectedPortfolioComp === -1)
        {
            return this.props.comparableSale;
        }
        else
        {
            return this.state.portfolioComps[this.state.selectedPortfolioComp];
        }
    }


    changeComparableField(field, newValue)
    {
        const comparable = this.getSelectedComparable();

        comparable[field] = newValue;
        if (newValue)
        {
            comparable.calculateMissingNumbers();
        }

        this.updateSelectedComparable(comparable);
    }

    updateSelectedComparable(newComparable)
    {
        if (this.state.selectedPortfolioComp === -1)
        {
            if (newComparable._id)
            {
                this.saveComparable(newComparable);
                this.props.onChange(newComparable);
            }
            else
            {
                this.props.onChange(newComparable);
            }
        }
        else
        {
            if (newComparable._id)
            {
                this.state.portfolioComps[this.state.selectedPortfolioComp] = newComparable;
                this.setState({portfolioComps: this.state.portfolioComps});
                if (this.props.onChangePortfolio)
                {
                    this.props.onChangePortfolio(this.state.portfolioComps);
                }

                this.saveComparable(newComparable);
                axios.post(`/comparable_sales_portfolio/`, {portfolio: this.props.comparableSale, subComps: this.state.portfolioComps}).then((response) => {
                    const newPortfolioComp = response.data.comparableSale;
                    newPortfolioComp._id = this.props.comparableSale._id;

                    this.saveComparable(newPortfolioComp);
                    this.props.onChange(newPortfolioComp);
                });
            }
            else
            {
                this.state.portfolioComps[this.state.selectedPortfolioComp] = newComparable;
                this.setState({portfolioComps: this.state.portfolioComps});
                if (this.props.onChangePortfolio)
                {
                    this.props.onChangePortfolio(this.state.portfolioComps);
                }

                axios.post(`/comparable_sales_portfolio/`, {portfolio: this.props.comparableSale, subComps: this.state.portfolioComps}).then((response) => {
                    const newPortfolioComp = response.data.comparableSale;
                    newPortfolioComp._id = this.props.comparableSale._id;

                    this.props.onChange(newPortfolioComp);
                });
            }
        }
    }


    deleteComparable()
    {
        if (window.confirm("Are you sure you want to delete the comparable?"))
        {
            const comp = this.props.comparableSale;

            let deletePortfolio = false;
            if (comp.isPortfolioCompilation)
            {
                deletePortfolio = window.confirm("Do you want to delete the portfolio sub-comps as well?");
            }

            this.props.onDeleteComparable(this.props.comparableSale);

            axios.delete(`/comparable_sales/` + comp._id).then((response) => {

                if (comp.isPortfolioCompilation && deletePortfolio)
                {
                    Promise.map(comp.portfolioLinkedComps, (subComp) =>
                    {
                        return axios.delete(`/comparable_sales/` + subComp._id);
                    });
                }

                // console.log(response.data.comparableSales);
                // this.setState({comparableSales: response.data.comparableSales})
            });
        }
    }

    toggleDetails()
    {
        this.setState({detailsOpen: !this.state.detailsOpen});
    }


    onPinMapMouseMove(evt)
    {
        const mapElem = document.getElementById("place-pin-body-wrapper");
        const position = mapElem.getBoundingClientRect();
        const scroll = window.scrollX;
        const mouseX = evt.pageX + 12.5;
        const mouseY = evt.pageY - 3;
        const state = {droppingPinX: mouseX - position.left - window.scrollX, droppingPinY: mouseY - position.top - window.scrollY, isDraggingPin: true};
        this.setState(state);
    }


    onPinMapMouseOff(evt)
    {
        const state = {isDraggingPin: false};
        this.setState(state);
    }


    onPinMapMouseClicked(evt)
    {
        this.changeComparableField("location", {"type": "Point", "coordinates": [evt.lng, evt.lat]})
    }

    togglePlacePinView()
    {
        if (!this.state.placePinOnMapPopoverOpen)
        {
            this.setState({isDraggingPin: false});
        }

        this.setState({placePinOnMapPopoverOpen: !this.state.placePinOnMapPopoverOpen})
    }

    toggleStabilizeNOIPopover()
    {
        this.setState({stabilizePopoverOpen: !this.state.stabilizePopoverOpen})
    }


    // togglePortfolio()
    // {
    //     const comparable = this.props.comparableSale;
    //     if (comparable.isPortfolioCompilation)
    //     {
    //         comparable.isPortfolioCompilation = false;
    //         if (comparable._id)
    //         {
    //             this.saveComparable(comparable);
    //         }
    //         this.setState({
    //             portfolioComps: []
    //         });
    //     }
    //     else
    //     {
    //         comparable.isPortfolioCompilation = true;
    //         if (comparable._id)
    //         {
    //             this.saveComparable(comparable);
    //         }
    //         this.setState({
    //             portfolioComps: [ComparableSaleModel.create({
    //                 isPartOfPortfolio: true,
    //                 allowSubCompSearch: false,
    //                 portfolioCompilationLinkId: this.props.comparableSale._id
    //             })]
    //         });
    //     }
    // }


    addEntryToPortfolio()
    {
        const currentPortfolioComps = this.state.portfolioComps;

        currentPortfolioComps.push(ComparableSaleModel.create({
            isPartOfPortfolio: true,
            allowSubCompSearch: false
        }));

        this.setState({
            portfolioComps: currentPortfolioComps,
            selectedPortfolioComp: currentPortfolioComps.length - 1
        });

    }

    changeSelectedComp(newSelectionIndex)
    {
        this.setState({
            selectedPortfolioComp: newSelectionIndex
        });
    }

    deleteEntryFromPortfolio(portfolioCompIndex, evt)
    {
        evt.stopPropagation();
        if (window.confirm("Are you sure you want to delete the comparable from this portfolio?"))
        {
            const currentPortfolioComps = this.state.portfolioComps;
            const comp = currentPortfolioComps.splice(portfolioCompIndex, 1);

            if (comp[0]._id)
            {
                axios.delete(`/comparable_sale/${comp[0]._id}`);
            }

            const newState = {
                portfolioComps: currentPortfolioComps,
                selectedPortfolioComp: currentPortfolioComps.length > 0 ? currentPortfolioComps.length - 1 : -1
            };

            this.setState(newState);
        }
    }


    render()
    {
        let editableClass = this.props.edit ? "editable" : "non-editable";

        const expandedClass = this.state.detailsOpen ? "expanded" : "";

        const lastClass = this.props.last ? "last" : "";

        let comparableSale = this.props.comparableSale;

        let allowEdit = this.props.edit;

        if (comparableSale.isPortfolioCompilation)
        {
            if (this.state.selectedPortfolioComp !== -1)
            {
                comparableSale = this.state.portfolioComps[this.state.selectedPortfolioComp];
            }
            else
            {
                editableClass = "non-editable";
                allowEdit = false;
            }
        }

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
            displayCapitalizationRate: {
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
            displayNetOperatingIncome: {
                render: (value) => <CurrencyFormat value={value} cents={false} />,
                size: "middle"
            },
            netOperatingIncomePSF: {
                render: (value) => <CurrencyFormat value={value} cents={true} />,
                size: "middle"
            },
            displayNetOperatingIncomePSF: {
                render: (value) => <CurrencyFormat value={value} cents={true} />,
                size: "middle"
            },
            noiPSFMultiple: {
                render: (value) => <FloatFormat value={value} />,
                size: "middle"
            },
            displayNOIPSFMultiple: {
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
            displayNOIPerBedroom: {
                render: (value) => <CurrencyFormat value={value} cents={false}/>,
                size: "middle"
            },
            noiPerUnit: {
                render: (value) => <CurrencyFormat value={value} cents={false}/>,
                size: "middle"
            },
            displayNOIPerUnit: {
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
                        this.props.onRemoveComparableClicked && this.props.appraisal.hasComparableSale(comparableSale) ?
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
                        this.props.onAddComparableClicked && !this.props.appraisal.hasComparableSale(comparableSale) ?
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
                                                comparableSale={comparableSale}/>
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
                                    editable={allowEdit}
                                    address={comparableSale.address}
                                    accessToken={Auth.getAccessToken()}
                                    value={comparableSale.imageUrls}
                                    onChange={(newUrls) => this.changeComparableField('imageUrls', newUrls)}
                                />

                                {
                                    (this.props.onRemoveDCAClicked || this.props.onRemoveCapRateClicked) ?
                                        <span>
                                            <br/>
                                            <h4>This Appraisal</h4>
                                        </span>
                                        : null
                                }
                                {
                                    this.props.onRemoveDCAClicked ? <div className={"comparable-list-boxes"}>
                                        <span>Include in Direct Comparison&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        <FieldDisplayEdit
                                            type={"boolean"}
                                            hideIcon={true}
                                            value={this.props.appraisal.hasComparableSaleInDCA(comparableSale)}
                                            onChange={() => this.props.appraisal.hasComparableSaleInDCA(comparableSale) ? this.props.onRemoveDCAClicked(comparableSale) : this.props.onAddDCAClicked(comparableSale)}
                                        />
                                    </div> : null
                                }
                                {
                                    this.props.onRemoveCapRateClicked ? <div className={"comparable-list-boxes"}>
                                        <span>Include in Capitalization Approach</span>
                                        <FieldDisplayEdit
                                            type={"boolean"}
                                            hideIcon={true}
                                            value={this.props.appraisal.hasComparableSaleInCapRate(comparableSale)}
                                            onChange={() => this.props.appraisal.hasComparableSaleInCapRate(comparableSale) ? this.props.onRemoveCapRateClicked(comparableSale) : this.props.onAddCapRateClicked(comparableSale)}
                                        />
                                    </div> : null
                                }


                                <br/>
                                <br/>
                                <h4>Portfolio</h4>
                                {
                                    this.props.comparableSale.isPortfolioCompilation ? <div>
                                        <Table striped className={"portfolio-table"}>
                                            <tbody>
                                                <tr className={`comp-selection-row ${this.state.selectedPortfolioComp === -1 ? 'selected' : ''}`} onClick={() => this.changeSelectedComp(-1)}>
                                                    <td className={"arrow-column"}>
                                                        {
                                                            this.state.selectedPortfolioComp === -1 ? <i className={"fa fa-arrow-right"} /> : null
                                                        }
                                                    </td>
                                                    <td className={"portfolio-number-column"} />
                                                    <td className={"portfolio-address-column"}>
                                                        Compilation
                                                    </td>
                                                    <td className={"portfolio-action-column"}>
                                                    </td>
                                                </tr>
                                                {
                                                    this.state.portfolioComps.map((portfolioComp, portfolioIndex) =>
                                                    {
                                                        return <tr key={portfolioIndex} className={`comp-selection-row ${portfolioIndex === this.state.selectedPortfolioComp ? 'selected' : ''}`} onClick={() => this.changeSelectedComp(portfolioIndex)}>
                                                            <td className={"arrow-column"}>
                                                                {
                                                                    this.state.selectedPortfolioComp === portfolioIndex ? <i className={"fa fa-arrow-right"} /> : null
                                                                }
                                                            </td>
                                                            <td className={"portfolio-number-column"}>
                                                                #{portfolioIndex + 1}
                                                            </td>
                                                            <td className={"portfolio-address-column"}>{portfolioComp.address || <span className={"no-data"}>No Address</span>}</td>
                                                            <td className={"portfolio-action-column"}>
                                                                <div className={"action-button-wrapper"}>
                                                                    <Button className={""} color={'danger'} onClick={(evt) => this.deleteEntryFromPortfolio(portfolioIndex, evt)}>
                                                                        <i className={"fa fa-trash"} />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>;
                                                    })
                                                }
                                                {
                                                    this.props.edit ?
                                                        <tr>
                                                            <td className={"arrow-column"} />
                                                            <td className={"portfolio-number-column"} />
                                                            <td className={"portfolio-address-column"}>
                                                                <Button onClick={()=>this.addEntryToPortfolio()}>Add Entry In Portfolio</Button>
                                                            </td>
                                                            <td className={"portfolio-action-column"}>

                                                            </td>
                                                        </tr> : null
                                                }
                                            </tbody>
                                        </Table>
                                    </div> : null
                                }
                            </div>
                            {
                                this.props.comparableSale.isPortfolioCompilation && this.state.portfolioComps.length === 0 ?
                                    <div className={`no-comps-in-portfolio`}>
                                        <Button color={'secondary'} className={"no-comps-in-portfolio-button"} onClick={()=>this.addEntryToPortfolio()}>
                                            <i className={"fa fa-plus"} />
                                            <br />
                                            <span>Add a Sale to this Portfolio</span>
                                        </Button>
                                    </div>
                                    : null
                            }
                            {
                                (this.props.comparableSale.isPortfolioCompilation && this.state.portfolioComps.length > 0) || (!this.props.comparableSale.isPortfolioCompilation) ?
                                <div className={`comparable-sale-content`}>
                                    <div className={"comparable-fields-area"}>
                                        {
                                            this.state.selectedPortfolioComp > -1 ?
                                                <ComparableSaleListItemField
                                                    title="Make Portfolio Property Searchable Independently"
                                                    field="allowSubCompSearch"
                                                    fieldType="boolean"
                                                    edit={allowEdit}
                                                    comparableSale={comparableSale}
                                                    onChange={this.changeComparableField.bind(this)}
                                                /> : null
                                        }

                                        <ComparableSaleListItemField
                                            title="Address"
                                            field="address"
                                            fieldType="address"
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            location={comparableSale.location || this.props.appraisal.location}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        {
                                            allowEdit ? <span /> : null
                                        }

                                        {
                                            allowEdit ?
                                            <div className={"place-pin-on-map-button-container"}>
                                                <Button onClick={() => this.togglePlacePinView()} id={`place-pin-on-map-button-${this.popoverId}`}>
                                                    Place Pin on Map
                                                </Button>

                                                <Popover placement="bottom" isOpen={this.state.placePinOnMapPopoverOpen} target={`place-pin-on-map-button-${this.popoverId}`} toggle={() => this.togglePlacePinView()} className={"place-pin-on-map-popover"}>
                                                    <PopoverBody>
                                                        <div id="place-pin-body-wrapper" className={"place-pin-body-wrapper"} onMouseMove={(evt) => this.onPinMapMouseMove(evt)} onMouseLeave={() => this.onPinMapMouseOff()}>
                                                            <GoogleMapReact
                                                                bootstrapURLKeys={{ key: "AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I" }}
                                                                defaultCenter={this.getDefaultMapParams().defaultCenter}
                                                                defaultZoom={this.getDefaultMapParams().defaultZoom}
                                                                onClick={(evt) => this.onPinMapMouseClicked(evt)}
                                                            >
                                                                {
                                                                    comparableSale.location ?
                                                                        <div
                                                                            lat={comparableSale.location.coordinates[1]}
                                                                            lng={comparableSale.location.coordinates[0]}>
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
                                                        <Button color={'primary'} onClick={() => this.togglePlacePinView()} className={"close-button"}>
                                                            Close
                                                        </Button>
                                                    </PopoverBody>
                                                </Popover>
                                            </div> : null
                                        }
                                        <ComparableSaleListItemField
                                            title="Property Type"
                                            field="propertyType"
                                            fieldType="propertyType"
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Sub Type"
                                            field="propertyTags"
                                            fieldType="tags"
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Tenancy Type"
                                            field="tenancyType"
                                            fieldType="tenancyType"
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Building Size"
                                            field="sizeSquareFootage"
                                            fieldType="area"
                                            excludedPropertyType={"land"}
                                            edit={allowEdit}
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
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />
                                        {
                                            !comparableSale.useStabilizedNoi ?

                                                <ComparableSaleListItemField
                                                    title="Cap Rate"
                                                    field="capitalizationRate"
                                                    fieldType="percent"
                                                    edit={allowEdit}
                                                    comparableSale={comparableSale}
                                                    excludedPropertyType={"land"}
                                                    onChange={this.changeComparableField.bind(this)}
                                                /> : null
                                        }
                                        {
                                            comparableSale.useStabilizedNoi ?

                                                <ComparableSaleListItemField
                                                    title="Stabilized Cap Rate"
                                                    field="stabilizedCapitalizationRate"
                                                    fieldType="percent"
                                                    edit={allowEdit}
                                                    comparableSale={comparableSale}
                                                    excludedPropertyType={"land"}
                                                    onChange={this.changeComparableField.bind(this)}
                                                /> : null
                                        }


                                        <ComparableSaleListItemField
                                            title="Sale Date"
                                            field="saleDate"
                                            fieldType="date"
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Vendor"
                                            field="vendor"
                                            fieldType="text"
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Purchaser"
                                            field="purchaser"
                                            fieldType="text"
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        {
                                            !comparableSale.useStabilizedNoi ?
                                                <ComparableSaleListItemField
                                                    title="NOI"
                                                    placeholder={"Net Operating Income"}
                                                    field="netOperatingIncome"
                                                    fieldType="currency"
                                                    excludedPropertyType={"land"}
                                                    edit={allowEdit}
                                                    comparableSale={comparableSale}
                                                    onChange={this.changeComparableField.bind(this)}
                                                /> : null
                                        }
                                        {
                                            comparableSale.useStabilizedNoi ?
                                                <ComparableSaleListItemField
                                                    title="Stabilized NOI"
                                                    placeholder={"Stabilized Net Operating Income"}
                                                    field="stabilizedNOI"
                                                    fieldType="currency"
                                                    excludedPropertyType={"land"}
                                                    edit={allowEdit}
                                                    comparableSale={comparableSale}
                                                    onChange={this.changeComparableField.bind(this)}
                                                /> : null
                                        }

                                        {
                                            allowEdit ? <span /> : null
                                        }
                                        {
                                            allowEdit ?
                                            <div className={"stabilize-noi-button-container"}>
                                                <Button color={'secondary'} id={`stabilize-noi-button-${this.popoverId}`} onClick={() => this.toggleStabilizeNOIPopover()}>Stabilize NOI</Button>
                                                <Popover
                                                    placement="bottom"
                                                    isOpen={this.state.stabilizePopoverOpen}
                                                    target={`stabilize-noi-button-${this.popoverId}`}
                                                    toggle={() => this.toggleStabilizeNOIPopover()}
                                                    className={"stabilized-noi-popover"}
                                                >
                                                    <PopoverHeader>Stabilize NOI</PopoverHeader>
                                                    <PopoverBody>
                                                        <table>
                                                            <tbody>
                                                            <tr>
                                                                <td>Net Operating Income</td>
                                                                <td>
                                                                </td>
                                                                <td className={"result-column"}>
                                                                    <CurrencyFormat value={comparableSale.netOperatingIncome}/>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>Vacancy Rate</td>
                                                                <td>
                                                                    <NonDroppableFieldDisplayEdit
                                                                        type={"percent"}
                                                                        edit={allowEdit}
                                                                        placeholder={"Vacancy Rate"}
                                                                        value={comparableSale.stabilizedNoiVacancyRate}
                                                                        onChange={(newValue) => this.changeComparableField('stabilizedNoiVacancyRate', newValue)}
                                                                    />
                                                                </td>
                                                                <td className={"result-column"}>
                                                                    <CurrencyFormat value={-comparableSale.stabilizedNOIVacancyDeduction}/>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>Structural Allowance</td>
                                                                <td>
                                                                    <NonDroppableFieldDisplayEdit
                                                                        type={"percent"}
                                                                        edit={allowEdit}
                                                                        placeholder={"Structural Allowance"}
                                                                        value={comparableSale.stabilizedNoiStructuralAllowance}
                                                                        onChange={(newValue) => this.changeComparableField('stabilizedNoiStructuralAllowance', newValue)}
                                                                    />
                                                                </td>
                                                                <td className={"result-column"}>
                                                                    <CurrencyFormat value={-comparableSale.stabilizedNOIStructuralAllowance}/>
                                                                </td>
                                                            </tr>
                                                            <tr className={"stabilized-noi-custom-line"}>
                                                                <td>
                                                                    <NonDroppableFieldDisplayEdit
                                                                        type={"text"}
                                                                        edit={allowEdit}
                                                                        placeholder={"Custom Deduction"}
                                                                        value={comparableSale.stabilizedNoiCustomName}
                                                                        onChange={(newValue) => this.changeComparableField('stabilizedNoiCustomName', newValue)}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <NonDroppableFieldDisplayEdit
                                                                        type={"percent"}
                                                                        edit={allowEdit}
                                                                        placeholder={"Custom Deduction %"}
                                                                        value={comparableSale.stabilizedNoiCustomDeduction}
                                                                        onChange={(newValue) => this.changeComparableField('stabilizedNoiCustomDeduction', newValue)}
                                                                    />
                                                                </td>
                                                                <td className={"result-column"}>
                                                                    <CurrencyFormat value={-comparableSale.stabilizedNOICustomDeduction}/>
                                                                </td>
                                                            </tr>
                                                            <tr className={"stabilized-noi-result-line"}>
                                                                <td>Stabilized NOI</td>
                                                                <td>
                                                                </td>
                                                                <td className={"result-column"}>
                                                                    <CurrencyFormat value={comparableSale.stabilizedNOI}/>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>Use Stabilized NOI?</td>
                                                                <td>
                                                                    <NonDroppableFieldDisplayEdit
                                                                        type={"boolean"}
                                                                        edit={allowEdit}
                                                                        hideIcon={true}
                                                                        placeholder={"Use Stabilized NOI"}
                                                                        value={comparableSale.useStabilizedNoi}
                                                                        onChange={(newValue) => this.changeComparableField('useStabilizedNoi', newValue)}
                                                                    />
                                                                </td>
                                                                <td className={"result-column"}>
                                                                </td>
                                                            </tr>
                                                            </tbody>
                                                        </table>

                                                    </PopoverBody>
                                                </Popover>
                                            </div> : null
                                        }


                                        <ComparableSaleListItemField
                                            title="NOI PSF"
                                            placeholder={"Net Operating Income Per Square Foot"}
                                            field="netOperatingIncomePSF"
                                            fieldType="currency"
                                            excludedPropertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Price Per Square Foot"
                                            field="pricePerSquareFoot"
                                            fieldType="currency"
                                            excludedPropertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Price Per Unit"
                                            field="pricePerUnit"
                                            fieldType="currency"
                                            propertyType={"residential"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Avg Monthly Rent Per Unit"
                                            field="averageMonthlyRentPerUnit"
                                            fieldType="currency"
                                            propertyType={"residential"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Price Per Bedroom"
                                            field="pricePerBedroom"
                                            fieldType="currency"
                                            propertyType={"residential"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Number Of Units"
                                            field="numberOfUnits"
                                            fieldType="number"
                                            propertyType={"residential"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="NOI Per Unit"
                                            field="noiPerUnit"
                                            fieldType="currency"
                                            propertyType={"residential"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="NOI Per Bedroom"
                                            field="noiPerBedroom"
                                            fieldType="currency"
                                            propertyType={"residential"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Bachelors"
                                            field="numberOfBachelors"
                                            fieldType="number"
                                            propertyType={"residential"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="One Bedrooms"
                                            field="numberOfOneBedrooms"
                                            fieldType="number"
                                            propertyType={"residential"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Two Bedrooms"
                                            field="numberOfTwoBedrooms"
                                            fieldType="number"
                                            propertyType={"residential"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Three+ Bedrooms"
                                            field="numberOfThreePlusBedrooms"
                                            fieldType="number"
                                            propertyType={"residential"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Total Bedrooms"
                                            field="totalBedrooms"
                                            fieldType="number"
                                            propertyType={"residential"}
                                            edit={allowEdit}
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
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Construction Date"
                                            field="constructionDate"
                                            fieldType="text"
                                            excludedPropertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Site Area"
                                            field="siteArea"
                                            fieldType="acres"
                                            excludedPropertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Site Coverage"
                                            field="siteCoverage"
                                            fieldType="percent"
                                            propertyType={"industrial"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Occupancy Rate"
                                            field="occupancyRate"
                                            fieldType="percent"
                                            excludedPropertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Clear Ceiling Height"
                                            field="clearCeilingHeight"
                                            fieldType="length"
                                            propertyType={"industrial"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Finished Office Percentage"
                                            field="finishedOfficePercent"
                                            fieldType="percent"
                                            propertyType={"industrial"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        {
                                            comparableSale.propertyType === 'industrial' && (allowEdit || comparableSale.shippingDoorsDoubleMan
                                                || comparableSale.shippingDoorsDriveIn || comparableSale.shippingDoorsTruckLevel) ?
                                                [
                                                    <span className={"comparable-field-label"} key={0} >Shipping Doors:</span>,
                                                    <div className={"shipping-doors"} key={1}>
                                                        {
                                                            allowEdit || comparableSale.shippingDoorsDoubleMan !== null ?
                                                                <div className={"shipping-doors-line"}>
                                                                    <span>Double Man:</span>
                                                                    <FieldDisplayEdit
                                                                        type={"number"}
                                                                        edit={allowEdit}
                                                                        placeholder={"Shipping Doors Double Man"}
                                                                        value={comparableSale.shippingDoorsDoubleMan}
                                                                        onChange={(newValue) => this.changeComparableField('shippingDoorsDoubleMan', newValue)}
                                                                    />
                                                                </div> : null
                                                        }
                                                        {
                                                            allowEdit || comparableSale.shippingDoorsDriveIn !== null ?
                                                                <div className={"shipping-doors-line"}>
                                                                    <span>Drive In:</span>
                                                                    <FieldDisplayEdit
                                                                        type={"number"}
                                                                        edit={allowEdit}
                                                                        placeholder={"Shipping Doors Drive In"}
                                                                        value={comparableSale.shippingDoorsDriveIn}
                                                                        onChange={(newValue) => this.changeComparableField('shippingDoorsDriveIn', newValue)}
                                                                    />
                                                                </div> : null
                                                        }
                                                        {
                                                            allowEdit || comparableSale.shippingDoorsTruckLevel !== null ?
                                                                <div className={"shipping-doors-line"}>
                                                                    <span>Truck Level:</span>
                                                                    <FieldDisplayEdit
                                                                        type={"number"}
                                                                        edit={allowEdit}
                                                                        placeholder={"Shipping Doors Truck Level"}
                                                                        value={comparableSale.shippingDoorsTruckLevel}
                                                                        onChange={(newValue) => this.changeComparableField('shippingDoorsTruckLevel', newValue)}
                                                                    />
                                                                </div> : null
                                                        }
                                                    </div>
                                                ] : null
                                        }

                                        <ComparableSaleListItemField
                                            title="Zoning"
                                            field="zoning"
                                            fieldType="zone"
                                            propertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Development Proposals"
                                            field="developmentProposals"
                                            fieldType="text"
                                            propertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Size of Land (sqft)"
                                            field="sizeOfLandSqft"
                                            fieldType="area"
                                            propertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Size of Land (acres)"
                                            field="sizeOfLandAcres"
                                            fieldType="acres"
                                            propertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Buildable Area (sqft)"
                                            field="sizeOfBuildableAreaSqft"
                                            fieldType="area"
                                            propertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Buildable Units"
                                            field="buildableUnits"
                                            fieldType="number"
                                            propertyType={"land"}
                                            edit={allowEdit}
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
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Price per Acre of Land"
                                            field="pricePerAcreLand"
                                            fieldType="currency"
                                            propertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Price per Square Foot of Buildable Area"
                                            field="pricePerSquareFootBuildableArea"
                                            fieldType="currency"
                                            propertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Price per Buildable Unit"
                                            field="pricePerBuildableUnit"
                                            fieldType="currency"
                                            propertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Floor Space Index"
                                            field="floorSpaceIndex"
                                            fieldType="float"
                                            propertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Tenants"
                                            field="tenants"
                                            fieldType="text"
                                            excludedPropertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Parking"
                                            field="parking"
                                            fieldType="text"
                                            excludedPropertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Additional Info"
                                            field="additionalInfo"
                                            fieldType="text"
                                            excludedPropertyType={"land"}
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                        <ComparableSaleListItemField
                                            title="Description"
                                            field="computedDescriptionText"
                                            fieldType="textbox"
                                            edit={allowEdit}
                                            comparableSale={comparableSale}
                                            onChange={this.changeComparableField.bind(this)}
                                        />

                                    </div>
                                </div> : null
                            }
                        </div>
                    </Collapse>
                </div>
            </div>

        );
    }
}


export default ComparableSaleListItem;