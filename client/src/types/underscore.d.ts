declare module 'underscore' {
    interface Underscore {
        filter<T>(items: readonly T[], predicate: (item: T) => boolean): T[];
        isUndefined(value: unknown): value is undefined;
        indexOf<T>(items: readonly T[], value: T): number;
        once<T extends (...args: any[]) => any>(callback: T): T;
    }

    const underscore: Underscore;
    export default underscore;
}
