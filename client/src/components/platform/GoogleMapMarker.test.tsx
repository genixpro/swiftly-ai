import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import GoogleMapMarker from './GoogleMapMarker';

describe('GoogleMapMarker', () => {
    it('keeps map positioning props out of the DOM while retaining its marker wrapper', () => {
        const {container} = render(<GoogleMapMarker lat={43.7} lng={-79.4}><span>Marker</span></GoogleMapMarker>);

        expect(screen.getByText('Marker')).toBeVisible();
        expect(container.firstElementChild).not.toHaveAttribute('lat');
        expect(container.firstElementChild).not.toHaveAttribute('lng');
    });
});
