import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import ComparableLeasesMap from './ComparableLeasesMap';
import ComparableSalesMap from './ComparableSalesMap';

vi.mock('google-map-react', () => ({
    default: ({children, onChange}) => <div data-testid="google-map">
        <button onClick={() => onChange({bounds: {ne: {lat: 10, lng: 30}, sw: {lat: 2, lng: 7}}})}>Map bounds changed</button>
        {children}
    </div>,
}));

vi.mock('reactstrap', () => ({
    Button: ({children, ...props}) => <button {...props}>{children}</button>,
    Popover: ({children, isOpen}) => isOpen ? <div data-testid="map-popover">{children}</div> : null,
    PopoverBody: ({children}) => <div>{children}</div>,
}));

vi.mock('./ComparableSaleListItem', () => ({
    default: ({comparableSale}) => <div>{comparableSale.address}</div>,
}));

vi.mock('./ComparableLeaseListItem', () => ({
    default: ({comparableLease}) => <div>{comparableLease.address}</div>,
}));

afterEach(() => {
    delete window.__SWIFTLY_GOOGLE_MAPS_API_KEY__;
});

describe('comparable map characterization', () => {
    const appraisal = {
        comparableSales: [],
        comparableLeases: [],
        location: {coordinates: [-79.4, 43.7]},
    };

    it('keeps the no-key map fallback and its accessible titles', () => {
        render(<>
            <ComparableSalesMap appraisal={appraisal} comparableSales={[]}/>
            <ComparableLeasesMap appraisal={appraisal} comparableLeases={[]}/>
        </>);

        expect(screen.getByTitle('Comparable sales map')).toBeVisible();
        expect(screen.getByTitle('Comparable leases map')).toBeVisible();
    });

    it('keeps marker popovers and the legacy padded map-search bounds', () => {
        window.__SWIFTLY_GOOGLE_MAPS_API_KEY__ = 'test-key';
        const onMapSearchChanged = vi.fn();
        render(<ComparableSalesMap
            appraisal={appraisal}
            comparableSales={[{_id: 'sale-1', address: '1 Main Street', location: {coordinates: [-79.5, 43.8]}}]}
            onMapSearchChanged={onMapSearchChanged}
        />);

        fireEvent.click(screen.getByRole('button', {name: 'Show comparable sale sale-1'}));
        expect(screen.getByTestId('map-popover')).toHaveTextContent('1 Main Street');

        fireEvent.click(screen.getByRole('button', {name: 'Map bounds changed'}));
        expect(onMapSearchChanged).toHaveBeenCalledWith({
            locationTop: 14,
            locationBottom: -2,
            locationLeft: 41.5,
            locationRight: -4.5,
        });
    });

    it('uses each rendered map as its fullscreen target', () => {
        window.__SWIFTLY_GOOGLE_MAPS_API_KEY__ = 'test-key';
        const requestFullscreen = vi.fn();
        const exitFullscreen = vi.fn();
        Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {configurable: true, value: requestFullscreen});
        Object.defineProperty(document, 'exitFullscreen', {configurable: true, value: exitFullscreen});
        const {container} = render(<>
            <ComparableSalesMap appraisal={appraisal} comparableSales={[]}/>
            <ComparableLeasesMap appraisal={appraisal} comparableLeases={[]}/>
        </>);

        const controls = container.querySelectorAll('.full-screen-button button');
        fireEvent.click(controls[0]);
        fireEvent.click(controls[0]);
        fireEvent.click(controls[1]);
        fireEvent.click(controls[1]);
        expect(requestFullscreen).toHaveBeenCalledTimes(2);
        expect(exitFullscreen).toHaveBeenCalledTimes(2);
    });
});
