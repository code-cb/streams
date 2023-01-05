import { Awaitable } from 'types.js';

export interface FirstResolved<T> {
  index: number;
  item: Awaitable<T>;
  result: Awaited<T>;
}

export const firstResolved = <T>(
  list: Array<Awaitable<T>>,
): Promise<FirstResolved<T>> => {
  if (!list.length)
    throw new Error('Could not get first resolved of an empty array');

  return new Promise(resolve => {
    let done = false;
    list.forEach(async (item, index) => {
      const result = await item;
      if (done) return;
      done = true;
      resolve({ index, item, result });
    });
  });
};

export const isASyncIterable = <T>(value: any): value is AsyncIterable<T> =>
  !!value && typeof value[Symbol.asyncIterator] === 'function';

export interface IsIterableOptions {
  excludeStrings?: boolean | undefined;
}

export const isIterable = <T>(
  value: any,
  { excludeStrings }: IsIterableOptions = {},
): value is Iterable<T> => {
  if (!value) return false;
  if (excludeStrings && typeof value === 'string') return false;
  return typeof value[Symbol.iterator] === 'function';
};

export const toPromise = async <T>(
  iterable: AsyncIterable<T>,
): Promise<Iterable<Awaited<T>>> => {
  const array = new Array<Awaited<T>>();
  for await (const iter of iterable) array.push(iter);
  return array;
};
