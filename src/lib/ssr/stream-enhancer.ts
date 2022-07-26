import { SsrDataWriter } from './ssr-data.js';

export interface StreamEnhancer {
  readonly scriptKey: string;

  /**
   * Fired immediately before React writes to the response stream.
   *
   * @param writer A function to write a chunk to the stream.
   */
  onBeforeWrite(writer: SsrDataWriter): void;
}
