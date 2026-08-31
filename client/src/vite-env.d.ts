/// <reference types="vite/client" />

interface Window {
    __SWIFTLY_API_BASE_URL__?: string;
    __SWIFTLY_GOOGLE_MAPS_API_KEY__?: string;
}

declare module 'google-map-react' {
    import type {ComponentType, ReactNode} from 'react';

    interface GoogleMapReactProps {
        bootstrapURLKeys: {key: string};
        defaultCenter: {lat: number; lng: number};
        defaultZoom: number;
        onChange?: (location: unknown) => void;
        children?: ReactNode;
    }

    const GoogleMapReact: ComponentType<GoogleMapReactProps>;
    export default GoogleMapReact;
}
