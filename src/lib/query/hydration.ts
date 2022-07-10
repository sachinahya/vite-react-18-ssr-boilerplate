import { DehydratedState } from 'react-query';

type ReactQueryWindow = typeof window & {
  __REACT_QUERY__: Record<string, DehydratedQuery>;
  __REACT_QUERY_HYDRATED_QUERIES__: Set<string>;
};

export type DehydratedQuery = DehydratedState['queries'][number];

export const bootstrapQueryStateInBrowser = (): string =>
  `window.__REACT_QUERY__ = window.__REACT_QUERY__ || {};`;

export const getDehydratedQueryAssignment = (query: DehydratedQuery): string =>
  `window.__REACT_QUERY__[${JSON.stringify(query.queryHash)}] = ${JSON.stringify(query)};`;

export const getDehydratedQuery = (queryHash: string): DehydratedQuery | undefined => {
  const state = window as ReactQueryWindow;
  return state.__REACT_QUERY__[queryHash];
};

export const setHydratedOnClient = (queryHash: string): void => {
  const state = window as ReactQueryWindow;
  state.__REACT_QUERY_HYDRATED_QUERIES__ ||= new Set<string>();
  state.__REACT_QUERY_HYDRATED_QUERIES__.add(queryHash);
};

export const isHydratedOnClient = (queryHash: string): boolean => {
  const state = window as ReactQueryWindow;
  return state.__REACT_QUERY_HYDRATED_QUERIES__?.has(queryHash) ?? false;
};
