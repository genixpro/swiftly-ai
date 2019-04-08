import React from 'react';
import {Row, Col, Card, CardBody, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import axios from 'axios';
import ComparableSaleList from "./components/ComparableSaleList";
import Promise from 'bluebird';
import _ from 'underscore';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import ComparableSaleSearch from "./components/ComparableSaleSearch";
import GoogleMapReact from 'google-map-react';
import ComparableSaleListItem from "./components/ComparableSaleListItem"
import ComparableSalesMap from "./components/ComparableSalesMap"
import ComparableSalesModel from "../models/ComparableSaleModel"

class ViewComparableSalesDatabase extends React.Component {
    state = {
        comparableSales: []
    };

    search = {};
    mapSearch = {};

    componentDidMount()
    {
        this.search = this.getDefaultSearchParams();
    }

    getDefaultSearchParams()
    {
        const defaultSearch = {
            "saleDateFrom": new Date(Date.now() - (1000 * 3600 * 24 * 365 * 2))
        };

        if (this.props.appraisal.propertyType)
        {
            defaultSearch['propertyType'] = this.props.appraisal.propertyType;
        }

        return defaultSearch;
    }


    loadData()
    {
        const params = _.extend({}, this.search, this.mapSearch);

        axios.get(`/comparable_sales`, {params: params}).then((response) => {
            // console.log(response.data.comparableSales);
            this.setState({comparableSales: response.data.comparableSales.map((comp) => new ComparableSalesModel(comp))}, () => console.log(this.state.comparableSales))
        });
    }


    createNewComparable(newComparable)
    {
        const comparables = this.state.comparableSales;
        comparables.splice(0, 0, newComparable);
        this.setState({comparableSales: comparables});
    }

    onComparablesChanged(comps)
    {
        this.setState({comparableSales: comps});
    }

    addComparableToAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        appraisal.comparableSales.push(comp._id);
        appraisal.comparableSales = _.clone(appraisal.comparableSales);
        this.props.saveDocument(appraisal);
    }

    onSearchChanged(search)
    {
        this.search = search;
        this.loadData();
    }


    removeComparableFromAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        for (let i = 0; i < appraisal.comparableSales.length; i += 1)
        {
            if (appraisal.comparableSales[i] === comp._id)
            {
                appraisal.comparableSales.splice(i, 1);
                break;
            }
        }
        appraisal.comparableSales = _.clone(appraisal.comparableSales);
        this.props.saveDocument(appraisal);
    }

    onMapSearchChanged(mapSearch)
    {
        this.mapSearch = mapSearch;
        this.loadData();
    }

    render()
    {
        if (!this.props.appraisal)
        {
            return null;
        }

        if (!this.defaultSearch)
        {
            this.defaultSearch = this.getDefaultSearchParams();
        }

        return [
            <div className={"view-comparables-database"}>
                <Row>
                    <Col xs={12}>
                        <h3>Search for Comparables</h3>
                    </Col>
                </Row>
                <ComparableSaleSearch
                    appraisal={this.props.appraisal}
                    onChange={(search) => this.onSearchChanged(search)}
                    defaultSearch={this.defaultSearch}
                />
                <Row>
                    <Col xs={8}>
                        <ComparableSaleList comparableSales={this.state.comparableSales}
                                            statsTitle={"Region Statistics"}
                                            allowNew={true}
                                            history={this.props.history}
                                            appraisal={this.props.appraisal}
                                            appraisalId={this.props.match.params._id}
                                            appraisalComparables={this.props.appraisal.comparableSales}
                                            onAddComparableClicked={(comp) => this.addComparableToAppraisal(comp)}
                                            onRemoveComparableClicked={(comp) => this.removeComparableFromAppraisal(comp)}
                                            onNewComparable={(comp) => this.createNewComparable(comp)}
                                            onChange={(comps) => this.onComparablesChanged(comps)}
                        />
                    </Col>
                    <Col xs={4}>
                        <ComparableSalesMap
                            appraisal={this.props.appraisal}
                            comparableSales={this.state.comparableSales}
                            onMapSearchChanged={(mapSearch) => this.onMapSearchChanged(mapSearch)}
                            onAddComparableToAppraisal={(comp) => this.addComparableToAppraisal(comp)}
                            onRemoveComparableFromAppraisal={(comp) => this.removeComparableFromAppraisal(comp)}
                        />
                    </Col>
                </Row>
            </div>
        ];
    }
}

export default ViewComparableSalesDatabase;
