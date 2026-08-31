import {useReducer, useRef} from 'react';
import { Button, Popover, PopoverBody} from 'reactstrap';
import GoogleMapReact from 'google-map-react';
import ComparableSaleListItem from "./ComparableSaleListItem"
import OpenStreetMapFallback from "./OpenStreetMapFallback";
import GoogleMapMarker from '@components/platform/GoogleMapMarker';
import {exitBrowserFullscreen, googleMapsApiKey, requestBrowserFullscreen} from '../../components/platform/mapBrowser';
import type {ComparableSaleCardRecord} from '../../domain/comparableSaleCard';

type MapComparableSale = ComparableSaleCardRecord & {_id: string; visible?: boolean};

interface MapAppraisal {
    comparableSales?: string[] | null;
    location?: ComparableSaleCardRecord['location'];
}

interface MapBoundsChange {
    bounds: {ne: {lat: number; lng: number}; sw: {lat: number; lng: number}};
}

interface ComparableSalesMapProps {
    appraisal?: MapAppraisal | null;
    comparableSales: MapComparableSale[];
    appraisalId?: string;
    navigate?: unknown;
    search?: unknown;
    onMapSearchChanged?(search: Record<string, number>): void;
    onAddComparableToAppraisal?: (comparable: MapComparableSale) => void;
    onRemoveComparableFromAppraisal?: (comparable: MapComparableSale) => void;
}

function ComparableSalesMap(props: ComparableSalesMapProps) {
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

    function toggleComparablePopover(comp: MapComparableSale)
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
        return <OpenStreetMapFallback subject={appraisal} comparables={props.comparableSales} label="Comparable sales" />;
    }

    return [
        <div key="comparable-sales-map" ref={mapRef} className={"comparable-sales-map"} id={"comparable-sales-map"}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: mapsApiKey }}
                    defaultCenter={getDefaultMapParams().defaultCenter}
                    defaultZoom={getDefaultMapParams().defaultZoom}
                    onChange={(location) => onMapChanged(location as MapBoundsChange)}
                >
                    {
                        appraisal.location ?
                            <GoogleMapMarker
                                lat={appraisal.location.coordinates[1]}
                                lng={appraisal.location.coordinates[0]}>
                                <div
                                    style={{"position": "absolute", "top": "-25px", "backgroundColor": "lightgrey", "width": "55px", "height": "25px", "marginLeft": "15px", "padding": "5px", "color": "black", "border": "2px black solid"}}
                                >
                                    <span>Subject</span>
                                </div>
                                <img alt={"Subject"} src={"img/button.svg"} style={{"width": "15px", "position": "relative", "top": "-7.5px", "left": "-7.5px"}}/>
                            </GoogleMapMarker> : null
                    }
                    {
                        props.comparableSales.map((comp) =>
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
                                <button
                                    id={id}
                                    type="button"
                                    className="building-map-marker-button"
                                    aria-label={`Show comparable sale ${comp.name || comp._id}`}
                                    onClick={() => toggleComparablePopover(comp)}
                                >
                                    <img alt="" className="building-map-icon" src="/img/building-icon.png" />
                                </button>
                                <Popover placement="right" isOpen={comp.visible} target={id} toggle={() => toggleComparablePopover(comp)} container={"comparable-sales-map"}>
                                    <PopoverBody>
                                        <ComparableSaleListItem
                                            headers={[]}
                                            comparableSale={comp}
                                            navigate={props.navigate} search={props.search}
                                            edit={false}
                                            openByDefault={true}
                                            appraisal={appraisal}
                                            appraisalId={props.appraisalId}
                                            appraisalComparables={appraisal.comparableSales}
                                            onAddComparableClicked={(comparable) => props.onAddComparableToAppraisal!(comparable as MapComparableSale)}
                                            onRemoveComparableClicked={(comparable) => props.onRemoveComparableFromAppraisal!(comparable as MapComparableSale)}
                                        />
                                    </PopoverBody>
                                </Popover>
                            </GoogleMapMarker>
                        })
                    }
                </GoogleMapReact>
                <div className={"full-screen-button"}>
                    <Button color={"secondary"} onClick={() => toggleFullscreen()} aria-label="Toggle comparable sales map full screen">
                        <i className={"fa fa-expand"} aria-hidden="true" />
                    </Button>
                </div>
            </div>
    ];
}

export default ComparableSalesMap;
