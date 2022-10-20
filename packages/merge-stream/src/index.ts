import { PassThrough, Readable } from 'node:stream';

export interface MergeStreamInterface {
  add: (...sources: Readable[]) => MergeStream;
  isEmpty: () => boolean;
}

class MergeStream extends PassThrough implements MergeStreamInterface {
  #sources = new Array<NodeJS.ReadableStream>();

  constructor() {
    super({ objectMode: true });
    super.setMaxListeners(0);
  }

  add(...sources: Readable[]): MergeStream {
    sources.forEach(source => {
      this.#sources.push(source);
      source
        .once('end', () => this.#remove(source))
        .once('error', err => super.emit('error', err))
        .pipe(this, { end: false });
    });
    return this;
  }

  isEmpty(): boolean {
    return this.#sources.length === 0;
  }

  #remove(source: Readable) {
    this.#sources = this.#sources.filter(s => s !== source);
    if (!this.#sources.length && super.readable) super.push(null);
  }
}

export const mergeStream = (...sources: Readable[]): MergeStreamInterface => {
  const ms = new MergeStream();
  ms.add(...sources);
  return ms;
};
