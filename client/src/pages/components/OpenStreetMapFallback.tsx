
const DEFAULT_CENTER = {lat: 43.6532, lng: -79.3832};

interface MappableItem {
    _id?: string;
    address?: string | null;
    tenantName?: string | null;
    location?: {coordinates?: unknown} | null;
}

interface Coordinates {
    lat: number;
    lng: number;
}

function coordinates(item: MappableItem | null | undefined): Coordinates | null {
    const value = item?.location?.coordinates;
    if (!Array.isArray(value) || value.length < 2) return null;
    const [lng, lat] = value.map(Number);
    return Number.isFinite(lat) && Number.isFinite(lng) ? {lat, lng} : null;
}

function mapUrl(center: Coordinates): string {
    const span = 0.1;
    const bbox = [center.lng - span, center.lat - span, center.lng + span, center.lat + span].join('%2C');
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
}

export default function OpenStreetMapFallback({
    subject,
    comparables = [],
    label,
}: {
    subject?: MappableItem | null;
    comparables?: MappableItem[];
    label: string;
}) {
    const subjectLocation = coordinates(subject);
    const points = comparables.map((comparable) => ({comparable, location: coordinates(comparable)})).filter((point): point is {comparable: MappableItem; location: Coordinates} => Boolean(point.location));
    const center = subjectLocation || points[0]?.location || DEFAULT_CENTER;

    return <div className="comparable-map-fallback">
        <iframe title={`${label} map`} src={mapUrl(center)} style={{border: 0, height: '360px', width: '100%'}} loading="lazy" />
        <div className="mt-2 small">
            {subjectLocation && <a href={`https://www.openstreetmap.org/?mlat=${subjectLocation.lat}&mlon=${subjectLocation.lng}#map=14/${subjectLocation.lat}/${subjectLocation.lng}`} target="_blank" rel="noreferrer">Subject property</a>}
            {points.map(({comparable, location}) => <span key={comparable._id} className="ms-3">
                <a href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=14/${location.lat}/${location.lng}`} target="_blank" rel="noreferrer">{comparable.address || comparable.tenantName || 'Comparable'}</a>
            </span>)}
            {!subjectLocation && !points.length && <span>Add locations to the subject or comparables to place them on the map.</span>}
        </div>
    </div>;
}
