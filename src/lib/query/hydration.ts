import { Query, QueryClient, DehydratedState } from 'react-query';

import { SsrDataReader, SsrDataWriter } from '../hydration/ssr-data.js';
import { StreamEnhancer } from '../hydration/stream-enhancer.js';

type DehydratedQuery = DehydratedState['queries'][number];

const REACT_QUERY_SCRIPT_KEY = 'react_query';

/**
 * This is just a copy from the react-query repo.
 */
const dehydrateQuery = (query: Query): DehydratedQuery => {
  return {
    state: query.state,
    queryKey: query.queryKey,
    queryHash: query.queryHash,
  };
};

export class ReactQueryStreamReader extends SsrDataReader<DehydratedQuery> {
  constructor() {
    super(REACT_QUERY_SCRIPT_KEY);
  }
}

export class ReactQueryStreamEnhancer implements StreamEnhancer {
  readonly scriptKey: string = REACT_QUERY_SCRIPT_KEY;

  /**
   * The query client scoped to the current request.
   */
  #queryClient: QueryClient;

  /**
   * Hashes of queries that have been dehydrated so far.
   */
  #dehydratedQueryHashes: Set<string>;

  constructor(queryClient: QueryClient) {
    this.#queryClient = queryClient;
    this.#dehydratedQueryHashes = new Set<string>();
  }

  onBeforeWrite(writer: SsrDataWriter): void {
    const queryClientCache = this.#queryClient.getQueryCache().getAll();

    // Exit early if there are no new queries to dehydrate.
    // Performance is key: we want to do as little work as possible as this blocks the streaming.
    if (queryClientCache.length === this.#dehydratedQueryHashes.size) {
      return;
    }

    // We have more queries to hydrate since last time so let's find them.
    const readyQueries = queryClientCache.filter((query) => {
      // Get successful queries that we have not processed yet.
      return query.state.status === 'success' && !this.#dehydratedQueryHashes.has(query.queryHash);
    });

    if (readyQueries.length === 0) {
      // Queries are not successful (yet) so exit early.
      return;
    }

    const dehydratedQueries = readyQueries.map((query) => dehydrateQuery(query));

    writer.emitDataChunks(
      dehydratedQueries.map((query) => ({
        id: query.queryHash,
        data: query,
      })),
    );
  }
}
