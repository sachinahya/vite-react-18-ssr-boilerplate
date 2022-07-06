import { FC, lazy, ReactElement, Suspense } from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Outlet } from 'react-router-dom';

import { delay } from '../lib/delay';

import {} from './app.css';

const Home = lazy(() =>
  delay(0)
    .then(() => import('./home'))
    .then((mod) => ({ default: mod.Home })),
);

export interface AppProps {
  url?: string;
  lang?: string;
  styles?: string[];
  seo?: ReactElement;
  title?: string;
  dev?: {
    preamble: string;
    entryScripts: string[];
  };
}

const Dev: FC<{ preamble: string; entryScripts: string[] }> = (props) => {
  return (
    <div>
      {/* eslint-disable-next-line react/no-danger -- Development only. */}
      <div dangerouslySetInnerHTML={{ __html: props.preamble }} />
      {props.entryScripts.map((src) => (
        <script key={src} type="module" src={src} async />
      ))}
    </div>
  );
};

export const App: FC<AppProps> = ({ lang, styles = [], seo, title, dev }) => {
  return (
    <html lang={lang}>
      <head>
        <title>{title || 'App'}</title>
        <meta charSet="utf8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {styles.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        {seo}
      </head>
      <body>
        {dev && <Dev {...dev} />}
        <div>
          <h6>App</h6>
          <Outlet />
        </div>
      </body>
    </html>
  );
};
