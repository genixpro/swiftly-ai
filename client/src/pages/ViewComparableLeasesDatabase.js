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

class ViewComparableSalesDatabase extends React.Component {
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

    getDefaultMapParams()
    {
        const mapParams = {
            defaultCenter: {
                lat: 41.3625202,
                lng: -100.5995477
            },
            defaultZoom: 12
        };

        if (this.props.appraisal.location)
        {
            mapParams.defaultCenter.lng = this.props.appraisal.location.coordinates[0];
            mapParams.defaultCenter.lat = this.props.appraisal.location.coordinates[1];
        }

        return mapParams;
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

    toggleComparablePopover(comp)
    {
        comp.visible = !comp.visible;
        this.setState({comparableLeases: this.state.comparableLeases});
    }

    onMapChanged(location)
    {
        const top = location.bounds.ne.lat;
        const bottom = location.bounds.sw.lat;

        const left = location.bounds.ne.lng;
        const right = location.bounds.sw.lng;

        const height = bottom - top;
        const width = right - left;

        this.mapSearch = {
            "locationTop": top - height/2,
            "locationBottom": bottom + height/2,
            "locationLeft": left - width/2,
            "locationRight": right + width/2
        };

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
                        <div className={"map-container"}>
                            <GoogleMapReact
                                bootstrapURLKeys={{ key: "AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I" }}
                                defaultCenter={this.getDefaultMapParams().defaultCenter}
                                defaultZoom={this.getDefaultMapParams().defaultZoom}
                                onChange={(location) => this.onMapChanged(location)}
                            >
                                {
                                    this.state.comparableLeases.map((comp) =>
                                    {
                                        if (!comp.location)
                                        {
                                            return;
                                        }

                                        const id = "comp-" + comp._id['$oid'];
                                        return <div
                                            key={id}
                                            lat={comp.location.coordinates[1]}
                                            lng={comp.location.coordinates[0]}
                                        >
                                            <img
                                                id={id}
                                                className={"building-map-icon"}
                                                src={"/img/building-icon.png"}
                                                text={comp.name}
                                                onClick={() => this.toggleComparablePopover(comp)}
                                            />
                                            <Popover placement="right" isOpen={comp.visible} target={id} toggle={() => this.toggleComparablePopover(comp)}>
                                                <PopoverBody>
                                                    <ComparableLeaseListItem
                                                        comparableLease={comp}
                                                        history={this.props.history}
                                                        edit={false}
                                                        openByDefault={true}
                                                        appraisalId={this.props.appraisalId}
                                                        appraisalComparables={this.props.appraisal.comparableLeases}
                                                        onAddComparableClicked={(comp) => this.addComparableToAppraisal(comp)}
                                                        onRemoveComparableClicked={(comp) => this.removeComparableFromAppraisal(comp)}
                                                    />
                                                </PopoverBody>
                                            </Popover>
                                        </div>
                                    })
                                }
                            </GoogleMapReact>
                        </div>
                    </Col>
                </Row>
            </div>
        ];
    }
}

export default ViewComparableSalesDatabase;
