import { FC, ReactElement } from 'react';
import { Helmet } from 'react-helmet-async';

export type HeadChild = ReactElement | null;

export interface HeadProps {
  children?: HeadChild | HeadChild[];
}

export const Head: FC<HeadProps> = ({ children }) => {
  return <Helmet prioritizeSeoTags>{children}</Helmet>;
};
