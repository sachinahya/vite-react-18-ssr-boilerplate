import { FC, ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';

export type HeadContext = unknown;

export interface HeadProviderProps {
  children?: ReactNode;
  context?: HeadContext;
}

export const HeadProvider: FC<HeadProviderProps> = ({ children, context }) => {
  return <HelmetProvider context={context as Record<string, never>}>{children}</HelmetProvider>;
};
