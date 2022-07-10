export interface StreamWriter {
  write(chunk: unknown): void;
  writeImmediateScript(content: string): void;
}
