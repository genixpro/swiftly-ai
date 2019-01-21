import React, { Component } from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';

import ToggleState from '../Common/ToggleState';
import LoadTheme from '../Common/LoadTheme';

class Offsidebar extends Component {

    state = {
        activeTab: 'settings',
        offsidebarReady: false
    }

    componentDidMount() {
        // When mounted display the offsidebar
        this.setState({ offsidebarReady: true });
    }

    toggle = tab => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    handleCheckboxState = node => {
        if(!node) return;
        // use element 'name' attribute to check if a class was added to body
        // to activate checkbox or deactivate accordingly
        node.checked = document.body.className.indexOf(node.name) > -1
    }

    render() {

        return (
            this.state.offsidebarReady &&
            <aside className="offsidebar">
                { /* START Off Sidebar (right) */ }
                <nav>
                    <div>
                        { /* Nav tabs */ }
                        <Nav tabs justified>
                            <NavItem>
                                <NavLink className={ this.state.activeTab === 'settings' ? 'active':'' }
                                    onClick={() => { this.toggle('settings'); }}
                                >
                                    <em className="icon-equalizer fa-lg"></em>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={ this.state.activeTab === 'chat' ? 'active':'' }
                                    onClick={() => { this.toggle('chat'); }}
                                >
                                    <em className="icon-user fa-lg"></em>
                                </NavLink>
                            </NavItem>
                        </Nav>
                        { /* Tab panes */ }
                        <TabContent activeTab={this.state.activeTab}>
                            <TabPane tabId="settings">
                                <h3 className="text-center text-thin mt-4">Settings</h3>
                                <div className="p-2">
                                    <h4 className="text-muted text-thin">Themes</h4>
                                    <div className="row row-flush mb-2">
                                        <div className="col mb-2">
                                            <div className="setting-color">
                                                <LoadTheme theme="A">
                                                    <label>
                                                        <input type="radio" name="setting-theme"/>
                                                        <span className="icon-check"></span>
                                                        <span className="split">
                                                            <span className="color bg-info"></span>
                                                            <span className="color bg-info-light"></span>
                                                        </span>
                                                        <span className="color bg-white"></span>
                                                    </label>
                                                </LoadTheme>
                                            </div>
                                        </div>
                                        <div className="col mb-2">
                                            <div className="setting-color">
                                                <LoadTheme theme="B">
                                                    <label>
                                                        <input type="radio" name="setting-theme"/>
                                                        <span className="icon-check"></span>
                                                        <span className="split">
                                                            <span className="color bg-green"></span>
                                                            <span className="color bg-green-light"></span>
                                                        </span>
                                                        <span className="color bg-white"></span>
                                                    </label>
                                                </LoadTheme>
                                            </div>
                                        </div>
                                        <div className="col mb-2">
                                            <div className="setting-color">
                                                <LoadTheme theme="C">
                                                    <label>
                                                        <input type="radio" name="setting-theme"/>
                                                        <span className="icon-check"></span>
                                                        <span className="split">
                                                            <span className="color bg-purple"></span>
                                                            <span className="color bg-purple-light"></span>
                                                        </span>
                                                        <span className="color bg-white"></span>
                                                    </label>
                                                </LoadTheme>
                                            </div>
                                        </div>
                                        <div className="col mb-2">
                                            <div className="setting-color">
                                                <LoadTheme theme="D">
                                                    <label>
                                                        <input type="radio" name="setting-theme"/>
                                                        <span className="icon-check"></span>
                                                        <span className="split">
                                                            <span className="color bg-danger"></span>
                                                            <span className="color bg-danger-light"></span>
                                                        </span>
                                                        <span className="color bg-white"></span>
                                                    </label>
                                                </LoadTheme>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row row-flush mb-2">
                                        <div className="col mb-2">
                                            <div className="setting-color">
                                                <LoadTheme theme="E">
                                                    <label>
                                                        <input type="radio" name="setting-theme"/>
                                                        <span className="icon-check"></span>
                                                        <span className="split">
                                                            <span className="color bg-info-dark"></span>
                                                            <span className="color bg-info"></span>
                                                        </span>
                                                        <span className="color bg-gray-dark"></span>
                                                    </label>
                                                </LoadTheme>
                                            </div>
                                        </div>
                                        <div className="col mb-2">
                                            <div className="setting-color">
                                                <LoadTheme theme="F">
                                                    <label>
                                                        <input type="radio" name="setting-theme"/>
                                                        <span className="icon-check"></span>
                                                        <span className="split">
                                                            <span className="color bg-green-dark"></span>
                                                            <span className="color bg-green"></span>
                                                        </span>
                                                        <span className="color bg-gray-dark"></span>
                                                    </label>
                                                </LoadTheme>
                                            </div>
                                        </div>
                                        <div className="col mb-2">
                                            <div className="setting-color">
                                                <LoadTheme theme="G">
                                                    <label>
                                                        <input type="radio" name="setting-theme"/>
                                                        <span className="icon-check"></span>
                                                        <span className="split">
                                                            <span className="color bg-purple-dark"></span>
                                                            <span className="color bg-purple"></span>
                                                        </span>
                                                        <span className="color bg-gray-dark"></span>
                                                    </label>
                                                </LoadTheme>
                                            </div>
                                        </div>
                                        <div className="col mb-2">
                                            <div className="setting-color">
                                                <LoadTheme theme="H">
                                                    <label>
                                                        <input type="radio" name="setting-theme"/>
                                                        <span className="icon-check"></span>
                                                        <span className="split">
                                                            <span className="color bg-danger-dark"></span>
                                                            <span className="color bg-danger"></span>
                                                        </span>
                                                        <span className="color bg-gray-dark"></span>
                                                    </label>
                                                </LoadTheme>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <h4 className="text-muted text-thin">Layout</h4>
                                    <div className="clearfix">
                                        <p className="float-left">Fixed</p>
                                        <div className="float-right">
                                            <label className="switch">
                                                <ToggleState state="layout-fixed">
                                                    <input id="chk-fixed" type="checkbox" name="layout-fixed" ref={this.handleCheckboxState}/>
                                                </ToggleState>
                                                <span></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="clearfix">
                                        <p className="float-left">Boxed</p>
                                        <div className="float-right">
                                            <label className="switch">
                                                <ToggleState state="layout-boxed">
                                                    <input id="chk-boxed" type="checkbox" name="layout-boxed" ref={this.handleCheckboxState}/>
                                                </ToggleState>
                                                <span></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <h4 className="text-muted text-thin">Aside</h4>
                                    <div className="clearfix">
                                        <p className="float-left">Collapsed</p>
                                        <div className="float-right">
                                            <label className="switch">
                                                <ToggleState state="aside-collapsed">
                                                    <input id="chk-collapsed" type="checkbox" name="aside-collapsed" ref={this.handleCheckboxState}/>
                                                </ToggleState>
                                                <span></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="clearfix">
                                        <p className="float-left">Collapsed Text</p>
                                        <div className="float-right">
                                            <label className="switch">
                                                <ToggleState state="aside-collapsed-text">
                                                    <input id="chk-collapsed-text" type="checkbox" name="aside-collapsed-text" ref={this.handleCheckboxState}/>
                                                </ToggleState>
                                                <span></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="clearfix">
                                        <p className="float-left">Float</p>
                                        <div className="float-right">
                                            <label className="switch">
                                                <ToggleState state="aside-float">
                                                    <input id="chk-float" type="checkbox" name="aside-float" ref={this.handleCheckboxState}/>
                                                </ToggleState>
                                                <span></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="clearfix">
                                        <p className="float-left">Hover</p>
                                        <div className="float-right">
                                            <label className="switch">
                                                <ToggleState state="aside-hover">
                                                    <input id="chk-hover" type="checkbox" name="aside-hover" ref={this.handleCheckboxState}/>
                                                </ToggleState>
                                                <span></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="clearfix">
                                        <p className="float-left">Show Scrollbar</p>
                                        <div className="float-right">
                                            <label className="switch">
                                                <ToggleState state="show-scrollbar" target=".sidebar">
                                                    <input id="chk-hover" type="checkbox" name="show-scrollbar" ref={this.handleCheckboxState}/>
                                                </ToggleState>
                                                <span></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </TabPane>
                        </TabContent>
                    </div>
                </nav>
                { /* END Off Sidebar (right) */ }
            </aside>
        );
    }

}

export default Offsidebar;
