import auth0 from 'auth0-js';
// src/Auth/Auth.js
import axios from "axios";

import history from './history';
import queryString from 'query-string'
import jwt from "jsonwebtoken";
const mixpanel = require('mixpanel-browser');

mixpanel.init("d500c431c55caac36b9af41885e9e642");

class Auth
{
    accessToken;
    idToken;
    expiresAt;


    auth0 = new auth0.WebAuth({
        domain: process.env.VALUATE_ENVIRONMENT.REACT_APP_AUTH_0_DOMAIN,
        clientID: process.env.VALUATE_ENVIRONMENT.REACT_APP_AUTH_0_CLIENT,
        redirectUri: process.env.VALUATE_ENVIRONMENT.REACT_APP_LOCAL_URL+'/callback',
        audience: process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL.replace("https://", "http://"),
        responseType: 'token id_token',
        scope: 'openid email profile'
    });

    updateMixpanelIdentity()
    {
        const accessToken = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');

        if (accessToken)
        {
            mixpanel.identify(userId);

            mixpanel.register({
                "environment": process.env.VALUATE_ENVIRONMENT.REACT_APP_ENVIRONMENT
            });

            mixpanel.people.set({
                "$name": this.idTokenPayload.name,
                "$email": this.idTokenPayload.email,
                "environment": process.env.VALUATE_ENVIRONMENT.REACT_APP_ENVIRONMENT
            });
        }
    }

    login()
    {
        const nonce = Math.random().toString();

        // Set the nonce and redirect uri
        localStorage.setItem('redirectNonce', nonce);
        localStorage.setItem('redirectUri', history.location.pathname);

        this.auth0.authorize({nonce: nonce});
    }

    constructor()
    {
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.handleAuthentication = this.handleAuthentication.bind(this);
        this.isAuthenticated = this.isAuthenticated.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
        this.getIdToken = this.getIdToken.bind(this);
        this.renewSession = this.renewSession.bind(this);
    }

    handleRapidDemoAuth(done)
    {
        const params = queryString.parse(history.location.search)
        if (params['rapidauth'])
        {
            const rapidauth = JSON.parse(params['rapidauth']);

            const authResult = {
                idTokenPayload: jwt.decode(rapidauth.id_token),
                idToken: rapidauth.id_token,
                accessToken: rapidauth.access_token,
                expiresIn: rapidauth.expires_in
            };

            this.setSession(authResult);

            done("/appraisals");
        }
    }

    handleAuthentication(done)
    {
        this.auth0.parseHash((err, authResult) =>
        {
            if (authResult && authResult.accessToken && authResult.idToken)
            {
                this.setSession(authResult);

                if (localStorage.getItem("redirectNonce") === authResult.idTokenPayload.nonce)
                {
                    const uri = localStorage.getItem("redirectUri");

                    localStorage.removeItem('redirectUri');
                    localStorage.removeItem('redirectNonce');

                    done(uri);
                }
                else
                {
                    done("/appraisals");
                }
            } else if (err)
            {
                history.replace('/appraisals');
                console.log(err);
                if (process.env.VALUATE_ENVIRONMENT.REACT_APP_DEBUG)
                {
                    alert(`Error: ${err.error}. Check the console for further details.`);
                }
            }
        });
    }

    updateAxiosToken()
    {
        if (this.accessToken)
        {
            axios.defaults.headers.common['Authorization'] = 'Basic ' + btoa(this.userId + ':' + this.accessToken);
            // axios.defaults.headers.common['Authorization'] = 'Bearer testing';
        }
        else
        {
            axios.defaults.headers.common['Authorization'] = '';
        }
    }

    getAccessToken()
    {
        return this.accessToken;
    }

    getIdToken()
    {
        return this.idToken;
    }

    setSession(authResult)
    {
        // Set isLoggedIn flag in localStorage
        localStorage.setItem('isLoggedIn', true);

        // Set the time that the access token will expire at
        let expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
        this.accessToken = authResult.accessToken;
        this.idToken = authResult.idToken;
        this.idTokenPayload = authResult.idTokenPayload;
        this.expiresAt = expiresAt;
        this.isAdmin = authResult.idTokenPayload[`${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL.replace("https://", "http://")}groups`].indexOf("admin") !== -1;
        this.userId = (authResult.idTokenPayload.sub || authResult.idTokenPayload.user_id);


        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('idToken', this.idToken);
        localStorage.setItem('idTokenPayload', this.idTokenPayload);
        localStorage.setItem('expiresAt', this.expiresAt);
        localStorage.setItem('userId', this.userId);
        localStorage.setItem('isAdmin', this.isAdmin);
        this.updateAxiosToken();
        this.updateMixpanelIdentity();
    }

    loadSession()
    {
        if (localStorage.getItem("isLoggedIn"))
        {
            this.accessToken = localStorage.getItem("accessToken");
            this.idToken = localStorage.getItem("idToken");
            this.idTokenPayload = localStorage.getItem("idTokenPayload");
            this.expiresAt = localStorage.getItem("expiresAt");
            this.userId = localStorage.getItem("userId");
            this.isAdmin = localStorage.getItem("isAdmin");
            this.updateAxiosToken();
            this.updateMixpanelIdentity();
        }
    }

    renewSession()
    {
        this.auth0.checkSession({}, (err, authResult) =>
        {
            if (authResult && authResult.accessToken && authResult.idToken)
            {
                this.setSession(authResult);
            } else if (err)
            {
                this.logout();
                console.log(err);
                if (process.env.VALUATE_ENVIRONMENT.REACT_APP_DEBUG)
                {
                    alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
                }
            }
        });
    }

    logout()
    {
        // Remove tokens and expiry time
        this.accessToken = null;
        this.idToken = null;
        this.expiresAt = 0;

        // Remove isLoggedIn flag from localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('idTokenPayload');
        localStorage.removeItem('expiresAt');
        localStorage.removeItem('isAdmin');

        this.auth0.logout({
            returnTo: window.location.origin
        });

        // navigate to the home route
        // history.push('/appraisals/');
    }

    isAuthenticated()
    {
        // Check whether the current time is past the
        // access token's expiry time
        let expiresAt = this.expiresAt;
        return new Date().getTime() < expiresAt;
    }
}

const GlobalAuth = new Auth();
GlobalAuth.loadSession();
export default GlobalAuth;