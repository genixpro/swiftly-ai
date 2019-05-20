import React from 'react';
import ComparableSaleListItem from './ComparableSaleListItem';
import {Row, Col, CardHeader, CardTitle} from 'reactstrap';
import ComparableSalesStatistics from "./ComparableSalesStatistics"
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SortDirection from "./SortDirection";
import ComparableSaleModel from "../../models/ComparableSaleModel";
import axios from "axios/index";
import PropTypes from "prop-types";
import _ from "underscore";

class ComparableSaleListHeaderColumn extends React.Component
{
    static propTypes = {
        size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        texts: PropTypes.arrayOf(PropTypes.string).isRequired,
        fields: PropTypes.arrayOf(PropTypes.string).isRequired,
        sort: PropTypes.string.isRequired,
        changeSortColumn: PropTypes.func.isRequired
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

        return <Col className={`header-field-column ${colClass}`} {...colProps} onClick={() => this.props.changeSortColumn(this.props.fields[0])}>

            {
                this.props.fields.map((field, fieldIndex) =>
                {
                    return <span key={fieldIndex}>
                            {this.props.texts[fieldIndex]}
                            {fieldIndex === 0 ? <SortDirection field={this.props.fields[0]} sort={this.props.sort} /> : null}
                            {fieldIndex !== this.props.fields.length - 1 && this.props.texts[fieldIndex] ? <br /> : null}
                    </span>
                })
            }

        </Col>
    }
}

class ComparableSaleList extends React.Component
{
    static defaultProps = {
        "sort": "-date",
        "statsPosition": "above",
        showPropertyTypeInHeader: true,
        "noCompMessage": "There are no comparables. Please add a new one or change your search settings.",
        search: {}
    };

    state = {
        comparableSales: [],
        newComparableSale: ComparableSaleModel.create({}),
        isCreatingNewItem: false
    };

    loadedComparables = {};

    lastNewComp = null;

    componentDidMount()
    {
        this.updateComparables();
    }


    componentDidUpdate()
    {
        this.updateComparables();
    }

    defaultHeaderFields()
    {
        const headerFields = [
            ["saleDate"],
            ["address"]
        ];

        if (this.props.search.propertyType !== 'land')
        {
            headerFields.push(["sizeSquareFootage"])
        }

        if (this.props.search.propertyType === 'land')
        {
            headerFields.push(["sizeOfLandAcres", "sizeOfBuildableAreaSqft"])
        }

        if(this.props.search.propertyType !== 'industrial')
        {
            headerFields.push(["salePrice"]);
        }
        else
        {
            headerFields.push(["salePrice", "shippingDoorsDoubleMan", "shippingDoorsDriveIn", "shippingDoorsTruckLevel"]);
        }

        headerFields.push(["propertyType", "propertyTags"]);

        if (this.props.search.propertyType !== 'land')
        {
            headerFields.push(["capitalizationRate", "pricePerSquareFoot"])
        }

        if (this.props.search.propertyType === 'land')
        {
            headerFields.push(["pricePerAcreLand", "pricePerSquareFootBuildableArea"])
        }

        return headerFields;
    }

    defaultStatsFields()
    {
        const statFields = [];

        if (this.props.search.propertyType !== 'land' && this.props.search.propertyType !== 'residential')
        {
            statFields.push("capitalizationRate");
            statFields.push("pricePerSquareFoot");
            statFields.push("sizeSquareFootage")
        }

        if (this.props.search.propertyType === 'industrial')
        {
            statFields.push("clearCeilingHeight");
        }

        if (this.props.search.propertyType === 'residential')
        {
            statFields.push("capitalizationRate");
            statFields.push("pricePerSquareFoot");
            statFields.push("pricePerUnit");
            statFields.push("noiPerUnit");
            statFields.push("pricePerBedroom");
        }

        if (this.props.search.propertyType !== 'land')
        {
            statFields.push("occupancyRate");
        }

        if (this.props.search.propertyType === 'land')
        {
            statFields.push("sizeOfLandAcres");
            statFields.push("floorSpaceIndex");
            statFields.push("pricePerSquareFootLand");
            statFields.push("pricePerSquareFootBuildableArea");
            statFields.push("pricePerAcreLand");
        }

        return statFields;
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
        if (newComparable === this.lastNewComp)
        {
            return;
        }
        this.lastNewComp = newComparable;

        axios.post(`/comparable_sales`, newComparable).then((response) =>
        {
            newComparable["_id"] = response.data._id;
            newComparable[ComparableSaleListItem._newSale] = true;

            this.lastNewComp = null;

            this.props.onNewComparable(newComparable);
            this.setState({isCreatingNewItem: false, newComparableSale: ComparableSaleModel.create({})})
        }, (err) =>
        {
            this.lastNewComp = null;
        });
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
        return <div className="card b new-comparable-sale" onClick={() => this.toggleCreateNewItem()}>
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


        const headerConfigurations = {
            saleDate: {
                title: "Date",
                size: 1
            },
            address: {
                title: "Address",
                size: 3
            },
            sizeSquareFootage: {
                title: "Building Size (sf)",
                size: "middle"
            },
            sizeOfLandSqft: {
                title: "Site Area (sqft)",
                size: "middle"
            },
            sizeOfLandAcres: {
                title: "Site Area (acres)",
                size: "middle"
            },
            sizeOfBuildableAreaSqft: {
                title: "Buildable Area (sqft)",
                size: "middle"
            },
            salePrice: {
                title: "Sale Price",
                size: "middle"
            },
            capitalizationRate: {
                title: "Cap Rate (%)",
                size: "middle"
            },
            propertyType: {
                title: "Property Type",
                size: "middle"
            },
            propertyTags: {
                title: "Sub Type",
                size: "middle"
            },
            pricePerSquareFoot: {
                title: "PSF Building Size ($)",
                size: "middle"
            },
            pricePerAcreLand: {
                title: "Price Per Acre ($)",
                size: "middle"
            },
            pricePerSquareFootLand: {
                title: "PSF Land ($)",
                size: "middle"
            },
            pricePerSquareFootBuildableArea: {
                title: "PSF Buildable Area ($)",
                size: "middle"
            },
            pricePerBuildableUnit: {
                title: "Price Per Buildable Unit ($)",
                size: "middle"
            },
            netOperatingIncome: {
                title: "NOI ($)",
                size: "middle"
            },
            netOperatingIncomePSF: {
                title: "NOI PSF",
                size: "middle"
            },
            noiPSFMultiple: {
                title: "Multiple",
                size: "middle"
            },
            buildableUnits: {
                title: "Buildable Units",
                size: "middle"
            },
            siteCoverage: {
                title: "(Site Coverage)",
                size: "middle"
            },
            occupancyRate: {
                title: "(Occupancy Rate)",
                size: "middle"
            },
            zoning: {
                title: "Zoning",
                size: "middle"
            },
            floorSpaceIndex: {
                title: "Floor Space Index",
                size: "middle"
            },
            noiPerBedroom: {
                title: "NOI / Bedroom",
                size: "middle"
            },
            noiPerUnit: {
                title: "NOI / Unit",
                size: "middle"
            },
            averageMonthlyRentPerUnit: {
                title: "Avg Mthly Rent",
                size: "middle"
            },
            numberOfUnits: {
                title: "Number Of Units",
                size: "middle"
            },
            totalBedrooms: {
                title: "Total Bedrooms",
                size: "middle"
            },
            pricePerUnit: {
                title: "Price / Unit",
                size: "middle"
            },
            pricePerBedroom: {
                title: "Price / Bedroom",
                size: "middle"
            },
            shippingDoorsTruckLevel: {
                title: "",
                size: "middle"
            },
            shippingDoorsDoubleMan: {
                title: "Shipping Doors",
                size: "middle"
            },
            shippingDoorsDriveIn: {
                title: "",
                size: "middle"
            }
        };

        const headerFields = this.props.headers || this.defaultHeaderFields();

        headerFields.forEach((headerFieldList) =>
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

        const statsFields = this.props.stats || this.defaultStatsFields();

        return (
            <div>
                {
                    this.props.statsPosition === "above" ? <ComparableSalesStatistics
                        appraisal={this.props.appraisal}
                        comparableSales={this.state.comparableSales}
                        title={this.props.statsTitle}
                        stats={statsFields}
                    /> : null
                }
                <div>
                    {
                        this.props.allowNew ?
                            <div>
                                {this.renderNewItemRow()}
                                <Modal isOpen={this.state.isCreatingNewItem} toggle={this.toggleNewItem.bind(this)} className={"new-comp-dialog"}>
                                    <ModalHeader toggle={this.toggleNewItem.bind(this)}>New Comparable Sale</ModalHeader>
                                    <ModalBody>
                                        <ComparableSaleListItem
                                            appraisal={this.props.appraisal}
                                            headers={headerFields}
                                            comparableSale={this.state.newComparableSale}
                                            openByDefault={true}
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
                    <div className={`card b comparable-sale-list-header`}>
                        <CardHeader className={`comparable-sale-list-item-header ${firstSpacing}`}>
                            <CardTitle>
                                <Row>
                                    {
                                        headerFields.map((headerFieldList, headerIndex) =>
                                        {
                                            return <ComparableSaleListHeaderColumn
                                                key={headerIndex}
                                                size={headerConfigurations[headerFieldList[0]].size}
                                                texts={headerFieldList.map((field) => headerConfigurations[field].title)}
                                                fields={headerFieldList}
                                                sort={this.props.sort}
                                                comparableSale={this.props.comparableSale}
                                                changeSortColumn={this.changeSortColumn.bind(this)}
                                            />
                                        })
                                    }
                                </Row>
                            </CardTitle>
                        </CardHeader>
                    </div>
                }
                {
                    this.state.comparableSales.map((comparableSale, index) =>
                    {
                        if (excludeIds.indexOf(comparableSale._id) === -1)
                        {
                            return <ComparableSaleListItem
                                headers={headerFields}
                                key={comparableSale._id}
                                comparableSale={comparableSale}
                                history={this.props.history}
                                appraisal={this.props.appraisal}
                                onChange={(comp) => this.updateComparable(comp, index)}
                                onAddComparableClicked={this.props.onAddComparableClicked}
                                onRemoveComparableClicked={this.props.onRemoveComparableClicked}
                                onRemoveDCAClicked={this.props.onRemoveDCAClicked}
                                onRemoveCapRateClicked={this.props.onRemoveCapRateClicked}
                                onAddDCAClicked={this.props.onAddDCAClicked}
                                onAddCapRateClicked={this.props.onAddCapRateClicked}
                                onDeleteComparable={(comp) => this.onRemoveComparableClicked(comp)}
                                last={index===this.state.comparableSales.length-1}
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
                        this.state.comparableSales.length === 0 ? <div className="card b no-comparables-found">
                            <div className="card-body">
                                <span>{this.props.noCompMessage}</span>
                            </div>
                        </div> : null
                    }
                </div>
                </div>
                {
                    this.props.statsPosition === "below" ? <div><br/>
                        <ComparableSalesStatistics
                            appraisal={this.props.appraisal}
                            comparableSales={this.state.comparableSales}
                            title={this.props.statsTitle}
                            stats={statsFields}
                        /></div> : null
                }
            </div>
        );
    }
}


export default ComparableSaleList;
