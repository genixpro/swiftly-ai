/**
 * Normalizes the two identifier representations accepted by the existing API.
 *
 * Mongo-backed responses may use either an id string or an extended-JSON
 * object. Keep the legacy falsey-value behavior: absent ids become `null`,
 * while a malformed extended-JSON object remains `undefined`.
 */
export function regularizeId(value: string | {$oid?: string} | null | undefined | false | 0 | ''): string | null | undefined {
    if (value) {
        if (typeof value === 'string') {
            return value;
        }

        return value.$oid;
    }

    return null;
}
