import React from 'react';
import {Row, Col, Card, CardBody, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import axios from 'axios';
import Promise from 'bluebird';
import _ from 'underscore';
import GoogleMapReact from 'google-map-react';
import ComparableSaleListItem from "./ComparableSaleListItem"

class ComparableSalesMap extends React.Component {
    state = {
        comparableSales: []
    };

    componentDidMount()
    {

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

        if (this.props.appraisal.location)
        {
            mapParams.defaultCenter.lng = this.props.appraisal.location.coordinates[0];
            mapParams.defaultCenter.lat = this.props.appraisal.location.coordinates[1];
            mapParams.defaultZoom = 12;
        }

        return mapParams;
    }

    toggleComparablePopover(comp)
    {
        comp.visible = !comp.visible;
        this.setState({comparableSales: this.state.comparableSales});
    }

    onMapChanged(location)
    {
        if (this.props.onMapSearchChanged)
        {
            const top = location.bounds.ne.lat;
            const bottom = location.bounds.sw.lat;

            const left = location.bounds.ne.lng;
            const right = location.bounds.sw.lng;

            const height = bottom - top;
            const width = right - left;

            const mapSearch = {
                "locationTop": top - height/2,
                "locationBottom": bottom + height/2,
                "locationLeft": left - width/2,
                "locationRight": right + width/2
            };

            this.props.onMapSearchChanged(mapSearch);
        }
    }

    render()
    {
        if (!this.props.appraisal)
        {
            return null;
        }

        return [
            <div className={"comparable-sales-map"}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: "AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I" }}
                    defaultCenter={this.getDefaultMapParams().defaultCenter}
                    defaultZoom={this.getDefaultMapParams().defaultZoom}
                    onChange={(location) => this.onMapChanged(location)}
                >
                    {
                        this.props.comparableSales.map((comp) =>
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
                                        <ComparableSaleListItem
                                            comparableSale={comp}
                                            history={this.props.history}
                                            edit={false}
                                            openByDefault={true}
                                            appraisalId={this.props.appraisalId}
                                            appraisalComparables={this.props.appraisal.comparableSales}
                                            onAddComparableClicked={(comp) => this.props.onAddComparableToAppraisal(comp)}
                                            onRemoveComparableClicked={(comp) => this.props.onRemoveComparableFromAppraisal(comp)}
                                        />
                                    </PopoverBody>
                                </Popover>
                            </div>
                        })
                    }
                </GoogleMapReact>
            </div>
        ];
    }
}

export default ComparableSalesMap;
