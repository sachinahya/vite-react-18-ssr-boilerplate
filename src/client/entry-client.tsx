import { hydrateRoot } from 'react-dom/client';
import { QueryClient, hydrate, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';

import { AppRoutes } from '../components/routes';
import { queryClientDefaultOptions } from '../lib/query-client';

const queryClient = new QueryClient({ defaultOptions: queryClientDefaultOptions });
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
