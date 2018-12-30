import React, { Component } from 'react';
import pubsub from 'pubsub-js';
import { Link } from 'react-router-dom';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, ListGroup, ListGroupItem } from 'reactstrap';

import ToggleState from '../Common/ToggleState';
import TriggerResize from '../Common/TriggerResize';
import ToggleFullscreen from '../Common/ToggleFullscreen';
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
                        <a className="navbar-brand" href="#/">
                            <div className="brand-logo">
                                <img className="img-fluid" src="img/logo.png" alt="App Logo" />
                            </div>
                            <div className="brand-logo-collapsed">
                                <img className="img-fluid" src="img/logo-single.png" alt="App Logo" />
                            </div>
                        </a>
                    </div>
                    { /* END navbar header */ }

                    { /* START Left navbar */ }
                    <ul className="navbar-nav mr-auto flex-row">
                        <li className="nav-item">
                            { /* Button used to collapse the left sidebar. Only visible on tablet and desktops */ }
                            <TriggerResize>
                                <ToggleState state="aside-collapsed">
                                    <a href="" className="nav-link d-none d-md-block d-lg-block d-xl-block">
                                        <em className="fas fa-bars"></em>
                                    </a>
                                </ToggleState>
                            </TriggerResize>
                            { /* Button to show/hide the sidebar on mobile. Visible on mobile only. */ }
                            <ToggleState state="aside-toggled" nopersist={true}>
                                <a href=""  className="nav-link sidebar-toggle d-md-none">
                                    <em className="fas fa-bars"></em>
                                </a>
                            </ToggleState>
                        </li>
                        { /* START User avatar toggle */ }
                        <li className="nav-item d-none d-md-block">
                            <a  className="nav-link" onClick={ this.toggleUserblock }>
                                <em className="icon-user"></em>
                            </a>
                        </li>
                        { /* END User avatar toggle */ }
                        { /* START lock screen */ }
                        <li className="nav-item d-none d-md-block">
                            <Link to="lock" title="Lock screen" className="nav-link">
                                <em className="icon-lock"></em>
                            </Link>
                        </li>
                        { /* END lock screen */ }
                    </ul>
                    { /* END Left navbar */ }
                    { /* START Right Navbar */ }
                    <ul className="navbar-nav flex-row">
                        { /* Search icon */ }
                        <li className="nav-item">
                            <a className="nav-link" href="" data-search-open="">
                                <em className="icon-magnifier"></em>
                            </a>
                        </li>
                        { /* Fullscreen (only desktops) */ }
                        <li className="nav-item d-none d-md-block">
                            <ToggleFullscreen className="nav-link"/>
                        </li>
                        { /* START Alert menu */ }
                        <UncontrolledDropdown nav inNavbar className="dropdown-list">
                            <DropdownToggle nav className="dropdown-toggle-nocaret">
                                <em className="icon-bell"></em>
                                <span className="badge badge-danger">11</span>
                            </DropdownToggle>
                            { /* START Dropdown menu */ }
                            <DropdownMenu right className="dropdown-menu-right animated flipInX">
                                <DropdownItem>
                                    { /* START list group */ }
                                    <ListGroup>
                                       <ListGroupItem action tag="a" href="" onClick={e => e.preventDefault()}>
                                          <div className="media">
                                             <div className="align-self-start mr-2">
                                                <em className="fab fa-twitter fa-2x text-info"></em>
                                             </div>
                                             <div className="media-body">
                                                <p className="m-0">New followers</p>
                                                <p className="m-0 text-muted text-sm">1 new follower</p>
                                             </div>
                                          </div>
                                       </ListGroupItem>
                                       <ListGroupItem action tag="a" href="" onClick={e => e.preventDefault()}>
                                          <div className="media">
                                             <div className="align-self-start mr-2">
                                                <em className="fa fa-envelope fa-2x text-warning"></em>
                                             </div>
                                             <div className="media-body">
                                                <p className="m-0">New e-mails</p>
                                                <p className="m-0 text-muted text-sm">You have 10 new emails</p>
                                             </div>
                                          </div>
                                       </ListGroupItem>
                                       <ListGroupItem action tag="a" href="" onClick={e => e.preventDefault()}>
                                          <div className="media">
                                             <div className="align-self-start mr-2">
                                                <em className="fa fa-tasks fa-2x text-success"></em>
                                             </div>
                                             <div className="media-body">
                                                <p className="m-0">Pending Tasks</p>
                                                <p className="m-0 text-muted text-sm">11 pending task</p>
                                             </div>
                                          </div>
                                       </ListGroupItem>
                                       <ListGroupItem action tag="a" href="" onClick={e => e.preventDefault()}>
                                          <span className="d-flex align-items-center">
                                             <span className="text-sm">More notifications</span>
                                             <span className="badge badge-danger ml-auto">14</span>
                                          </span>
                                       </ListGroupItem>
                                    </ListGroup>
                                    { /* END list group */ }
                                </DropdownItem>
                            </DropdownMenu>
                            { /* END Dropdown menu */ }
                        </UncontrolledDropdown>
                        { /* END Alert menu */ }
                        { /* START Offsidebar button */ }
                        <li className="nav-item">
                            <ToggleState state="offsidebar-open" nopersist={true}>
                                <a className="nav-link" href="">
                                    <em className="icon-notebook"></em>
                                </a>
                            </ToggleState>
                        </li>
                        { /* END Offsidebar menu */ }
                    </ul>
                    { /* END Right Navbar */ }

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
