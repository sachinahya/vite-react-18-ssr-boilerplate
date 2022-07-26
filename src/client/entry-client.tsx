import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { hydrate, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';

import { AppRoutes } from '../components/routes.js';
import { APP_CONTAINER_ID } from '../constants.js';
import { HeadProvider } from '../lib/head/head-provider.js';
import { createQueryClient } from '../lib/query/create-query-client.js';

const queryClient = createQueryClient();
const dehydratedState = window.__REACT_QUERY_STATE__;

hydrate(queryClient, dehydratedState);

// eslint-disable-next-line unicorn/prefer-query-selector -- It's in a variable already.
const root = document.getElementById(APP_CONTAINER_ID);

if (root) {
  hydrateRoot(
    root,
    <StrictMode>
      <HeadProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </HeadProvider>
    </StrictMode>,
  );
}
