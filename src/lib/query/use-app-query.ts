import {
  DehydratedState,
  hashQueryKey,
  hydrate,
  QueryFunction,
  QueryKey,
  useQuery,
  useQueryClient,
} from 'react-query';

import { getDehydratedQuery, isHydratedOnClient, setHydratedOnClient } from './hydration.js';

const getDehydratedQueryStateFromDom = (
  queryKey: QueryKey,
): Partial<DehydratedState> | undefined => {
  const queryHash = hashQueryKey(queryKey);

  if (isHydratedOnClient(queryHash)) {
    // Query has already been hydrated. Don't hydrate it again.
    return;
  }

  // Get the dehydrated query written by the server.
  const dehydratedQuery = getDehydratedQuery(queryHash);

  if (dehydratedQuery) {
    // The server won't write the same query more than once, so there's no need to run hydration
    // more than once on the client.
    setHydratedOnClient(queryHash);

    return { queries: [dehydratedQuery] };
  }
};

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
    // Extract the dehydrated query written by the server shortly before this hook ran.
    const dehydratedQuery = getDehydratedQueryStateFromDom(queryKey);

    if (dehydratedQuery) {
      // Hydrate the query before we run useQuery.
      hydrate(queryClient, dehydratedQuery);
    }
  }

  const { data, refetch } = useQuery<T>(queryKey, fn);

  return {
    result: data as T,
    refetch: () => {
      void refetch();
    },
  };
};
