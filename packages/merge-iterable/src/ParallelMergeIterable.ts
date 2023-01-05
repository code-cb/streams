import { BaseMergeIterable } from 'BaseMergeIterable.js';
import { EnqueueInput, MergeIterableOptions } from 'types.js';
import {
  firstResolved,
  isASyncIterable,
  isIterable,
  toPromise,
} from 'utils.js';

export class ParallelMergeIterable<T = string> extends BaseMergeIterable<T> {
  private readonly queue = new Array<Promise<T | Iterable<T>>>();

  constructor(
    name: string,
    private readonly options: MergeIterableOptions = {},
  ) {
    super(name);
  }

  protected enqueueImpl(input: EnqueueInput<T>): void {
    this.queue.push(this.resolveInput(input));
  }

  protected async *iterateImpl(): AsyncIterable<Awaited<T>> {
    const { excludeStringsAsIterable: excludeStrings = true } = this.options;
    while (this.queue.length) {
      const { index, result } = await firstResolved(this.queue);
      this.queue.splice(index, 1);
      if (isIterable(result, { excludeStrings })) {
        for await (const item of result) {
          this.onYield(item);
          yield item;
        }
      } else {
        this.onYield(result);
        yield result;
      }
    }
  }

  private async resolveInput(input: EnqueueInput<T>) {
    const value = await input;
    return isASyncIterable(value) ? toPromise(value) : value;
  }
}
