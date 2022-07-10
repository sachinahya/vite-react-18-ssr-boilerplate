import { QueryClient } from 'react-query';

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: import.meta.env.PROD,
        keepPreviousData: true,
        suspense: true,
        useErrorBoundary: true,
      },
    },
  });
