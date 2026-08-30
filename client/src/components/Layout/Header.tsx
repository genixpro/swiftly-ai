import {useCallback, useEffect, useRef} from 'react';
import {Link} from 'react-router';

interface HeaderProps {
    mobileNavigationOpen: boolean;
    onMobileNavigationToggle(): void;
    onMobileNavigationClose(): void;
}

export default function Header({mobileNavigationOpen, onMobileNavigationToggle, onMobileNavigationClose}: HeaderProps) {
    const mobileToggle = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (window.localStorage.getItem('swiftly-aside-collapsed') === 'true') {
            document.body.classList.add('aside-collapsed');
        }
    }, []);

    useEffect(() => {
        if (!mobileNavigationOpen) return;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            onMobileNavigationClose();
            window.requestAnimationFrame(() => mobileToggle.current?.focus());
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [mobileNavigationOpen, onMobileNavigationClose]);

    const toggleDesktopNavigation = useCallback(() => {
        const collapsed = document.body.classList.toggle('aside-collapsed');
        window.localStorage.setItem('swiftly-aside-collapsed', String(collapsed));
        window.dispatchEvent(new Event('resize'));
    }, []);

    return <header className="topnavbar-wrapper">
        <nav className="navbar topnavbar">
            <div className="navbar-header">
                <Link className="navbar-brand" to="/appraisals/" aria-label="Swiftly home">
                    <div className="brand-logo"><img className="img-fluid" src="/img/logo.png" alt="Swiftly" /></div>
                    <div className="brand-logo-collapsed"><img className="img-fluid" src="/img/logo-single.png" alt="Swiftly" /></div>
                </Link>
            </div>
            <ul className="navbar-nav me-auto flex-row">
                <li className="nav-item">
                    <button type="button" onClick={toggleDesktopNavigation} className="nav-link d-none d-md-block d-lg-block d-xl-block navbar-toggle-button" aria-label="Toggle navigation">
                        <em className="fas fa-bars" />
                    </button>
                    <button
                        type="button"
                        className="nav-link sidebar-toggle d-md-none navbar-toggle-button"
                        aria-label={mobileNavigationOpen ? 'Close navigation' : 'Open navigation'}
                        aria-expanded={mobileNavigationOpen}
                        aria-controls="app-sidebar"
                        onClick={onMobileNavigationToggle}
                        ref={mobileToggle}
                    >
                        <em className="fas fa-bars" aria-hidden="true" />
                    </button>
                </li>
            </ul>
        </nav>
    </header>;
}
