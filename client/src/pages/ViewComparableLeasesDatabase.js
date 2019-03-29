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
        this.loadData();
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

        return [
            <div className={"view-comparables-database"}>
                <Row>
                    <Col xs={12}>
                        <h3>Search for Comparables</h3>
                    </Col>
                </Row>
                <ComparableLeaseSearch onChange={(search) => this.onSearchChanged(search)}/>
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
                                // bootstrapURLKeys={{ key: "AIzaSyBBDqwdD-bi1UZI0tJag5KDQPV2Rt1I-lM" }}
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
                                                        comparableSale={comp}
                                                        history={this.props.history}
                                                        edit={false}
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
