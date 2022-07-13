import { FilledContext } from 'react-helmet-async';

import { HeadContext } from './head-provider.js';

export const getInitialSsrHead = (context: HeadContext): string => {
  const { helmet } = context as FilledContext;

  return (
    helmet.title.toString() +
    helmet.priority.toString() +
    helmet.meta.toString() +
    helmet.link.toString() +
    helmet.script.toString()
  );
};
