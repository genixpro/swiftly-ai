export function updateComparableSearch<T extends Record<string, unknown>>(currentSearch: T, field: string, value: unknown): Record<string, unknown> {
    const search: Record<string, unknown> = {...currentSearch};
    if (value === null || value === '') {
        if (search[field] !== undefined) delete search[field];
    } else {
        search[field] = value;
    }
    return search;
}
