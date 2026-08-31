export function mapConcurrent<T, Result>(
    items: Iterable<T>,
    mapper: (item: T, index: number) => Result | PromiseLike<Result>,
): Promise<Awaited<Result>[]> {
    return Promise.all(Array.from(items).map(mapper));
}

export async function mapSeries<T, Result>(
    items: Iterable<T>,
    mapper: (item: T, index: number) => Result | PromiseLike<Result>,
): Promise<Awaited<Result>[]> {
    const results: Awaited<Result>[] = [];
    for (const [index, item] of Array.from(items).entries()) {
        results.push(await mapper(item, index));
    }
    return results;
}
