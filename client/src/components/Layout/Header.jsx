import React, { Component } from 'react';
import { Link } from 'react-router';

class Header extends Component {

    componentDidMount() {
        if (window.localStorage.getItem('swiftly-aside-collapsed') === 'true') {
            document.body.classList.add('aside-collapsed');
        }
    }

    componentDidUpdate(previousProps) {
        if (!previousProps.mobileNavigationOpen && this.props.mobileNavigationOpen) {
            document.addEventListener('keydown', this.handleNavigationKeyDown);
        } else if (previousProps.mobileNavigationOpen && !this.props.mobileNavigationOpen) {
            document.removeEventListener('keydown', this.handleNavigationKeyDown);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleNavigationKeyDown);
    }

    handleNavigationKeyDown = (event) => {
        if (event.key === 'Escape' && this.props.mobileNavigationOpen) {
            this.props.onMobileNavigationClose();
            window.requestAnimationFrame(() => this.mobileToggle && this.mobileToggle.focus());
        }
    };

    toggleDesktopNavigation = () => {
        const collapsed = document.body.classList.toggle('aside-collapsed');
        window.localStorage.setItem('swiftly-aside-collapsed', String(collapsed));
        window.dispatchEvent(new Event('resize'));
    };

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
                    <ul className="navbar-nav me-auto flex-row">
                        <li className="nav-item">
                            { /* Button used to collapse the left sidebar. Only visible on tablet and desktops */ }
                            <button type="button" onClick={this.toggleDesktopNavigation} className="nav-link d-none d-md-block d-lg-block d-xl-block navbar-toggle-button" aria-label="Toggle navigation">
                                <em className="fas fa-bars"></em>
                            </button>
                            { /* Button to show/hide the sidebar on mobile. Visible on mobile only. */ }
                            <button
                                type="button"
                                className="nav-link sidebar-toggle d-md-none navbar-toggle-button"
                                aria-label={this.props.mobileNavigationOpen ? "Close navigation" : "Open navigation"}
                                aria-expanded={this.props.mobileNavigationOpen}
                                aria-controls="app-sidebar"
                                onClick={this.props.onMobileNavigationToggle}
                                ref={(button) => this.mobileToggle = button}
                            >
                                <em className="fas fa-bars" aria-hidden="true"></em>
                            </button>
                        </li>
                    </ul>
                    { /* END Left navbar */ }

                </nav>
                { /* END Top Navbar */ }
            </header>
            );
    }

}

export default Header;
