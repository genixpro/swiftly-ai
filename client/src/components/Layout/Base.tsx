import type {PropsWithChildren} from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import type {NavigateFunction} from 'react-router';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import {AppraisalNavigationProvider} from '../../app/AppraisalNavigation';

interface BaseProps extends PropsWithChildren {
    pathname: string;
    navigate: NavigateFunction;
}

export default function Base({pathname, navigate, children}: BaseProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
    const [appraisalType, setAppraisalType] = useState<string | null>(null);
    const [hasActiveAppraisal, setHasActiveAppraisal] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(max-width: 767.98px)');
        const update = ({matches}: Pick<MediaQueryList, 'matches'>) => {
            setIsMobile(matches);
            if (!matches) setMobileNavigationOpen(false);
        };
        update(query);
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    useEffect(() => setMobileNavigationOpen(false), [pathname]);

    useEffect(() => {
        document.body.classList.toggle('aside-toggled', mobileNavigationOpen);
        if (mobileNavigationOpen) {
            window.requestAnimationFrame(() => document.querySelector<HTMLElement>('#app-sidebar a, #app-sidebar button')?.focus());
        }
        return () => document.body.classList.remove('aside-toggled');
    }, [mobileNavigationOpen]);

    const closeMobileNavigation = useCallback(() => setMobileNavigationOpen(false), []);
    const changeAppraisalType = useCallback((type: unknown) => {
        setAppraisalType(typeof type === 'string' ? type : null);
        setHasActiveAppraisal(true);
    }, []);
    const clearAppraisal = useCallback(() => {
        setAppraisalType(null);
        setHasActiveAppraisal(false);
    }, []);
    const appraisalNavigation = useMemo(() => ({
        appraisalType,
        hasActiveAppraisal,
        changeAppraisalType,
        clearAppraisal,
    }), [appraisalType, hasActiveAppraisal, changeAppraisalType, clearAppraisal]);

    return <AppraisalNavigationProvider value={appraisalNavigation}>
        <div className="wrapper">
            <a className="skip-link" href="#main-content">Skip to main content</a>
            <Header
                mobileNavigationOpen={mobileNavigationOpen}
                onMobileNavigationToggle={() => setMobileNavigationOpen(open => !open)}
                onMobileNavigationClose={closeMobileNavigation}
            />
            <Sidebar
                pathname={pathname}
                navigate={navigate}
                isMobile={isMobile}
                mobileNavigationOpen={mobileNavigationOpen}
                onNavigate={closeMobileNavigation}
                appraisalType={appraisalType}
                hasActiveAppraisal={hasActiveAppraisal}
            />
            <main id="main-content" className="section-container" tabIndex={-1}>{children}</main>
            <Footer />
        </div>
    </AppraisalNavigationProvider>;
}
