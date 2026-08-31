import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import App from './App';

vi.mock('./Vendor', () => ({}));
vi.mock('./Routes', () => ({
    default: () => <main data-testid="app-routes">Application routes</main>,
}));

describe('App', () => {
    it('mounts the route tree inside the browser router and shared query client', () => {
        render(<App />);

        expect(screen.getByTestId('app-routes')).toHaveTextContent('Application routes');
    });
});
