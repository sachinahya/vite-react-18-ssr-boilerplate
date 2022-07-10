import { FC, useEffect } from 'react';

import { useHeadContext } from '../lib/head';

export interface HeadProps {
  title?: string;
}

export const Head: FC<HeadProps> = ({ title }) => {
  const context = useHeadContext();

  if (import.meta.env.SSR && title) {
    context.setState(title);
  }

  useEffect(() => {
    if (title && title !== document.title) {
      document.title = title;
    }
  }, [title]);

  return null;
};
