// Taken from oceanic.js (MIT)
// https://github.com/OceanicJS/Oceanic

// CachedCollection is the work of Ayios

/** @module Collection */
/** A {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map | Map} with some Array-like additions. */
export class Collection<K, V> extends Map<K, V> {
    /** If this collection is empty. */
    get empty(): boolean {
        return this.size === 0;
    }

    /** See: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every | Array#every } */
    every<T extends V, ThisArg = Collection<K, V>>(predicate: (value: V, index: number, array: Array<V>) => value is T, thisArg?: ThisArg): this is Array<T>;
    every<ThisArg = Collection<K, V>>(predicate: (value: V, index: number, array: Array<V>) => unknown, thisArg?: ThisArg): boolean;
    every(predicate: (value: V, index: number, array: Array<V>) => unknown, thisArg?: unknown): boolean {
        return this.toArray().every(predicate, thisArg);
    }


    /** See: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter | Array#filter } */
    filter<S extends V, ThisArg = Collection<K, V>>(predicate: (this: ThisArg, value: V, index: number, array: Array<V>) => value is S, thisArg?: ThisArg): Array<S>;
    filter<ThisArg = Collection<K, V>>(predicate: (this: ThisArg, value: V, index: number, array: Array<V>) => unknown, thisArg?: ThisArg): Array<V>;
    filter(predicate: (value: V, index: number, array: Array<V>) => unknown, thisArg?: unknown): Array<V> {
        return this.toArray().filter(predicate, thisArg) ;
    }

    /** See: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find | Array#find } */
    find<S extends V, ThisArg = Collection<K, V>>(predicate: (this: ThisArg, value: V, index: number, obj: Array<V>) => value is S, thisArg?: ThisArg): S | undefined;
    find<ThisArg = Collection<K, V>>(predicate: (this: ThisArg, value: V, index: number, obj: Array<V>) => unknown, thisArg?: ThisArg): V | undefined;
    find(predicate: (value: V, index: number, obj: Array<V>) => unknown, thisArg?: unknown): V | undefined {
        return this.toArray().find(predicate, thisArg);
    }

    /** See: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex | Array#findIndex } */
    findIndex(predicate: (value: V, index: number, obj: Array<V>) => unknown, thisArg?: unknown): number {
        return this.toArray().findIndex(predicate, thisArg);
    }

    /**
     * Get the first element, or first X elements if a number is provided.
     * @param amount The amount of elements to get.
     */
    first(): V | undefined;
    first(amount: number): Array<V>;
    first(amount?: number): V | Array<V> | undefined {
        if (amount === undefined) {
            const iterable = this.values();
            return iterable.next().value as V;
        }

        if (amount < 0) {
            return this.last(amount * -1);
        }
        amount = Math.min(amount, this.size);

        const iterable = this.values();
        return Array.from({ length: amount }, () => iterable.next().value as V);
    }

    /**
     * Get the last element, or last X elements if a number is provided.
     * @param amount The amount of elements to get.
     */
    last(): V | undefined;
    last(amount: number): Array<V>;
    last(amount?: number): V | Array<V> | undefined {
        const iterator = Array.from(this.values());
        if (amount === undefined) {
            return iterator.at(-1);
        }
        if (amount < 0) {
            return this.first(amount * -1);
        }
        if (!amount) {
            return [];
        }

        return iterator.slice(-amount);
    }

    /** See: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map | Array#map } */
    map<T>(predicate: (value: V, index: number, obj: Array<V>) => T, thisArg?: unknown): Array<T> {
        return this.toArray().map(predicate, thisArg);
    }

    /**
     * Pick a random element from the collection, or undefined if the collection is empty.
     */
    random(): V | undefined {
        if (this.empty) {
            return undefined;
        }
        const iterable = Array.from(this.values());

        return iterable[Math.floor(Math.random() * iterable.length)];
    }

    /** See: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce | Array#reduce } */
    reduce(predicate: (previousValue: V, currentValue: V, currentIndex: number, array: Array<V>) => V): V;
    reduce(predicate: (previousValue: V, currentValue: V, currentIndex: number, array: Array<V>) => V, initialValue: V): V;
    reduce<T>(predicate: (previousValue: T, currentValue: V, currentIndex: number, array: Array<V>) => T, initialValue: T): T;
    reduce<T>(predicate: (previousValue: T, currentValue: V, currentIndex: number, array: Array<V>) => T, initialValue?: T): T {
        return this.toArray().reduce(predicate, initialValue!);
    }

    /** See: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight | Array#reduceRight } */
    reduceRight(predicate: (previousValue: V, currentValue: V, currentIndex: number, array: Array<V>) => V): V;
    reduceRight(predicate: (previousValue: V, currentValue: V, currentIndex: number, array: Array<V>) => V, initialValue: V): V;
    reduceRight<T>(predicate: (previousValue: T, currentValue: V, currentIndex: number, array: Array<V>) => T, initialValue: T): T;
    reduceRight<T>(predicate: (previousValue: T, currentValue: V, currentIndex: number, array: Array<V>) => T, initialValue?: T): T {
        return this.toArray().reduceRight(predicate, initialValue!);
    }

    /** See: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some | Array#some } */
    some<ThisArg = Collection<K, V>>(predicate: (value: V, index: number, array: Array<V>) => unknown, thisArg?: ThisArg): boolean {
        return this.toArray().some(predicate, thisArg);
    }

    /** Get the values of this collection as an array. */
    toArray(): Array<V> {
        return Array.from(this.values());
    }
}


/** Cached collection that deletes itself after a specified time period */
export class CachedCollection<K, V> extends Collection<K, V> {
    private cache: Record<string, NodeJS.Timeout> = {};
    public defaultMs: number = 15000;
    constructor(defaultMs: number) {
        super()
        this.defaultMs = defaultMs;
    }
    extend(key: K, ms: number): void {
        if (this.cache[key as string]) clearTimeout(this.cache[key as string]);

        this.cache[key as string] = setTimeout(() => {
            clearTimeout(this.cache[key as string]);
            delete this.cache[key as string];
            super.delete(key);
        }, ms);
    }
    clear(): void {
        for (const timeout of Object.values(this.cache)) {
            clearTimeout(timeout);
        }

        return super.clear();
    }
    set(key: K, value: V, ms: number = this.defaultMs): this {
        if (this.cache[key as string]) clearTimeout(this.cache[key as string]);

        this.cache[key as string] = setTimeout(() => {
            clearTimeout(this.cache[key as string]);
            delete this.cache[key as string];
            super.delete(key);
        }, ms);

        return super.set(key, value);
    }
    delete(key: K): boolean {
        if (this.cache[key as string]) {
            clearTimeout(this.cache[key as string]);
            delete this.cache[key as string];
        }

        return super.delete(key);
    }
}