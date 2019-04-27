import React from 'react';
import ComparableSaleListItem from './ComparableSaleListItem';
import {Row, Col, CardHeader, CardTitle} from 'reactstrap';
import ComparableSalesStatistics from "./ComparableSalesStatistics"
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SortDirection from "./SortDirection";
import ComparableSaleModel from "../../models/ComparableSaleModel";
import axios from "axios/index";


class ComparableSaleList extends React.Component
{
    static defaultProps = {
        "statsPosition": "above",
        showPropertyTypeInHeader: true,
        "noCompMessage": "There are no comparables. Please add a new one or change your search settings."
    };

    state = {
        comparableSales: [],
        newComparableSale: ComparableSaleModel.create({}),
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
        axios.post(`/comparable_sales`, newComparable).then((response) =>
        {
            newComparable["_id"] = response.data._id;
            newComparable[ComparableSaleListItem._newSale] = true;

            this.props.onNewComparable(newComparable);
            this.setState({isCreatingNewItem: false, newComparableSale: ComparableSaleModel.create({})})
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
        return <div className="card b new-comparable" onClick={() => this.toggleCreateNewItem()}>
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

        return (
            <div>
                {
                    this.props.statsPosition === "above" ? <ComparableSalesStatistics appraisal={this.props.appraisal} comparableSales={this.state.comparableSales}  title={this.props.statsTitle}/> : null
                }
                <div>
                {
                    <div className={`card b comparable-sale-list-header`}>
                        <CardHeader className={`comparable-sale-list-item-header ${firstSpacing}`}>
                            <CardTitle>
                                <Row>
                                    <Col xs={1} className={`header-field-column`} onClick={() => this.changeSortColumn("saleDate")}>
                                        Date <SortDirection field={"saleDate"} sort={this.props.sort} />
                                    </Col>
                                    <Col xs={3} className={"header-field-column"} onClick={() => this.changeSortColumn("address")}>
                                        Address <SortDirection field={"address"} sort={this.props.sort} />
                                    </Col>

                                    {
                                        this.props.appraisal.propertyType !== "land" ?
                                            <Col xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("sizeSquareFootage")}>
                                                Building Size (sf) <SortDirection field={"sizeSquareFootage"} sort={this.props.sort}/>
                                            </Col> : null
                                    }
                                    {
                                        this.props.appraisal.propertyType === "land" ?
                                            <Col xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("sizeOfLandAcres")}>
                                                Site Area (acres) <SortDirection field={"sizeOfLandAcres"} sort={this.props.sort}/>
                                                <br/>
                                                Buildable Area (sqft)
                                            </Col> : null
                                    }
                                    <Col xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("salePrice")}>
                                        Sale Price <SortDirection field={"salePrice"} sort={this.props.sort} />
                                    </Col>
                                    {
                                        this.props.showPropertyTypeInHeader ?
                                            <Col xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("propertyType")}>
                                                Property Type <SortDirection field={"propertyType"} sort={this.props.sort} />
                                                <br/>
                                                Sub Type
                                            </Col> : null
                                    }
                                    {
                                        this.props.appraisal.propertyType !== "land" ?
                                            this.props.showPropertyTypeInHeader ?
                                                <Col xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("capitalizationRate")}>
                                                    Cap Rate (%) <SortDirection field={"capitalizationRate"} sort={this.props.sort} />
                                                    <br/>
                                                    PSF ($)
                                                </Col> : [
                                                    <Col key={1} xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("capitalizationRate")}>
                                                        Cap Rate (%) <SortDirection field={"capitalizationRate"} sort={this.props.sort} />
                                                    </Col>,
                                                    <Col key={2} xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("pricePerSquareFoot")}>
                                                        PSF ($) <SortDirection field={"pricePerSquareFoot"} sort={this.props.sort} />
                                                    </Col>
                                                ]
                                            : null
                                    }
                                    {
                                        this.props.appraisal.propertyType === "land" ?
                                            this.props.showPropertyTypeInHeader ?
                                                <Col xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("pricePerAcreLand")}>
                                                    Price Per Acre ($) <SortDirection field={"pricePerAcreLand"} sort={this.props.sort} />
                                                    <br/>
                                                    PSF Buildable Area ($)
                                                </Col> : [
                                                    <Col key={1} xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("pricePerAcreLand")}>
                                                        Price Per Acre ($) <SortDirection field={"pricePerAcreLand"} sort={this.props.sort} />
                                                    </Col>,
                                                    <Col key={2} xs={2} className={"header-field-column"} onClick={() => this.changeSortColumn("pricePerSquareFootBuildableArea")}>
                                                        PSF Buildable Area ($) <SortDirection field={"pricePerSquareFootBuildableArea"} sort={this.props.sort} />
                                                    </Col>
                                                ]
                                            : null
                                    }
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
                                    <ComparableSaleListItem comparableSale={this.state.newComparableSale}
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
                    this.state.comparableSales.map((comparableSale, index) =>
                    {
                        if (excludeIds.indexOf(comparableSale._id) === -1)
                        {
                            return <ComparableSaleListItem
                                key={comparableSale._id}
                                comparableSale={comparableSale}
                                history={this.props.history}
                                appraisal={this.props.appraisal}
                                showPropertyTypeInHeader={this.props.showPropertyTypeInHeader}
                                onChange={(comp) => this.updateComparable(comp, index)}
                                onAddComparableClicked={this.props.onAddComparableClicked}
                                onRemoveComparableClicked={this.props.onRemoveComparableClicked}
                                onRemoveDCAClicked={this.props.onRemoveDCAClicked}
                                onRemoveCapRateClicked={this.props.onRemoveCapRateClicked}
                                onAddDCAClicked={this.props.onAddDCAClicked}
                                onAddCapRateClicked={this.props.onAddCapRateClicked}
                                onDeleteComparable={(comp) => this.onRemoveComparableClicked(comp)}
                                appraisalId={this.props.appraisalId}
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
                    this.props.statsPosition === "below" ? <div><br/><ComparableSalesStatistics appraisal={this.props.appraisal} comparableSales={this.state.comparableSales}  title={this.props.statsTitle}/></div> : null
                }
            </div>
        );
    }
}


export default ComparableSaleList;
