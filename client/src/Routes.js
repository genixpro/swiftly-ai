import React from 'react';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Base from './components/Layout/Base';
import BasePage from './components/Layout/BasePage';
// import BaseHorizontal from './components/Layout/BaseHorizontal';
import history from "./history";

import StartAppraisal from './pages/StartAppraisal';
import ViewAppraisal from './pages/ViewAppraisal';
import ViewAllAppraisals from './pages/ViewAllAppraisals';
import ClientDropbox from './pages/ClientDropbox';
import Logout from './pages/Logout';

import Auth from "./Auth";

// import SubMenu from './components/SubMenu/SubMenu';

// List of routes that uses the page layout
// listed here to Switch between layouts
// depending on the current pathname
const listofPages = [
    "/drop"
    /* See full project for reference */
];


const AuthenticationCallback = (props) =>
{
    Auth.handleAuthentication((redirect) => props.history.push(redirect));
    return <span>Authenticating...</span>;
};



const Routes = ({ location }) => {
    const currentKey = location.pathname.split('/')[1] || '/';
    const timeout = { enter: 500, exit: 500 };

    if (!Auth.isAuthenticated() && window.location.pathname.substr(0, "/callback".length) !== "/callback")
    {
        Auth.login();
        return null;
    }

    // Animations supported
    //      'rag-fadeIn'
    //      'rag-fadeInRight'
    //      'rag-fadeInLeft'

    const animationName = 'rag-fadeIn';

    if(listofPages.indexOf(location.pathname) > -1) {
        return (
            // Page Layout component wrapper
            <BasePage>
                <Switch location={location}>
                    <Route path="/drop/" component={ClientDropbox} history={history}/>
                    <Route path="/drop/:id" component={ClientDropbox} history={history}/>
                    {/* See full project for reference */}
                </Switch>
            </BasePage>
        )
    }
    else {
        return (
            // Layout component wrapper
            // Use <BaseHorizontal> to change layout
            <Base>
              <TransitionGroup>
                <CSSTransition key={currentKey} timeout={timeout} classNames={animationName} exit={false}>
                    <div>
                        <Switch location={location}>
                            <Route path="/appraisal/new" component={StartAppraisal} history={history}/>
                            <Route path="/appraisal/:id" component={ViewAppraisal} history={history}/>
                            <Route path="/appraisals/" component={ViewAllAppraisals} history={history}/>
                            <Route path="/callback" component={AuthenticationCallback} history={history}/>
                            <Route path="/logout/" component={Logout} history={history}/>

                            <Redirect to="/appraisals/"/>
                        </Switch>
                    </div>
                </CSSTransition>
              </TransitionGroup>
            </Base>
        )
    }
}

export default withRouter(Routes);
