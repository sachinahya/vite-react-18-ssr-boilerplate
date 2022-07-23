import { FilledContext } from 'react-helmet-async';

import { HeadContext } from './head-provider.js';

export const getInitialSsrHead = (context: HeadContext, stylesheets?: string[]): string => {
  const { helmet } = context as FilledContext;
  const linkTags = stylesheets
    ?.map((href) => `<link rel="stylesheet" href="${href}" />`)
    .join('\n');

  return [
    linkTags ?? '',
    helmet.title.toString(),
    helmet.priority.toString(),
    helmet.meta.toString(),
    helmet.link.toString(),
    helmet.script.toString(),
  ].join('\n');
};
