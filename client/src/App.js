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

import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';

// App Routes
import Routes from './Routes';

// Vendor dependencies
import "./Vendor";
// Application Styles
import './styles/bootstrap.scss';
import './styles/app.scss'
import axios from 'axios';

/* global __SWIFTLY_DEFAULT_API_BASE_URL__ */
axios.defaults.baseURL = window.__SWIFTLY_API_BASE_URL__ || __SWIFTLY_DEFAULT_API_BASE_URL__;
window.process = window.process || { env: {} };
window.process.env.VALUATE_ENVIRONMENT = {
    REACT_APP_SERVER_URL: axios.defaults.baseURL.replace(/\/$/, '') + '/',
    REACT_APP_ENABLE_UPLOAD: 'true',
    // Some retained screens use a truthiness check rather than parsing env text.
    REACT_APP_DEBUG: false,
};

axios.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
}, function (error)
{
    return (Promise.reject(error));
});

class App extends Component {
  render() {

    // specify base href from env varible 'PUBLIC_URL'
    // use only if application isn't served from the root
    // for development it is forced to root only
    const basename = '/';

    return (
        <BrowserRouter basename={basename}>
            <Routes />
        </BrowserRouter>
    );

  }
}

export default App;
