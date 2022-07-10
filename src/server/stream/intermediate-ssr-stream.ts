import { Writable } from 'stream';

import { StreamEnhancer } from './enhancers/stream-enhancer';
import { NodeStreamWriter } from './writers/node-stream-writer';

export class IntermediateSsrStream extends Writable {
  #parentWritable: Writable;
  #enhancers: StreamEnhancer[];

  constructor(writable: Writable, enhancers: StreamEnhancer[]) {
    super();
    this.#parentWritable = writable;
    this.#enhancers = enhancers;
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
      const writer = new NodeStreamWriter(this.#parentWritable, enhancer.scriptKey);
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
