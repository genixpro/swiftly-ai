import React from 'react';
import {Row, Col, Card, CardBody, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import axios from 'axios';
import ComparableLeaseList from "./components/ComparableLeaseList";
import Promise from 'bluebird';
import _ from 'underscore';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import ComparableLeaseSearch from "./components/ComparableLeaseSearch";
import GoogleMapReact from 'google-map-react';
import ComparableLeaseListItem from "./components/ComparableLeaseListItem"
import ComparableLeasesMap from "./components/ComparableLeasesMap";

class ViewComparableLeasesDatabase extends React.Component {
    state = {
        comparableLeases: []
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
            "leaseDateFrom": new Date(Date.now() - (1000 * 3600 * 24 * 365 * 2))
        };

        const unitsWithSize = _.filter(this.props.appraisal.units, (unit) => _.isNumber(unit.squareFootage));
        if (unitsWithSize.length > 0)
        {
            defaultSearch["sizeOfUnitFrom"] = Math.round(_.min(unitsWithSize, (unit) => unit.squareFootage).squareFootage * 0.8 / 100) * 100;
            defaultSearch["sizeOfUnitTo"] = Math.round(_.max(unitsWithSize, (unit) => unit.squareFootage).squareFootage * 1.2 / 100) * 100;
        }

        const unitsWithSizeRent = _.filter(unitsWithSize, (unit) => _.isNumber(unit.squareFootage) && !_.isUndefined(unit.currentTenancy));
        if (unitsWithSizeRent.length > 0)
        {
            const minRentUnit = _.min(unitsWithSizeRent, (unit) => unit.currentTenancy.yearlyRent / unit.squareFootage);
            const maxRentUnit = _.max(unitsWithSizeRent, (unit) => unit.currentTenancy.yearlyRent / unit.squareFootage);

            defaultSearch["yearlyRentFrom"] = Math.round(minRentUnit.currentTenancy.yearlyRent / minRentUnit.squareFootage * 0.8);
            defaultSearch["yearlyRentTo"] = Math.round(maxRentUnit.currentTenancy.yearlyRent / maxRentUnit.squareFootage * 1.2);
        }

        if (this.props.appraisal.propertyType)
        {
            defaultSearch['propertyType'] = this.props.appraisal.propertyType;
        }

        return defaultSearch;
    }


    loadData()
    {
        const params = _.extend({}, this.search, this.mapSearch);

        axios.get(`/comparable_leases`, {params: params}).then((response) => {
            // console.log(response.data.comparableLeases);
            this.setState({comparableLeases: response.data.comparableLeases})
        });
    }


    createNewComparable(newComparable)
    {
        const comparables = this.state.comparableLeases;
        comparables.splice(0, 0, newComparable);
        this.setState({comparableLeases: comparables});
    }

    onComparablesChanged(comps)
    {
        this.setState({comparableLeases: comps});
    }

    addComparableToAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        appraisal.comparableLeases.push(comp._id['$oid']);
        appraisal.comparableLeases = _.clone(appraisal.comparableLeases);
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
        for (let i = 0; i < appraisal.comparableLeases.length; i += 1)
        {
            if (appraisal.comparableLeases[i] === comp._id['$oid'])
            {
                appraisal.comparableLeases.splice(i, 1);
                break;
            }
        }
        appraisal.comparableLeases = _.clone(appraisal.comparableLeases);
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
                <ComparableLeaseSearch onChange={(search) => this.onSearchChanged(search)} defaultSearch={this.defaultSearch}/>
                <Row>
                    <Col xs={6}>
                        <ComparableLeaseList comparableLeases={this.state.comparableLeases}
                                            allowNew={true}
                                            history={this.props.history}
                                            appraisalId={this.props.match.params._id}
                                            appraisalComparables={this.props.appraisal.comparableLeases}
                                            onAddComparableClicked={(comp) => this.addComparableToAppraisal(comp)}
                                            onRemoveComparableClicked={(comp) => this.removeComparableFromAppraisal(comp)}
                                            onNewComparable={(comp) => this.createNewComparable(comp)}
                                            onChange={(comps) => this.onComparablesChanged(comps)}
                        />
                    </Col>
                    <Col xs={6}>
                        <ComparableLeasesMap
                            appraisal={this.props.appraisal}
                            comparableLeases={this.state.comparableLeases}
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

export default ViewComparableLeasesDatabase;
