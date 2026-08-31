import React, {useReducer, useRef} from 'react';
import { Popover, PopoverBody, Button} from 'reactstrap';
import GoogleMapReact from 'google-map-react';
import ComparableLeaseListItem from "./ComparableLeaseListItem"
import OpenStreetMapFallback from "./OpenStreetMapFallback";
import GoogleMapMarker from '@components/platform/GoogleMapMarker';
import {exitBrowserFullscreen, googleMapsApiKey, requestBrowserFullscreen} from '../../components/platform/mapBrowser';
import type {ComparableLeaseCardRecord} from '../../domain/comparableLeaseDraft';

type MapComparableLease = ComparableLeaseCardRecord & {_id: string};

interface MapAppraisal {
    comparableLeases?: string[] | null;
    location?: ComparableLeaseCardRecord['location'];
}

interface MapBoundsChange {
    bounds: {
        ne: {lat: number; lng: number};
        sw: {lat: number; lng: number};
    };
}

interface ComparableLeaseMapSearch extends Record<string, unknown> {
    locationTop: number;
    locationBottom: number;
    locationLeft: number;
    locationRight: number;
}

interface ComparableLeasesMapProps {
    appraisal?: MapAppraisal | null;
    comparableLeases: MapComparableLease[];
    appraisalId?: string;
    navigate?: unknown;
    search?: string;
    onMapSearchChanged?(search: ComparableLeaseMapSearch): void;
    onAddComparableToAppraisal?: (comparable: MapComparableLease) => void;
    onRemoveComparableFromAppraisal?: (comparable: MapComparableLease) => void;
}

function ComparableLeasesMap(props: ComparableLeasesMapProps) {
    const [, rerender] = useReducer((version: number) => version + 1, 0);
    const fullscreen = useRef(false);
    const mapRef = useRef<HTMLDivElement | null>(null);

    function getDefaultMapParams()
    {
        const mapParams = {
            defaultCenter: {
                lat: 41.3625202,
                lng: -100.5995477
            },
            defaultZoom: 5
        };

        const appraisal = props.appraisal!;
        if (appraisal.location)
        {
            mapParams.defaultCenter.lng = appraisal.location.coordinates[0];
            mapParams.defaultCenter.lat = appraisal.location.coordinates[1];
            mapParams.defaultZoom = 11;
        }

        return mapParams;
    }

    function toggleComparablePopover(comp: MapComparableLease)
    {
        comp.visible = !comp.visible;
        rerender();
    }

    function onMapChanged(location: MapBoundsChange)
    {
        if (props.onMapSearchChanged)
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

            props.onMapSearchChanged(mapSearch);
        }
    }

    function toggleFullscreen()
    {
        if (fullscreen.current)
        {
            exitBrowserFullscreen();
            fullscreen.current = false;
        }
        else
        {
            requestBrowserFullscreen(mapRef.current);
            fullscreen.current = true;
        }
    }

    if (!props.appraisal)
    {
        return null;
    }
    const appraisal = props.appraisal;

    const mapsApiKey = googleMapsApiKey();
    if (!mapsApiKey)
    {
        return <OpenStreetMapFallback subject={appraisal} comparables={props.comparableLeases} label="Comparable leases" />;
    }

    return [
        <div key="comparable-leases-map" ref={mapRef} className={"comparable-leases-map"} id={"comparable-leases-map"}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: mapsApiKey }}
                    defaultCenter={getDefaultMapParams().defaultCenter}
                    defaultZoom={getDefaultMapParams().defaultZoom}
                    onChange={(location) => onMapChanged(location as unknown as MapBoundsChange)}
                >
                    {
                        appraisal.location ?
                            <GoogleMapMarker
                                lat={appraisal.location.coordinates[1]}
                                lng={appraisal.location.coordinates[0]}>
                                <div
                                    style={{position: 'absolute', top: '-25px', backgroundColor: 'lightgrey', width: '55px', height: '25px', marginLeft: '15px', padding: '5px', color: 'black', border: '2px black solid'}}
                                >
                                    <span>Subject</span>
                                </div>
                                <img alt={"Subject"} src={"img/button.svg"} style={{"width": "15px", "position": "relative", "top": "-7.5px", "left": "-7.5px"}}/>
                            </GoogleMapMarker> : null
                    }
                    {
                        props.comparableLeases.map((comp) =>
                        {
                            if (!comp.location)
                            {
                                return null;
                            }

                            const id = "comp-" + comp._id;
                            return <GoogleMapMarker
                                key={id}
                                lat={comp.location.coordinates[1]}
                                lng={comp.location.coordinates[0]}
                            >
                                <img
                                    id={id}
                                    alt={"Comparable Lease Icon"}
                                    className={"building-map-icon"}
                                    src={"/img/building-icon.png"}
                                    {...({text: comp.name} as unknown as React.ImgHTMLAttributes<HTMLImageElement>)}
                                    onClick={() => toggleComparablePopover(comp)}
                                />
                                <Popover placement="right" isOpen={comp.visible} target={id} toggle={() => toggleComparablePopover(comp)} container={"comparable-leases-map"}>
                                    <PopoverBody>
                                        <ComparableLeaseListItem
                                            headers={[]}
                                            comparableLease={comp}
                                            navigate={props.navigate} search={props.search}
                                            edit={false}
                                            openByDefault={true}
                                            appraisal={appraisal}
                                            appraisalId={props.appraisalId}
                                            appraisalComparables={appraisal.comparableLeases}
                                            onAddComparableClicked={(comparable) => props.onAddComparableToAppraisal!(comparable as MapComparableLease)}
                                            onRemoveComparableClicked={(comparable) => props.onRemoveComparableFromAppraisal!(comparable as MapComparableLease)}
                                        />
                                    </PopoverBody>
                                </Popover>
                            </GoogleMapMarker>
                        })
                    }
                </GoogleMapReact>
                <div className={"full-screen-button"} onClick={() => toggleFullscreen()}>
                    <Button color={"secondary"}><i className={"fa fa-expand"} /> </Button>
                </div>
            </div>
    ];
}

export default ComparableLeasesMap;
