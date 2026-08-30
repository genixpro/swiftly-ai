import React from 'react';

import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

class Base extends React.Component {
    state = {isMobile: false, mobileNavigationOpen: false};

    componentDidMount() {
        this.mobileQuery = window.matchMedia('(max-width: 767.98px)');
        this.updateMobileState(this.mobileQuery);
        this.mobileQuery.addEventListener('change', this.updateMobileState);
    }

    componentDidUpdate(previousProps, previousState) {
        if (previousProps.pathname !== this.props.pathname && this.state.mobileNavigationOpen) {
            this.setState({mobileNavigationOpen: false});
            return;
        }
        if (previousState.mobileNavigationOpen !== this.state.mobileNavigationOpen) {
            document.body.classList.toggle('aside-toggled', this.state.mobileNavigationOpen);
            if (this.state.mobileNavigationOpen) {
                window.requestAnimationFrame(() => document.querySelector('#app-sidebar a, #app-sidebar button')?.focus());
            }
        }
    }

    componentWillUnmount() {
        if (this.mobileQuery) {
            this.mobileQuery.removeEventListener('change', this.updateMobileState);
        }
        document.body.classList.remove('aside-toggled');
    }

    updateMobileState = (query) => {
        this.setState({
            isMobile: query.matches,
            mobileNavigationOpen: query.matches ? this.state.mobileNavigationOpen : false
        });
    };

    toggleMobileNavigation = () => this.setState((state) => ({mobileNavigationOpen: !state.mobileNavigationOpen}));
    closeMobileNavigation = () => this.state.mobileNavigationOpen && this.setState({mobileNavigationOpen: false});

    render() {
        const {isMobile, mobileNavigationOpen} = this.state;
        return (
            <div className="wrapper">
                <a className="skip-link" href="#main-content">Skip to main content</a>
                <Header
                    mobileNavigationOpen={mobileNavigationOpen}
                    onMobileNavigationToggle={this.toggleMobileNavigation}
                    onMobileNavigationClose={this.closeMobileNavigation}
                />
                <Sidebar pathname={this.props.pathname} navigate={this.props.navigate} isMobile={isMobile} mobileNavigationOpen={mobileNavigationOpen} onNavigate={this.closeMobileNavigation} />
                <main id="main-content" className="section-container" tabIndex="-1">
                    {this.props.children}
                </main>
                <Footer />
            </div>
        );
    }
}

export default Base;
