import { wrapImmediateScript } from './script.js';

/**
 * Map of chunk ID and corresponding data.
 */
type SsrDataChunk<T = unknown> = Record<string, T | undefined>;

/**
 * Map of script keys to chunk entries.
 */
type ChunkedSsrData<T> = Record<string, SsrDataChunk<T>>;

/**
 * Map of script keys and corresponding data.
 */
type SsrData<T = unknown> = Record<string, T>;

export interface ChunkToWrite<T> {
  id: string;
  data: T;
}

const SSR_CHUNKS_KEY = '__ssr_chunks__';
const SSR_DATA_KEY = '__ssr_data__';

type GlobalSsrData<T> = Window & {
  [SSR_CHUNKS_KEY]: ChunkedSsrData<T>;
  [SSR_DATA_KEY]: SsrData<T>;
};

export const getGlobalBootstrap = (keys?: string[]): string => {
  const keyInitialisers = keys
    ?.map((key) => `window.${SSR_CHUNKS_KEY}[${JSON.stringify(key)}] ??= {};`)
    .join('');
  return `<script>window.${SSR_CHUNKS_KEY} ??= {};${keyInitialisers || ''}</script>`;
};

export class SsrDataWriter<T = unknown> {
  #dataKey: string;
  #write: (chunk: unknown) => void;

  constructor(dataKey: string, write: (chunk: unknown) => void) {
    this.#dataKey = dataKey;
    this.#write = write;
  }

  emitDataChunks(chunks: ChunkToWrite<T> | ChunkToWrite<T>[]): void {
    const chunksArr = Array.isArray(chunks) ? chunks : [chunks];

    const scriptDataAssignment = chunksArr
      .map(
        ({ id, data }) =>
          `window.${SSR_CHUNKS_KEY}[${JSON.stringify(this.#dataKey)}][${JSON.stringify(
            id,
          )}] = ${JSON.stringify(data)};`,
      )
      .join('\n');

    const scriptContent = wrapImmediateScript(
      `const d = document.createElement('script');` +
        `d.innerHTML = ${JSON.stringify(scriptDataAssignment)};` +
        `document.body.appendChild(d);`,
    );

    this.#write(scriptContent);
  }
}

export abstract class SsrDataReader<T> {
  #dataKey: string;
  #window: GlobalSsrData<T>;

  constructor(dataKey: string) {
    if (import.meta.env.SSR) {
      throw new Error('Cannot use SsrDataReader on the server!');
    }

    this.#dataKey = dataKey;
    this.#window = window as unknown as GlobalSsrData<T>;
  }

  readDataChunk(id: string): T | undefined {
    return this.#window[SSR_CHUNKS_KEY][this.#dataKey]?.[id];
  }

  deleteDataChunk(id: string): void {
    const section = this.#window[SSR_CHUNKS_KEY][this.#dataKey];

    if (section) {
      section[id] = undefined as T | undefined;
    }
  }
}
