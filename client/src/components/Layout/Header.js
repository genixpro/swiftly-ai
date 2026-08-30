import React, { Component } from 'react';
import pubsub from 'pubsub-js';
import { Link } from 'react-router-dom';

import ToggleState from '../Common/ToggleState';
import TriggerResize from '../Common/TriggerResize';
import HeaderRun from './Header.run'

class Header extends Component {

    componentDidMount() {

        HeaderRun();

    }

    toggleUserblock(e) {
        e.preventDefault();
        pubsub.publish('toggleUserblock');
    }

    render() {
        return (
            <header className="topnavbar-wrapper">
                { /* START Top Navbar */ }
                <nav className="navbar topnavbar">
                    { /* START navbar header */ }
                    <div className="navbar-header">
                        <Link className="navbar-brand" to="/appraisals/" aria-label="Swiftly home">
                            <div className="brand-logo">
                                <img className="img-fluid" src="/img/logo.png" alt="Swiftly" />
                            </div>
                            <div className="brand-logo-collapsed">
                                <img className="img-fluid" src="/img/logo-single.png" alt="Swiftly" />
                            </div>
                        </Link>
                    </div>
                    { /* END navbar header */ }

                    { /* START Left navbar */ }
                    <ul className="navbar-nav mr-auto flex-row">
                        <li className="nav-item">
                            { /* Button used to collapse the left sidebar. Only visible on tablet and desktops */ }
                            <TriggerResize>
                                <ToggleState state="aside-collapsed">
                                    <button type="button" className="nav-link d-none d-md-block d-lg-block d-xl-block navbar-toggle-button" aria-label="Toggle navigation">
                                        <em className="fas fa-bars"></em>
                                    </button>
                                </ToggleState>
                            </TriggerResize>
                            { /* Button to show/hide the sidebar on mobile. Visible on mobile only. */ }
                            <ToggleState state="aside-toggled" nopersist={true}>
                                <button type="button" className="nav-link sidebar-toggle d-md-none navbar-toggle-button" aria-label="Toggle navigation">
                                    <em className="fas fa-bars"></em>
                                </button>
                            </ToggleState>
                        </li>
                    </ul>
                    { /* END Left navbar */ }

                    { /* START Search form */ }
                    <form className="navbar-form" role="search" action="search.html">
                       <div className="form-group">
                          <input className="form-control" type="text" placeholder="Type and hit enter ..."/>
                          <div className="fa fa-times navbar-form-close" data-search-dismiss=""></div>
                       </div>
                       <button className="d-none" type="submit">Submit</button>
                    </form>
                    { /* END Search form */ }
                </nav>
                { /* END Top Navbar */ }
            </header>
            );
    }

}

export default Header;
