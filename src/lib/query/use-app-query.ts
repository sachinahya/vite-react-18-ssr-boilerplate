import {
  hashQueryKey,
  hydrate,
  QueryFunction,
  QueryKey,
  useQuery,
  useQueryClient,
} from 'react-query';

import { ReactQueryStreamReader } from './hydration.js';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Never called on the server.
const reactQuerySsrReader = import.meta.env.SSR ? undefined! : new ReactQueryStreamReader();

export const useAppQuery = <T>(
  queryKey: QueryKey,
  fn: QueryFunction<T>,
): { result: T; refetch: () => void } => {
  const queryClient = useQueryClient();

  /**
   * queryId is used as an id for a div with data for a dehydration process
   * The data will be there after react-component, which uses current query,
   * was rendered and was streamed to a client
   *
   * For more info checkout ReactStreamRenderEnhancer
   */
  if (!import.meta.env.SSR) {
    const queryHash = hashQueryKey(queryKey);

    // Get the dehydrated query written by the server.
    const dehydratedQuery = reactQuerySsrReader.readDataChunk(queryHash);

    if (dehydratedQuery) {
      // Hydrate the query before we run useQuery.
      hydrate(queryClient, { queries: [dehydratedQuery] });

      // The server won't write the same query more than once.
      // So we don't need it around any more.
      reactQuerySsrReader.deleteDataChunk(queryHash);
    }
  }

  // By the time the query hook runs the data will have been hydrated.
  // It won't be fetched on the client if it's not stale.
  const { data, refetch } = useQuery<T>(queryKey, fn);

  return {
    result: data as T,
    refetch: () => {
      void refetch();
    },
  };
};
