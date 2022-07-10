import { Writable } from 'stream';

import { StreamEnhancer, StreamWriter } from './stream/stream-enhancer';

export class ReactStreamWriter extends Writable {
  #parentWritable: Writable;
  #enhancers: StreamEnhancer[];
  #streamWriter: StreamWriter;

  constructor(writable: Writable, enhancers: StreamEnhancer[]) {
    super();
    this.#parentWritable = writable;
    this.#enhancers = enhancers;
    this.#streamWriter = {
      write(chunk) {
        writable.write(chunk);
      },
    };
  }

  override _write(
    chunk: unknown,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void,
  ): void {
    if (this.#parentWritable.destroyed) {
      return;
    }

    for (const enhancer of this.#enhancers) {
      enhancer.onBeforeWrite(this.#streamWriter);
    }

    this.#parentWritable.write(chunk, encoding, callback);
  }

  flush(): void {
    const flushableStream = this.#parentWritable as Writable & { flush: unknown };

    if (typeof flushableStream.flush === 'function') {
      flushableStream.flush();
    }
  }
}
