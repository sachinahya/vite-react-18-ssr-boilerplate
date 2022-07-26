import { ReactNode, StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
// @ts-expect-error -- No package exports entry for server.
import { StaticRouter } from 'react-router-dom/server';

import { AppProps } from '../components/app.js';
import { AppRoutes } from '../components/routes.js';
import { HeadContext, HeadProvider } from '../lib/head/head-provider.js';
import { createQueryClient } from '../lib/query/create-query-client.js';
import { SsrContextType, SsrContextProvider } from '../lib/ssr/ssr-context.js';

export interface RenderAppOptions extends AppProps {
  url: string;
  ssrContext: SsrContextType;
}

export interface RenderAppResult {
  jsx: ReactNode;
  queryClient: QueryClient;
  headContext: HeadContext;
}

export const render = ({
  url,
  ssrContext,
  ...props
}: RenderAppOptions): Promise<RenderAppResult> => {
  // Initialise the query client to use for this request.
  const queryClient = createQueryClient();

  const headContext: HeadContext = {};

  // Render the app element.
  const jsx = (
    <StrictMode>
      <SsrContextProvider context={ssrContext}>
        <HeadProvider context={headContext}>
          <QueryClientProvider client={queryClient}>
            <StaticRouter location={url}>
              <AppRoutes {...props} />
            </StaticRouter>
          </QueryClientProvider>
        </HeadProvider>
      </SsrContextProvider>
    </StrictMode>
  );

  return Promise.resolve({
    jsx,
    queryClient,
    headContext,
  });
};
