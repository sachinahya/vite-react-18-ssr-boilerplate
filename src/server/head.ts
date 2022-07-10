import { HeadStore } from '../lib/head';

export const getHead = (head: HeadStore): string => {
  const state = head.getState();
  return `<head><title>${state.title}</title><meta charset="utf8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>`;
};
