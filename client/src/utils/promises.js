export function mapConcurrent(items, mapper) {
    return Promise.all(Array.from(items).map(mapper));
}

export async function mapSeries(items, mapper) {
    const results = [];
    for (const [index, item] of Array.from(items).entries()) {
        results.push(await mapper(item, index));
    }
    return results;
}
