import 'cross-fetch/polyfill';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { StaticRouter } from 'react-router-dom/server';

import { AppProps } from '../components/app';
import { AppRoutes } from '../components/routes';
import { fetchTodo } from '../data/fetch-todo';
import { queryClientDefaultOptions } from '../lib/query-client';

export interface RenderAppOptions extends AppProps {
  url: string;
}

export const render = async (
  props: RenderAppOptions,
): Promise<{
  jsx: ReactNode;
  queryClient: QueryClient;
}> => {
  // Initialise the query client to use for this render.
  const queryClient = new QueryClient({ defaultOptions: queryClientDefaultOptions });

  // void Promise.all([
  //   queryClient.prefetchQuery(['todo', 1], () => fetchTodo(1), {}),
  //   queryClient.prefetchQuery(['todo', 2], () => fetchTodo(2), {}),
  // ]);
  // void queryClient.prefetchQuery(['todo', 3], () => fetchTodo(3), {});

  // Render the app element.
  const jsx = (
    <QueryClientProvider client={queryClient}>
      <StaticRouter location={props.url}>
        <AppRoutes {...props} />
      </StaticRouter>
    </QueryClientProvider>
  );

  return {
    jsx,
    queryClient,
  };
};
