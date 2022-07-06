import { dehydrate, QueryClient } from 'react-query';

export const dehydrateQueryClient =
  (queryClient: QueryClient) => (): { dehydratedState: unknown } => {
    /**
     * Currently we can only dehydrate and rehydrate the query cache in one go. So we have to
     * wait until onAllReady to ensure all Suspense boundaries have finished and the useQuery
     * hooks have populated the server-side cache. Then we can fully populate the client-side
     * cache and avoid fetches on the client.
     *
     * One day, we'll be able to progressively hydrate the client-side cache as we stream the
     * HTML by injecting script tags alongside them.
     * https://github.com/reactwg/react-18/discussions/114
     *
     * With onShellReady, we would have to execute prefetchQuery on each query that we want to
     * fetch on the server.
     */
    return { dehydratedState: dehydrate(queryClient) };
  };

export const writeDehydratedState = (
  { dehydratedState }: { dehydratedState: unknown },
  stream: NodeJS.WritableStream,
): void => {
  // Write the dehydrated state after we've streamed the HTML.
  stream.write(
    `<script>window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydratedState)};</script>`,
  );
};
