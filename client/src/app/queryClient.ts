import {QueryClient} from '@tanstack/react-query';

export function createAppQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 0,
                refetchOnMount: 'always',
                refetchOnWindowFocus: false,
                retry: false,
            },
            mutations: {retry: false},
        },
    });
}

export const appQueryClient = createAppQueryClient();
