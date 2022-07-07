import { FC, ReactElement } from 'react';
import { Outlet } from 'react-router-dom';

import {} from './app.css';

export interface AppProps {
  url?: string;
  lang?: string;
  styles?: string[];
  seo?: ReactElement;
  title?: string;
}

export const App: FC<AppProps> = ({ lang, styles = [], seo, title }) => {
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
        <div>
          <h6>App</h6>
          <Outlet />
        </div>
      </body>
    </html>
  );
};
