import 'cross-fetch/polyfill';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { StaticRouter } from 'react-router-dom/server';

import { AppProps } from '../components/app';
import { AppRoutes } from '../components/routes';
import { createQueryClient } from '../lib/query/create-query-client';

export interface RenderAppOptions extends AppProps {
  url: string;
}

export const render = (
  props: RenderAppOptions,
): Promise<{
  jsx: ReactNode;
  queryClient: QueryClient;
}> => {
  // Initialise the query client to use for this request.
  const queryClient = createQueryClient();

  // Render the app element.
  const jsx = (
    <QueryClientProvider client={queryClient}>
      <StaticRouter location={props.url}>
        <AppRoutes {...props} />
      </StaticRouter>
    </QueryClientProvider>
  );

  return Promise.resolve({
    jsx,
    queryClient,
  });
};
