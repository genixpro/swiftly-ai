import React from 'react';
import {Row, Col} from 'reactstrap';
import axios from 'axios';
import ComparableSaleList from "./components/ComparableSaleList";
import _ from 'underscore';
import ComparableSaleSearch from "./components/ComparableSaleSearch";
import ComparableSalesMap from "./components/ComparableSalesMap"
import ComparableSalesModel from "../models/ComparableSaleModel"

class ViewComparableSalesDatabase extends React.Component {
    state = {
        comparableSales: [],
        sort: "-saleDate"
    };

    search = {};
    mapSearch = {};

    constructor()
    {
        super();
    }

    componentDidMount()
    {
        this.search = this.getDefaultSearchParams();
        this.setState({search: this.getDefaultSearchParams()});
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

        params['sort'] = this.state.sort;

        axios.get(`/comparable_sales`, {params: params}).then((response) => {
            this.setState({comparableSales: response.data.comparableSales.map((comp) => ComparableSalesModel.create(comp))})
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
        appraisal.comparableSalesCapRate.push(comp._id);
        appraisal.comparableSalesCapRate = _.clone(appraisal.comparableSalesCapRate);

        appraisal.comparableSalesDCA.push(comp._id);
        appraisal.comparableSalesDCA = _.clone(appraisal.comparableSalesDCA);
        this.props.saveAppraisal(appraisal);
    }

    addComparableToDCA(comp)
    {
        const appraisal = this.props.appraisal;

        appraisal.comparableSalesDCA.push(comp._id);
        appraisal.comparableSalesDCA = _.clone(appraisal.comparableSalesDCA);
        this.props.saveAppraisal(appraisal);
    }

    addComparableToCapRate(comp)
    {
        const appraisal = this.props.appraisal;

        appraisal.comparableSalesCapRate.push(comp._id);
        appraisal.comparableSalesCapRate = _.clone(appraisal.comparableSalesCapRate);
        this.props.saveAppraisal(appraisal);
    }

    onSearchChanged(search)
    {
        this.search = search;
        this.setState({search: search});
        this.loadData();
    }


    removeComparableFromAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        for (let i = 0; i < appraisal.comparableSalesCapRate.length; i += 1)
        {
            if (appraisal.comparableSalesCapRate[i] === comp._id)
            {
                appraisal.comparableSalesCapRate.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < appraisal.comparableSalesDCA.length; i += 1)
        {
            if (appraisal.comparableSalesDCA[i] === comp._id)
            {
                appraisal.comparableSalesDCA.splice(i, 1);
                break;
            }
        }
        appraisal.comparableSalesCapRate = _.clone(appraisal.comparableSalesCapRate);
        appraisal.comparableSalesDCA = _.clone(appraisal.comparableSalesDCA);
        this.props.saveAppraisal(appraisal);
    }


    removeComparableFromDCA(comp)
    {
        const appraisal = this.props.appraisal;
        for (let i = 0; i < appraisal.comparableSalesDCA.length; i += 1)
        {
            if (appraisal.comparableSalesDCA[i] === comp._id)
            {
                appraisal.comparableSalesDCA.splice(i, 1);
                break;
            }
        }
        appraisal.comparableSalesDCA = _.clone(appraisal.comparableSalesDCA);
        this.props.saveAppraisal(appraisal);
    }


    removeComparableFromCapRate(comp)
    {
        const appraisal = this.props.appraisal;
        for (let i = 0; i < appraisal.comparableSalesCapRate.length; i += 1)
        {
            if (appraisal.comparableSalesCapRate[i] === comp._id)
            {
                appraisal.comparableSalesCapRate.splice(i, 1);
                break;
            }
        }
        appraisal.comparableSalesCapRate = _.clone(appraisal.comparableSalesCapRate);
        this.props.saveAppraisal(appraisal);
    }

    onMapSearchChanged(mapSearch)
    {
        this.mapSearch = mapSearch;
        this.loadData();
    }

    onSortChanged(newSort)
    {
        this.setState({sort: newSort}, () => this.loadData());
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
                                            sort={this.state.sort}
                                            search={this.state.search}
                                            onSortChanged={(field) => this.onSortChanged(field)}
                                            history={this.props.history}
                                            appraisal={this.props.appraisal}
                                            appraisalId={this.props.match.params._id}
                                            appraisalComparables={this.props.appraisal.comparableSales}
                                            onAddComparableClicked={(comp) => this.addComparableToAppraisal(comp)}
                                            onRemoveComparableClicked={(comp) => this.removeComparableFromAppraisal(comp)}
                                            onNewComparable={(comp) => this.createNewComparable(comp)}
                                            onChange={(comps) => this.onComparablesChanged(comps)}
                                            onRemoveDCAClicked={(comp) => this.removeComparableFromDCA(comp)}
                                            onRemoveCapRateClicked={(comp) => this.removeComparableFromCapRate(comp)}
                                            onAddDCAClicked={(comp) => this.addComparableToDCA(comp)}
                                            onAddCapRateClicked={(comp) => this.addComparableToCapRate(comp)}
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
