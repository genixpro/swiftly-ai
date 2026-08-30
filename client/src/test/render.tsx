import type {PropsWithChildren, ReactElement} from 'react';
import {render, type RenderOptions} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

export function createTestQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {retry: false, staleTime: 0, refetchOnWindowFocus: false},
            mutations: {retry: false},
        },
    });
}

interface AppTestProvidersProps extends PropsWithChildren {
    initialEntries?: string[];
    queryClient?: QueryClient;
}

export function AppTestProviders({
    children,
    initialEntries = ['/'],
    queryClient = createTestQueryClient(),
}: AppTestProvidersProps) {
    return <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>;
}

interface AppRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    initialEntries?: string[];
    queryClient?: QueryClient;
}

export function renderWithApp(ui: ReactElement, options: AppRenderOptions = {}) {
    const {initialEntries, queryClient, ...renderOptions} = options;
    return render(ui, {
        wrapper: ({children}) => <AppTestProviders
            initialEntries={initialEntries}
            queryClient={queryClient}
        >{children}</AppTestProviders>,
        ...renderOptions,
    });
}
