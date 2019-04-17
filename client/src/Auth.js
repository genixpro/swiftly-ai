import auth0 from 'auth0-js';
// src/Auth/Auth.js

import history from './history';

class Auth {
    accessToken;
    idToken;
    expiresAt;


    auth0 = new auth0.WebAuth({
        domain: 'swiftlyai.auth0.com',
        clientID: 't0b5CDsYetGq67O5oM3KNzeZYZSfdVEF',
        redirectUri: 'http://localhost:3000/callback',
        responseType: 'token id_token',
        scope: 'openid'
    });

    login() {
        this.auth0.authorize();
    }

    constructor() {
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.handleAuthentication = this.handleAuthentication.bind(this);
        this.isAuthenticated = this.isAuthenticated.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
        this.getIdToken = this.getIdToken.bind(this);
        this.renewSession = this.renewSession.bind(this);
    }

    handleAuthentication(done) {
        this.auth0.parseHash((err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                this.setSession(authResult);
                done();
            } else if (err) {
                history.replace('/appraisals');
                console.log(err);
                alert(`Error: ${err.error}. Check the console for further details.`);
            }
        });
    }

    getAccessToken() {
        return this.accessToken;
    }

    getIdToken() {
        return this.idToken;
    }

    setSession(authResult) {
        // Set isLoggedIn flag in localStorage
        localStorage.setItem('isLoggedIn', true);

        // Set the time that the access token will expire at
        let expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
        this.accessToken = authResult.accessToken;
        this.idToken = authResult.idToken;
        this.expiresAt = expiresAt;

        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('idToken', this.idToken);
        localStorage.setItem('expiresAt', this.expiresAt);
    }

    loadSession()
    {
        if(localStorage.getItem("isLoggedIn"))
        {
            this.accessToken = localStorage.getItem("accessToken");
            this.idToken = localStorage.getItem("idToken");
            this.expiresAt = localStorage.getItem("expiresAt");
        }
    }

    renewSession() {
        this.auth0.checkSession({}, (err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                this.setSession(authResult);
            } else if (err) {
                this.logout();
                console.log(err);
                alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
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
        localStorage.removeItem('expiresAt');

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