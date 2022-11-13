export const name = 'split';
import { Transform, TransformCallback, TransformOptions } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';

type Mapper = (s: string) => string;

interface SkipOptions extends TransformOptions {
  maxLength?: number;
  skipOverflow?: boolean;
}

const defaultMapper: Mapper = s => s;

export class Split extends Transform {
  readonly #decoder = new StringDecoder('utf-8');
  #last = '';
  readonly #mapper: Mapper;
  readonly #matcher: string | RegExp;
  readonly #maxLength;
  #overflow = false;
  readonly #skipOverflow: boolean;

  constructor(
    matcher: string | RegExp = /\r?\n/,
    mapper: (text: string) => string = defaultMapper,
    { maxLength, skipOverflow = false, ...options }: SkipOptions = {},
  ) {
    super({ ...options, autoDestroy: true, readableObjectMode: true });
    this.#mapper = mapper;
    this.#matcher = matcher;
    this.#maxLength = maxLength;
    this.#skipOverflow = skipOverflow;
  }

  override _flush(callback: TransformCallback): void {
    const remaining = this.#last + this.#decoder.end();
    if (remaining) {
      try {
        this.push(this.#mapper(remaining));
      } catch (error) {
        return callback(error as Error);
      }
    }
    return callback();
  }

  override _transform(
    chunk: any,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    let parts: string[];

    // Line buffer is full. Skip to start of next line
    if (this.#overflow) {
      const text = this.#decoder.write(chunk);
      parts = text.split(this.#matcher);

      // Line ending not found. Discard entire chunk
      if (parts.length === 1) return callback();

      // Line ending found. Discard trailing fragment of previous line and reset overflow state
      parts.shift();
      this.#overflow = false;
    } else {
      const text = this.#last + this.#decoder.write(chunk);
      parts = text.split(this.#matcher);
    }

    this.#last = parts.pop() || '';

    try {
      parts.forEach(part => this.push(this.#mapper(part)));
    } catch (error) {
      return callback(error as Error);
    }

    this.#overflow = !!this.#maxLength && this.#last.length > this.#maxLength;

    if (this.#overflow && !this.#skipOverflow)
      return callback(new Error('maximum buffer reached'));

    return callback();
  }
}
