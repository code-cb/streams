import { BaseMergeIterable } from 'BaseMergeIterable.js';
import { EnqueueInput, MergeIterableOptions } from 'types.js';
import { isASyncIterable, isIterable } from 'utils.js';

export class SerialMergeIterable<T = string> extends BaseMergeIterable<T> {
  private readonly queue = new Array<EnqueueInput<T>>();

  constructor(
    name: string,
    private readonly options: MergeIterableOptions = {},
  ) {
    super(name);
  }

  protected enqueueImpl(input: EnqueueInput<T>): void {
    this.queue.push(input);
  }

  protected async *iterateImpl(): AsyncIterable<Awaited<T>> {
    const { excludeStringsAsIterable: excludeStrings = true } = this.options;
    for (const input of this.queue) {
      const value = await input;
      if (isASyncIterable(value) || isIterable(value, { excludeStrings })) {
        for await (const item of value) {
          this.onYield(item);
          yield item;
        }
      } else {
        this.onYield(value);
        yield value;
      }
    }
  }
}
