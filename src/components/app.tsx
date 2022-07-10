import { FC } from 'react';
import { Link, Outlet } from 'react-router-dom';

import {} from './app.css';

export interface AppProps {
  url?: string;
}

export const App: FC<AppProps> = () => {
  return (
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
  );
};
