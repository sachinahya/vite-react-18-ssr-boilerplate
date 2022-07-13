import { FC } from 'react';
import { Link, Outlet } from 'react-router-dom';

import {} from './app.css.js';
import { Head } from './head.js';

export interface AppProps {}

export const App: FC<AppProps> = () => {
  return (
    <>
      <Head>
        <title>App</title>
        <meta charSet="utf8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div>
        <h6>App</h6>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
        <Outlet />
      </div>
    </>
  );
};
