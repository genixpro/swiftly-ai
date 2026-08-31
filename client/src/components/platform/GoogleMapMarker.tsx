import type {ReactNode} from 'react';

interface GoogleMapMarkerProps {
    lat: number;
    lng: number;
    children: ReactNode;
}

/**
 * Keeps Google Map's positioning props at the third-party boundary instead
 * of forwarding them to a DOM element, while preserving the legacy marker
 * wrapper in the rendered map overlay.
 */
export default function GoogleMapMarker({lat: _lat, lng: _lng, children}: GoogleMapMarkerProps) {
    return <div>{children}</div>;
}
