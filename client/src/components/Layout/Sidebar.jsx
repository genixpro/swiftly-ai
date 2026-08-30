import React, {Component} from 'react';
import {withTranslation, Trans} from 'react-i18next';
import {Link} from 'react-router';
import {Collapse, Badge} from 'reactstrap';
import _ from 'underscore';

import Menu from '../../Menu.js';

/** Component to display headings on sidebar */
const SidebarItemHeader = ({item}) => (
    <li className="nav-heading">
        <span><Trans i18nKey={item.translate}>{item.heading}</Trans></span>
    </li>
);

/** Normal items for the sidebar */
const SidebarItem = ({item, isActive, onNavigate, navigationDisabled}) => (
    <li className={isActive ? 'active' : ''}>
        <Link to={item.path} title={item.name} onClick={onNavigate} tabIndex={navigationDisabled ? -1 : undefined} aria-current={isActive ? 'page' : undefined}>
            {item.label && <Badge tag="div" className="float-end" color={item.label.color}>{item.label.value}</Badge>}
            {item.icon && <em className={item.icon}></em>}
            <span><Trans i18nKey={item.translate}>{item.name}</Trans></span>
        </Link>
    </li>
);

/** Build a sub menu with items inside and attach collapse behavior */
const SidebarSubItem = ({item, isActive, handler, children, isOpen, navigationDisabled}) => {
    const submenuId = `sidebar-submenu-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    return <li className={isActive ? 'active' : ''}>
        <button type="button" className="nav-item" onClick={handler} tabIndex={navigationDisabled ? -1 : undefined} aria-expanded={isOpen} aria-controls={submenuId}>
            {item.label && <Badge tag="div" className="float-end" color={item.label.color}>{item.label.value}</Badge>}
            {item.icon && <em className={item.icon} aria-hidden="true"></em>}
            <span><Trans i18nKey={item.translate}>{item.name}</Trans></span>
        </button>
        <Collapse isOpen={isOpen}>
            <ul id={submenuId} className="sidebar-nav sidebar-subnav">
                {children}
            </ul>
        </Collapse>
    </li>;
};

/** Component used to display a header on menu when using collapsed/hover mode */
const SidebarSubHeader = ({item}) => (
    <li className="sidebar-subnav-header">{item.name}</li>
);

export class Sidebar extends Component
{

    state = {
        collapse: {},
        appraisalType: null,
        hasActiveAppraisal: false
    };

    static globalSidebar = null;

    static getGlobalSidebar()
    {
        return Sidebar.globalSidebar;
    }

    changeAppraisalType(appraisalType)
    {
        if (appraisalType !== this.state.appraisalType || !this.state.hasActiveAppraisal)
        {
            this.setState({appraisalType: appraisalType, hasActiveAppraisal: true})
        }
    }

    clearAppraisal()
    {
        if (this.state.hasActiveAppraisal)
        {
            this.setState({appraisalType: null, hasActiveAppraisal: false});
        }
    }
    componentDidMount()
    {
        Sidebar.globalSidebar = this;

        // prepare the flags to handle menu collapsed states
        this.buildCollapseList();
        this.updateInertState();
    }

    componentDidUpdate(previousProps) {
        if (previousProps.isMobile !== this.props.isMobile || previousProps.mobileNavigationOpen !== this.props.mobileNavigationOpen) {
            this.updateInertState();
        }
    }

    updateInertState() {
        if (this.asideElement) {
            this.asideElement.inert = Boolean(this.props.isMobile && !this.props.mobileNavigationOpen);
        }
    }

    /** prepare initial state of collapse menus. Doesn't allow same route names */
    buildCollapseList = () =>
    {
        let collapse = {};
        Menu
            .filter(({heading}) => !heading)
            .forEach(({openByDefault, name, path, submenu}) =>
            {
                if (openByDefault)
                {
                    collapse[name] = true;
                }
                else
                {
                    collapse[name] = this.routeActive(submenu ? submenu.map((subItem) => this.matchRouteForItem(subItem)) : path)
                }
            });
        this.setState({collapse});
    }

    matchRouteForItem(item)
    {
        if (item.match)
        {
            return item.match;
        }
        return item.path;
    }


    navigator(route)
    {
        this.props.navigate(route);
    }

    routeActive(paths)
    {
        paths = Array.isArray(paths) ? paths : [paths];
        return paths.some(p => this.props.pathname.indexOf(this.getRouteWithIds(p)) > -1)
    }

    getCurrentAppraisalId()
    {
        const appraisalRoute = "/appraisal/";
        const path = this.props.pathname;
        const afterAppraisalRoute = path.substr(appraisalRoute.length);

        return afterAppraisalRoute.substr(0, afterAppraisalRoute.indexOf("/"));
    }

    getRouteWithIds(route)
    {
        if (route.indexOf(":appraisalId"))
        {
            return route.replace(":appraisalId", this.getCurrentAppraisalId());
        }
        return route;
    }

    getItemWithIds(item)
    {
        if (!item.path)
        {
            return item;
        }

        const newItem = _.clone(item);
        newItem.path = this.getRouteWithIds(newItem.path);
        return newItem;
    }

    shouldShowRoute(item)
    {
        const route = this.matchRouteForItem(item);
        if (route.indexOf(":appraisalId") !== -1)
        {
            if (!this.state.hasActiveAppraisal)
            {
                return false;
            }

            if(item.appraisalType)
            {
                if (this.state.appraisalType !== item.appraisalType)
                {
                    return false;
                }
            }

            const appraisalRoute = "/appraisal/";
            const newAppraisalRoute = "/appraisal/new";
            const path = this.props.pathname;
            if (path.substr(0, appraisalRoute.length) === appraisalRoute && path.length > appraisalRoute.length && path !== newAppraisalRoute)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        return true;
    }

    toggleItemCollapse(stateName)
    {
        for (let c in this.state.collapse)
        {
            if (this.state.collapse[c] === true && c !== stateName)
                this.setState({
                    collapse: {
                        [c]: false
                    }
                });
        }
        this.setState({
            collapse: {
                [stateName]: !this.state.collapse[stateName]
            }
        });
    }

    getSubRoutes = item => item.submenu.map((subItem) => this.matchRouteForItem(subItem));

    /** map menu config to string to determine what element to render */
    itemType = item =>
    {
        if (item.heading) return 'heading';
        if (!item.submenu) return 'menu';
        if (item.submenu) return 'submenu';
    };

    render()
    {
        return (
            <aside
                id="app-sidebar"
                className='aside-container'
                aria-label="Primary navigation"
                aria-hidden={this.props.isMobile && !this.props.mobileNavigationOpen ? true : undefined}
                inert={this.props.isMobile && !this.props.mobileNavigationOpen ? "" : undefined}
                ref={(element) => this.asideElement = element}
            >
                {/* START Sidebar (left) */}
                <div className="aside-inner">
                    <nav data-sidebar-anyclick-close="" className="sidebar">
                        {/* START sidebar nav */}
                        <ul className="sidebar-nav">
                            {/* START user info */}
                            <li className="has-user-block">
                            </li>
                            {/* END user info */}

                            {/* Iterates over all sidebar items */}
                            {
                                Menu.map((item, i) =>
                                {
                                    if (this.matchRouteForItem(item) && !this.shouldShowRoute(item))
                                    {
                                        return null;
                                    }

                                    // heading
                                    if (this.itemType(item) === 'heading')
                                        return (
                                            <SidebarItemHeader item={this.getItemWithIds(item)} key={i}/>
                                        );
                                    else
                                    {
                                        if (this.itemType(item) === 'menu')
                                            return (
                                                <SidebarItem isActive={this.routeActive(this.matchRouteForItem(item))}
                                                             item={this.getItemWithIds(item)}
                                                             onNavigate={this.props.onNavigate}
                                                             navigationDisabled={this.props.isMobile && !this.props.mobileNavigationOpen}
                                                             key={i}/>
                                            );
                                        if (this.itemType(item) === 'submenu')
                                            return [
                                                <SidebarSubItem item={this.getItemWithIds(item)}
                                                                isOpen={this.state.collapse[item.name]}
                                                                handler={this.toggleItemCollapse.bind(this, item.name)}
                                                                isActive={this.routeActive(this.getSubRoutes(item))}
                                                                navigationDisabled={this.props.isMobile && !this.props.mobileNavigationOpen}
                                                                key={i}>
                                                    <SidebarSubHeader item={item} key={i}/>
                                                    {
                                                        item.submenu.map((subitem, i) =>
                                                            {
                                                                if (!this.shouldShowRoute(subitem))
                                                                {
                                                                    return null;
                                                                }

                                                                return <SidebarItem key={i}
                                                                             item={this.getItemWithIds(subitem)}
                                                                             onNavigate={this.props.onNavigate}
                                                                             navigationDisabled={this.props.isMobile && !this.props.mobileNavigationOpen}
                                                                             isActive={this.routeActive(this.matchRouteForItem(subitem))}/>
                                                            }
                                                        )
                                                    }
                                                </SidebarSubItem>
                                            ]
                                    }
                                    return null; // unrecognized item
                                })
                            }
                        </ul>
                        {/* END sidebar nav */}
                    </nav>
                </div>
                {/* END Sidebar (left) */}
            </aside>
        );
    }
}

export default withTranslation('translations')(Sidebar);
