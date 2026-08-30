import type {ReactNode} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Trans} from 'react-i18next';
import {Link} from 'react-router';
import type {NavigateFunction} from 'react-router';
import {Badge, Collapse} from 'reactstrap';
import Menu from '../../Menu.js';

interface MenuLabel {
    color: string;
    value: string;
}

interface MenuItem {
    heading?: string;
    name?: string;
    path?: string;
    match?: string;
    icon?: string;
    translate?: string;
    label?: MenuLabel;
    appraisalType?: string | null;
    openByDefault?: boolean;
    submenu?: MenuItem[];
}

interface SidebarProps {
    pathname: string;
    navigate: NavigateFunction;
    isMobile: boolean;
    mobileNavigationOpen: boolean;
    onNavigate(): void;
    appraisalType: string | null;
    hasActiveAppraisal: boolean;
}

interface SidebarItemProps {
    item: MenuItem;
    isActive: boolean;
    onNavigate(): void;
    navigationDisabled: boolean;
}

function SidebarItemHeader({item}: {item: MenuItem}) {
    return <li className="nav-heading"><span><Trans i18nKey={item.translate}>{item.heading}</Trans></span></li>;
}

function SidebarItem({item, isActive, onNavigate, navigationDisabled}: SidebarItemProps) {
    return <li className={isActive ? 'active' : ''}>
        <Link to={item.path ?? '/'} title={item.name} onClick={onNavigate} tabIndex={navigationDisabled ? -1 : undefined} aria-current={isActive ? 'page' : undefined}>
            {item.label && <Badge tag="div" className="float-end" color={item.label.color}>{item.label.value}</Badge>}
            {item.icon && <em className={item.icon} />}
            <span><Trans i18nKey={item.translate}>{item.name}</Trans></span>
        </Link>
    </li>;
}

interface SidebarSubItemProps {
    item: MenuItem;
    isActive: boolean;
    isOpen: boolean;
    navigationDisabled: boolean;
    onToggle(): void;
    children: ReactNode;
}

function SidebarSubItem({item, isActive, isOpen, navigationDisabled, onToggle, children}: SidebarSubItemProps) {
    const submenuId = `sidebar-submenu-${(item.name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    return <li className={isActive ? 'active' : ''}>
        <button type="button" className="nav-item" onClick={onToggle} tabIndex={navigationDisabled ? -1 : undefined} aria-expanded={isOpen} aria-controls={submenuId}>
            {item.label && <Badge tag="div" className="float-end" color={item.label.color}>{item.label.value}</Badge>}
            {item.icon && <em className={item.icon} aria-hidden="true" />}
            <span><Trans i18nKey={item.translate}>{item.name}</Trans></span>
        </button>
        <Collapse isOpen={isOpen}><ul id={submenuId} className="sidebar-nav sidebar-subnav">{children}</ul></Collapse>
    </li>;
}

const menu = Menu as MenuItem[];

export default function Sidebar({
    pathname,
    navigate: _navigate,
    isMobile,
    mobileNavigationOpen,
    onNavigate,
    appraisalType,
    hasActiveAppraisal,
}: SidebarProps) {
    const asideElement = useRef<HTMLElement>(null);

    const currentAppraisalId = useCallback(() => {
        const prefix = '/appraisal/';
        const remainder = pathname.slice(prefix.length);
        return remainder.slice(0, remainder.indexOf('/'));
    }, [pathname]);

    const routeWithIds = useCallback((route = '') => route.replace(':appraisalId', currentAppraisalId()), [currentAppraisalId]);
    const matchRoute = useCallback((item: MenuItem) => item.match ?? item.path ?? '', []);
    const routeActive = useCallback((paths: string | string[]) => {
        const candidates = Array.isArray(paths) ? paths : [paths];
        return candidates.some(path => pathname.includes(routeWithIds(path)));
    }, [pathname, routeWithIds]);

    const [collapse, setCollapse] = useState<Record<string, boolean>>(() => Object.fromEntries(
        menu.filter(item => !item.heading && item.name).map(item => [
            item.name as string,
            Boolean(item.openByDefault || routeActive(item.submenu?.map(matchRoute) ?? matchRoute(item))),
        ]),
    ));

    useEffect(() => {
        if (asideElement.current) asideElement.current.inert = Boolean(isMobile && !mobileNavigationOpen);
    }, [isMobile, mobileNavigationOpen]);

    const shouldShowRoute = useCallback((item: MenuItem) => {
        const route = matchRoute(item);
        if (!route.includes(':appraisalId')) return true;
        if (!hasActiveAppraisal) return false;
        if (item.appraisalType && appraisalType !== item.appraisalType) return false;
        const prefix = '/appraisal/';
        return pathname.startsWith(prefix) && pathname.length > prefix.length && pathname !== '/appraisal/new';
    }, [appraisalType, hasActiveAppraisal, matchRoute, pathname]);

    const visibleMenu = useMemo(() => menu.map((item, index) => {
        if (matchRoute(item) && !shouldShowRoute(item)) return null;
        const itemWithIds = item.path ? {...item, path: routeWithIds(item.path)} : item;
        if (item.heading) return <SidebarItemHeader item={itemWithIds} key={index} />;
        if (!item.submenu) return <SidebarItem
            key={index}
            item={itemWithIds}
            isActive={routeActive(matchRoute(item))}
            onNavigate={onNavigate}
            navigationDisabled={isMobile && !mobileNavigationOpen}
        />;

        return <SidebarSubItem
            key={index}
            item={itemWithIds}
            isOpen={Boolean(item.name && collapse[item.name])}
            onToggle={() => item.name && setCollapse(previous => Object.fromEntries(
                Object.keys(previous).map(name => [name, name === item.name ? !previous[name] : false]),
            ))}
            isActive={routeActive(item.submenu.map(matchRoute))}
            navigationDisabled={isMobile && !mobileNavigationOpen}
        >
            <li className="sidebar-subnav-header">{item.name}</li>
            {item.submenu.map((subitem, childIndex) => shouldShowRoute(subitem) ? <SidebarItem
                key={childIndex}
                item={subitem.path ? {...subitem, path: routeWithIds(subitem.path)} : subitem}
                onNavigate={onNavigate}
                navigationDisabled={isMobile && !mobileNavigationOpen}
                isActive={routeActive(matchRoute(subitem))}
            /> : null)}
        </SidebarSubItem>;
    }), [collapse, isMobile, matchRoute, mobileNavigationOpen, onNavigate, routeActive, routeWithIds, shouldShowRoute]);

    return <aside
        id="app-sidebar"
        className="aside-container"
        aria-label="Primary navigation"
        aria-hidden={isMobile && !mobileNavigationOpen ? true : undefined}
        inert={isMobile && !mobileNavigationOpen}
        ref={asideElement}
    >
        <div className="aside-inner">
            <nav data-sidebar-anyclick-close="" className="sidebar">
                <ul className="sidebar-nav"><li className="has-user-block" />{visibleMenu}</ul>
            </nav>
        </div>
    </aside>;
}
