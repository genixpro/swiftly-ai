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
import HTML5Backend from 'react-dnd-html5-backend'
import Auth from './Auth';

axios.defaults.baseURL = process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL;

axios.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
}, function (error)
{
    if (error.response && error.response.status === 401)
    {
        Auth.logout();
        return (Promise.reject(error));
    }

    console.log(error.toString());
    if (process.env.VALUATE_ENVIRONMENT.REACT_APP_DEBUG)
    {
        alert(error.toString());
    }
    // Do something with response error
    return (Promise.reject(error));
});

class App extends Component {
  render() {

    // specify base href from env varible 'PUBLIC_URL'
    // use only if application isn't served from the root
    // for development it is forced to root only
    /* global PUBLIC_URL */
    const basename = process.env.NODE_ENV === 'development' ? '/' : (PUBLIC_URL || '/');

    return (
        <BrowserRouter basename={basename}>
            <Routes />
        </BrowserRouter>
    );

  }
}

export default App;
