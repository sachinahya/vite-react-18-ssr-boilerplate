import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { StaticRouter } from 'react-router-dom/server';

import { AppProps } from '../components/app.js';
import { Head } from '../components/head.js';
import { AppRoutes } from '../components/routes.js';
import { HeadContext, HeadProvider } from '../lib/head/head-provider.js';
import { createQueryClient } from '../lib/query/create-query-client.js';

export interface RenderAppOptions extends AppProps {
  url: string;
  headContext: HeadContext;
  stylesheets?: string[];
}

export const render = ({
  url,
  headContext,
  stylesheets,
  ...props
}: RenderAppOptions): Promise<{
  jsx: ReactNode;
  queryClient: QueryClient;
}> => {
  // Initialise the query client to use for this request.
  const queryClient = createQueryClient();

  // Render the app element.
  const jsx = (
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
  );

  return Promise.resolve({
    jsx,
    queryClient,
  });
};
