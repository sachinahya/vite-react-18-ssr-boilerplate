import { DefaultOptions } from 'react-query';

export const queryClientDefaultOptions: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: import.meta.env.PROD,
    suspense: true,
    staleTime: 10_000,
  },
};
