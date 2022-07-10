import { Query, QueryClient, DehydratedState } from 'react-query';
import { v4 as uuid } from 'uuid';

import {
  bootstrapQueryStateInBrowser,
  getDehydratedQueryAssignment,
} from '../../lib/query/hydration';

import { StreamEnhancer, StreamWriter } from './stream-enhancer';

type DehydratedQuery = DehydratedState['queries'][number];

export class ReactQueryStreamEnhancer implements StreamEnhancer {
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
    const scriptElementHtml = this.#generateScriptHtml(stringifiedQueries);

    // Write the script into the stream before React renders the component HTML.
    writer.write(scriptElementHtml);
  }

  #stringifyQueries(queries: Query[]): string {
    const scriptQueryAssignments: string[] = [];

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

  #generateScriptHtml(stringifiedQueries: string): string {
    const id = uuid().replaceAll('-', '');

    // Give each script element and
    const scriptId = 'react_query_' + id;
    const scriptVarName = 'react_query_script_' + id;

    // We inject a script that executes right before the next chunk is parsed.
    // It assigns each dehydrated query to the window object so the client can hydrate it.
    // The script element removes itself from the DOM before React sees it which allows
    // hydration to work properly.
    const scriptContent = [
      // Ensure the global variable is defined.
      bootstrapQueryStateInBrowser(),
      `var ${scriptVarName} = document.createElement('script');`,
      `${scriptVarName}.innerHTML = ${JSON.stringify(stringifiedQueries)};`,
      `document.body.appendChild(${scriptVarName});`,
      `document.getElementById("${scriptId}").remove();`,
    ].join('\n');

    return `<script id="${scriptId}">${scriptContent}</script>`;
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
