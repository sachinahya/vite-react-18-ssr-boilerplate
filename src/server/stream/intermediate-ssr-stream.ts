import { Writable } from 'stream';

import { SsrDataWriter } from '../../lib/ssr/ssr-data.js';
import { StreamEnhancer } from '../../lib/ssr/stream-enhancer.js';

export class IntermediateSsrStream extends Writable {
  #parentWritable: Writable;
  #enhancers: StreamEnhancer[];
  #writeFn: (chunk: unknown) => void;

  constructor(writable: Writable, enhancers: StreamEnhancer[]) {
    super();
    this.#parentWritable = writable;
    this.#enhancers = enhancers;
    this.#writeFn = (chunk) => {
      writable.write(chunk);
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
      const writer = new SsrDataWriter(enhancer.scriptKey, this.#writeFn);
      enhancer.onBeforeWrite(writer);
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
