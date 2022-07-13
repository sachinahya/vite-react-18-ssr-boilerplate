import { Query, QueryClient, DehydratedState } from 'react-query';

import {
  bootstrapQueryStateInBrowser,
  getDehydratedQueryAssignment,
} from '../../../lib/query/hydration.js';
import { StreamWriter } from '../writers/stream-writer.js';

import { StreamEnhancer } from './stream-enhancer.js';

type DehydratedQuery = DehydratedState['queries'][number];

export class ReactQueryStreamEnhancer implements StreamEnhancer {
  scriptKey: string = 'react_query';

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

  onBeforeWrite(writer: StreamWriter): void {
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

    const stringifiedQueries = this.#stringifyQueries(readyQueries);
    writer.writeImmediateScript(stringifiedQueries);
  }

  #stringifyQueries(queries: Query[]): string {
    const scriptQueryAssignments: string[] = [
      // Ensure the global variable is defined.
      bootstrapQueryStateInBrowser(),
    ];

    for (const query of queries) {
      // Dehydrate the query to a plain object.
      const dehydratedQuery = this.#dehydrateQuery(query);

      // Stringify the query into code that will assign it to the global window object.
      const queryAssignment = getDehydratedQueryAssignment(dehydratedQuery);

      scriptQueryAssignments.push(queryAssignment);
      this.#dehydratedQueryHashes.add(query.queryHash);
    }

    return scriptQueryAssignments.join('\n');
  }

  /**
   * This is just a copy from the react-query repo.
   */
  #dehydrateQuery(query: Query): DehydratedQuery {
    return {
      state: query.state,
      queryKey: query.queryKey,
      queryHash: query.queryHash,
    };
  }
}
