import { DehydratedState } from 'react-query';

type ReactQueryWindow = typeof window & {
  // Might not be emitted by the server if there were no queries.
  __REACT_QUERY__?: Record<string, DehydratedQuery>;
  // Initialised lazily by the client when needed.
  __REACT_QUERY_HYDRATED_QUERIES__?: Set<string>;
};

const state = (typeof window !== 'undefined' ? window : undefined) as ReactQueryWindow;

export type DehydratedQuery = DehydratedState['queries'][number];

export const bootstrapQueryStateInBrowser = (): string =>
  `window.__REACT_QUERY__ = window.__REACT_QUERY__ || {};`;

export const getDehydratedQueryAssignment = (query: DehydratedQuery): string =>
  `window.__REACT_QUERY__[${JSON.stringify(query.queryHash)}] = ${JSON.stringify(query)};`;

export const getDehydratedQuery = (queryHash: string): DehydratedQuery | undefined => {
  return state.__REACT_QUERY__?.[queryHash];
};

export const setHydratedOnClient = (queryHash: string): void => {
  state.__REACT_QUERY_HYDRATED_QUERIES__ ??= new Set<string>();
  state.__REACT_QUERY_HYDRATED_QUERIES__.add(queryHash);
};

export const isHydratedOnClient = (queryHash: string): boolean => {
  return state.__REACT_QUERY_HYDRATED_QUERIES__?.has(queryHash) ?? false;
};
