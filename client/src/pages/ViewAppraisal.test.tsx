import type {ReactNode} from 'react';
import {render, screen} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import ViewAppraisal from './ViewAppraisal';

const workspace = vi.hoisted(() => ({
    value: {} as Record<string, unknown>,
    clearAppraisal: vi.fn(),
    changeAppraisalType: vi.fn(),
}));

vi.mock('../app/AppraisalWorkspace', () => ({
    AppraisalWorkspaceProvider: ({children}: {children: ReactNode}) => <>{children}</>,
    useAppraisalWorkspace: () => workspace.value,
}));
vi.mock('../app/AppraisalNavigation', () => ({
    useAppraisalNavigation: () => ({
        clearAppraisal: workspace.clearAppraisal,
        changeAppraisalType: workspace.changeAppraisalType,
    }),
}));
vi.mock('./UploadFiles', () => ({default: () => <div>Upload route content</div>}));

function renderWorkspace() {
    return render(<MemoryRouter initialEntries={['/appraisal/a/upload']}>
        <Routes><Route path="/appraisal/:id/*" element={<ViewAppraisal appraisalId="a"/>} /></Routes>
    </MemoryRouter>);
}

describe('appraisal workspace shell', () => {
    beforeEach(() => {
        workspace.clearAppraisal.mockReset();
        workspace.changeAppraisalType.mockReset();
        workspace.value = {
            appraisal: undefined,
            loading: false,
            loadError: null,
            saveState: 'idle',
            saveError: null,
            savedAt: null,
            save: vi.fn(),
            update: vi.fn(),
            reload: vi.fn(),
            retry: vi.fn(),
        };
    });

    it('retains the loading title and status before route content is available', () => {
        workspace.value = {...workspace.value, loading: true};
        renderWorkspace();

        expect(screen.getByRole('heading', {name: 'Loading appraisal…'})).toBeVisible();
        expect(screen.getByRole('status')).toHaveTextContent('Preparing the appraisal workspace.');
        expect(document.title).toBe('Loading Appraisal – Swiftly');
        expect(workspace.clearAppraisal).toHaveBeenCalledOnce();
    });

    it('retains unavailable recovery copy and delegates retry from the save failure state', async () => {
        const retry = vi.fn();
        workspace.value = {...workspace.value, loadError: "We couldn't load this appraisal.", retry};
        renderWorkspace();

        expect(screen.getByRole('heading', {name: 'Appraisal unavailable'})).toBeVisible();
        expect(screen.getByRole('alert')).toHaveTextContent("We couldn't load this appraisal.");
        expect(screen.getByRole('link', {name: 'Return to appraisals'})).toHaveAttribute('href', '/appraisals/');
        expect(document.title).toBe('Appraisal Unavailable – Swiftly');
    });

    it('renders routed content with saving, saved, and retryable-save feedback unchanged', () => {
        const retry = vi.fn();
        workspace.value = {
            ...workspace.value,
            appraisal: {_id: 'a', appraisalType: 'detailed'},
            saveState: 'saving',
            saveError: 'Your changes could not be saved. They are still available on this page.',
            savedAt: new Date(),
            retry,
        };
        renderWorkspace();

        expect(screen.getByText('Upload route content')).toBeVisible();
        expect(screen.getAllByRole('status')[0]).toHaveTextContent('Saving changes…');
        expect(screen.getByRole('alert')).toHaveTextContent('Your changes could not be saved.');
        screen.getByRole('button', {name: 'Try again'}).click();
        expect(retry).toHaveBeenCalledOnce();
    });
});
