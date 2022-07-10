export interface StreamWriter {
  write(chunk: unknown): void;
}

export interface StreamEnhancer {
  /**
   * Fired immediately before React writes to the response stream.
   *
   * @param writer A function to write a chunk to the stream.
   */
  onBeforeWrite(writer: StreamWriter): void;
}
