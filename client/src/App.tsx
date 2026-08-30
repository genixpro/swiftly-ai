/*!
 *
 * Angle - Bootstrap Admin Template
 *
 * Version: 4.1.1
 * Author: @themicon_co
 * Website: http://themicon.co
 * License: https://wrapbootstrap.com/help/licenses
 *
 */

import { BrowserRouter } from 'react-router';
import {QueryClientProvider} from '@tanstack/react-query';
import {appQueryClient} from './app/queryClient';

// App Routes
import Routes from './Routes';

// Vendor dependencies
import "./Vendor";
// Application Styles
import './styles/app.scss'

export default function App() {
    return (
        <BrowserRouter basename={basename}>
            <QueryClientProvider client={appQueryClient}>
                <Routes />
            </QueryClientProvider>
        </BrowserRouter>
    );
}

const basename = '/';
