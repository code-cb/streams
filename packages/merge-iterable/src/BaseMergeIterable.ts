/** #devOnlyStart */
import { debuglog } from 'node:util';
/** #devOnlyEnd */
import { EnqueueInput, MergeIterable } from 'types.js';

export abstract class BaseMergeIterable<T> implements MergeIterable<T> {
  /** #devOnlyStart */
  private readonly contents = new Array<Awaited<T>>();
  private readonly debug = debuglog(this.constructor.name);
  /** #devOnlyEnd */
  private initialized = false;
  protected readonly ready = Promise.resolve().then(
    () => (this.initialized = true),
  );

  private get prefix(): string {
    return `[${this.constructor.name}:${this.name}]`;
  }

  constructor(private readonly name: string) {}

  protected abstract enqueueImpl(input: EnqueueInput<T>): void;
  protected abstract iterateImpl(): AsyncIterable<Awaited<T>>;

  [Symbol.asyncIterator](): AsyncIterator<Awaited<T>> {
    return this.iterate();
  }

  enqueue(input: EnqueueInput<T>): this {
    if (this.initialized)
      throw new Error(`${this.prefix} Cannot enqueue after initialization`);
    /** #devOnlyStart */
    this.log(`Enqueue ${input}`);
    /** #devOnlyEnd */
    this.enqueueImpl(input);
    return this;
  }

  protected async *iterate(): AsyncGenerator<Awaited<T>, void, undefined> {
    await this.ready;
    yield* this.iterateImpl();
    /** #devOnlyStart */
    this.log(`End ${this.contents}`);
    /** #devOnlyEnd */
  }

  /** #devOnlyStart */
  protected log(message: string): void {
    this.debug(`${this.prefix} ${message}`);
  }
  /** #devOnlyEnd */

  protected onYield(_content: Awaited<T>) {
    /** #devOnlyStart */
    this.log(`Yield ${_content}`);
    this.contents.push(_content);
    /** #devOnlyEnd */
  }
}
