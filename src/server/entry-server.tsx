import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
// @ts-expect-error -- No package exports entry for server.
import { StaticRouter } from 'react-router-dom/server';

import { AppProps } from '../components/app.js';
import { Head } from '../components/head.js';
import { AppRoutes } from '../components/routes.js';
import { HeadContext, HeadProvider } from '../lib/head/head-provider.js';
import { createQueryClient } from '../lib/query/create-query-client.js';
import { createSsrContext, SsrContext, SsrContextProvider } from '../lib/ssr-context.js';

export interface RenderAppOptions extends AppProps {
  url: string;
  stylesheets?: string[];
}

export interface RenderAppResult {
  jsx: ReactNode;
  queryClient: QueryClient;
  ssrContext: SsrContext;
  headContext: HeadContext;
}

export const render = ({
  url,
  stylesheets,
  ...props
}: RenderAppOptions): Promise<RenderAppResult> => {
  // Initialise the query client to use for this request.
  const queryClient = createQueryClient();

  const headContext: HeadContext = {};
  const ssrContext = createSsrContext();

  // Render the app element.
  const jsx = (
    <SsrContextProvider context={ssrContext}>
      <HeadProvider context={headContext}>
        <Head>
          {stylesheets
            ? stylesheets.map((href) => <link key={href} href={href} rel="stylesheet" />)
            : null}
        </Head>
        <QueryClientProvider client={queryClient}>
          <StaticRouter location={url}>
            <AppRoutes {...props} />
          </StaticRouter>
        </QueryClientProvider>
      </HeadProvider>
    </SsrContextProvider>
  );

  return Promise.resolve({
    jsx,
    queryClient,
    ssrContext,
    headContext,
  });
};
