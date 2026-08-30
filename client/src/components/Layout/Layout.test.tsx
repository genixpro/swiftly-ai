import {useEffect} from 'react';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {renderWithApp} from '../../test/render';
import {useAppraisalNavigation} from '../../app/AppraisalNavigation';
import Base from './Base';

function ActiveAppraisal() {
    const navigation = useAppraisalNavigation();
    useEffect(() => navigation.changeAppraisalType('detailed'), [navigation]);
    return <div>Workspace</div>;
}

function setMobileViewport(matches: boolean) {
    window.matchMedia = vi.fn().mockReturnValue({
        matches,
        media: '(max-width: 767.98px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    });
}

describe('application layout', () => {
    it('preserves mobile navigation inertness, focus, and escape behavior', async () => {
        setMobileViewport(true);
        const navigate = vi.fn();
        const view = renderWithApp(<Base pathname="/appraisals/" navigate={navigate}>Content</Base>);
        const sidebar = screen.getByLabelText('Primary navigation');
        const toggle = screen.getByRole('button', {name: 'Open navigation'});

        await waitFor(() => expect(sidebar).toHaveAttribute('inert'));
        fireEvent.click(toggle);
        expect(document.body).toHaveClass('aside-toggled');
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(sidebar).not.toHaveAttribute('inert');

        fireEvent.keyDown(document, {key: 'Escape'});
        await waitFor(() => expect(toggle).toHaveFocus());
        expect(document.body).not.toHaveClass('aside-toggled');
        view.unmount();
        expect(document.body).not.toHaveClass('aside-toggled');
    });

    it('shows detailed appraisal navigation through context without a singleton', async () => {
        setMobileViewport(false);
        renderWithApp(<Base pathname="/appraisal/a/general" navigate={vi.fn()}><ActiveAppraisal /></Base>);
        await waitFor(() => expect(screen.getByRole('link', {name: 'Expenses'})).toBeVisible());
        expect(screen.getByRole('link', {name: 'Additional Income'})).toHaveAttribute('href', '/appraisal/a/additional_income');
    });

    it('preserves the desktop collapsed-sidebar preference', () => {
        setMobileViewport(false);
        window.localStorage.setItem('swiftly-aside-collapsed', 'true');
        renderWithApp(<Base pathname="/appraisals/" navigate={vi.fn()}>Content</Base>);
        expect(document.body).toHaveClass('aside-collapsed');
        fireEvent.click(screen.getByRole('button', {name: 'Toggle navigation'}));
        expect(window.localStorage.getItem('swiftly-aside-collapsed')).toBe('false');
    });
});
