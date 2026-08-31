import React, {type ComponentType, type ReactNode} from 'react';
import {Button, Popover, PopoverBody} from 'reactstrap';
import GoogleMapReact from 'google-map-react';
import GoogleMapMarker from '@components/platform/GoogleMapMarker';
import {googleMapsApiKey} from '../../components/platform/mapBrowser';
import type {ComparableSaleCardRecord} from '../../domain/comparableSaleCard';

interface ComparableSaleMapPickerProps {
    comparableSale: ComparableSaleCardRecord;
    popoverId: string;
    open?: boolean;
    isDraggingPin: boolean;
    droppingPinX: number;
    droppingPinY: number;
    mapParams: {defaultCenter: {lat: number; lng: number}; defaultZoom: number};
    onToggle: () => void;
    onMouseMove: (event: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
    onMapClick: (event: {lng: number; lat: number}) => void;
}

interface GoogleMapPickerAdapterProps {
    bootstrapURLKeys: {key: string};
    children?: ReactNode;
    defaultCenter: {lat: number; lng: number};
    defaultZoom: number;
    onClick(event: {lng: number; lat: number}): void;
}

// The package declarations omit the legacy onClick callback shape used by the
// pin-placement workflow. Keep that compatibility isolated at this boundary.
const GoogleMapPicker = GoogleMapReact as unknown as ComponentType<GoogleMapPickerAdapterProps>;

/** Presentation-only map picker retaining the existing pin placement interactions. */
export default function ComparableSaleMapPicker({
    comparableSale,
    popoverId,
    open,
    isDraggingPin,
    droppingPinX,
    droppingPinY,
    mapParams,
    onToggle,
    onMouseMove,
    onMouseLeave,
    onMapClick,
}: ComparableSaleMapPickerProps) {
    return <div className={"place-pin-on-map-button-container"}>
        <Button onClick={onToggle} id={`place-pin-on-map-button-${popoverId}`}>Place Pin on Map</Button>
        <Popover placement="bottom" isOpen={open} target={`place-pin-on-map-button-${popoverId}`} toggle={onToggle} className={"place-pin-on-map-popover"}>
            <PopoverBody>
                <div id="place-pin-body-wrapper" className={"place-pin-body-wrapper"} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
                    <GoogleMapPicker
                        bootstrapURLKeys={{key: googleMapsApiKey()}}
                        defaultCenter={mapParams.defaultCenter}
                        defaultZoom={mapParams.defaultZoom}
                        onClick={onMapClick}
                    >
                        {comparableSale.location ? <GoogleMapMarker
                        lat={comparableSale.location.coordinates[1]}
                        lng={comparableSale.location.coordinates[0]}
                    >
                        <img alt={"Droppable Map Pin"} className={"current-building-map-icon"} src={"/img/building-icon.png"}/>
                        </GoogleMapMarker> : null}
                    </GoogleMapPicker>
                    {isDraggingPin ? <div style={{"left": `${droppingPinX}px`, "top": `${droppingPinY}px`, "position": "absolute"}}>
                        <img alt={"Droppable Map Pin"} className={"pin-map-icon"} src={"/img/building-icon.png"}/>
                    </div> : null}
                </div>
                <Button color={'primary'} onClick={onToggle} className={"close-button"}>Close</Button>
            </PopoverBody>
        </Popover>
    </div>;
}
