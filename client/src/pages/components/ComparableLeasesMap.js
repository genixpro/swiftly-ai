import React from 'react';
import { Popover, PopoverBody, Button} from 'reactstrap';
import GoogleMapReact from 'google-map-react';
import ComparableLeaseListItem from "./ComparableLeaseListItem"

class ComparableLeasesMap extends React.Component {
    state = {
        comparableLeases: []
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
        this.setState({comparableLeases: this.state.comparableLeases});
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

    toggleFullscreen()
    {
        if (this.fullscreen)
        {
            document.exitFullscreen();
            this.fullscreen = false;
        }
        else
        {
            document.getElementById("comparable-leases-map").requestFullscreen();
            this.fullscreen = true;
        }
    }

    render()
    {
        if (!this.props.appraisal)
        {
            return null;
        }

        return [
            <div className={"comparable-leases-map"} id={"comparable-leases-map"}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: "AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I" }}
                    defaultCenter={this.getDefaultMapParams().defaultCenter}
                    defaultZoom={this.getDefaultMapParams().defaultZoom}
                    onChange={(location) => this.onMapChanged(location)}
                >
                    {
                        this.props.appraisal.location ?
                            <div
                                lat={this.props.appraisal.location.coordinates[1]}
                                lng={this.props.appraisal.location.coordinates[0]}>
                                <div
                                    style={{"position": "absolute", "top": "-25px", "background-color": "lightgrey", "width": "55px", "height": "25px", "margin-left": "15px", "padding": "5px", "color": "black", "border": "2px black solid"}}
                                >
                                    <span>Subject</span>
                                </div>
                                <img alt={"Subject"} src={"img/button.svg"} style={{"width": "15px", "position": "relative", "top": "-7.5px", "left": "-7.5px"}}/>
                            </div> : null
                    }
                    {
                        this.props.comparableLeases.map((comp) =>
                        {
                            if (!comp.location)
                            {
                                return null;
                            }

                            const id = "comp-" + comp._id;
                            return <div
                                key={id}
                                lat={comp.location.coordinates[1]}
                                lng={comp.location.coordinates[0]}
                            >
                                <img
                                    id={id}
                                    alt={"Comparable Lease Icon"}
                                    className={"building-map-icon"}
                                    src={"/img/building-icon.png"}
                                    text={comp.name}
                                    onClick={() => this.toggleComparablePopover(comp)}
                                />
                                <Popover placement="right" isOpen={comp.visible} target={id} toggle={() => this.toggleComparablePopover(comp)} container={"comparable-leases-map"}>
                                    <PopoverBody>
                                        <ComparableLeaseListItem
                                            headers={[]}
                                            comparableLease={comp}
                                            history={this.props.history}
                                            edit={false}
                                            openByDefault={true}
                                            appraisal={this.props.appraisal}
                                            appraisalId={this.props.appraisalId}
                                            appraisalComparables={this.props.appraisal.comparableLeases}
                                            onAddComparableClicked={(comp) => this.props.onAddComparableToAppraisal(comp)}
                                            onRemoveComparableClicked={(comp) => this.props.onRemoveComparableFromAppraisal(comp)}
                                        />
                                    </PopoverBody>
                                </Popover>
                            </div>
                        })
                    }
                </GoogleMapReact>
                <div className={"full-screen-button"} onClick={() => this.toggleFullscreen()}>
                    <Button color={"secondary"}><i className={"fa fa-expand"} /> </Button>
                </div>
            </div>
        ];
    }
}

export default ComparableLeasesMap;
