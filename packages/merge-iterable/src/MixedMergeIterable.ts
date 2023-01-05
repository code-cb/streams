import { ParallelMergeIterable } from 'ParallelMergeIterable.js';
import { SerialMergeIterable } from 'SerialMergeIterable.js';
import { EnqueueInput, MergeIterableOptions } from 'types.js';

export class MixedMergeIterable<T = string> extends SerialMergeIterable<T> {
  private readonly parallelIterable: ParallelMergeIterable<T>;

  constructor(name: string, options?: MergeIterableOptions) {
    super(name, options);
    this.parallelIterable = new ParallelMergeIterable(name, options);
  }

  enqueueAsync(input: EnqueueInput<T>): this {
    this.parallelIterable.enqueue(input);
    return this;
  }

  protected override async *iterate(): AsyncGenerator<
    Awaited<T>,
    void,
    undefined
  > {
    yield* super.iterate();
    yield* this.parallelIterable;
  }
}
