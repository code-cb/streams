export type Awaitable<T> = T | Promise<T>;

export type IterableInput<T> = T | Iterable<T> | AsyncIterable<T>;

export type EnqueueInput<T> = Awaitable<IterableInput<T>>;

export interface MergeIterableOptions {
  excludeStringsAsIterable?: boolean | undefined;
}

export interface MergeIterable<T> extends AsyncIterable<Awaited<T>> {
  enqueue(input: EnqueueInput<T>): this;
}
