import { StreamWriter } from '../writers/stream-writer';

export interface StreamEnhancer {
  readonly scriptKey: string;

  /**
   * Fired immediately before React writes to the response stream.
   *
   * @param writer A function to write a chunk to the stream.
   */
  onBeforeWrite(writer: StreamWriter): void;
}
