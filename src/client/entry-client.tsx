import { hydrateRoot } from 'react-dom/client';
import { hydrate, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';

import { AppRoutes } from '../components/routes';
import { createQueryClient } from '../lib/query/create-query-client';

const queryClient = createQueryClient();
const dehydratedState = window.__REACT_QUERY_STATE__;

hydrate(queryClient, dehydratedState);

hydrateRoot(
  document,
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </QueryClientProvider>,
);
