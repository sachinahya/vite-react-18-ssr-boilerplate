import { FC, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const About = lazy(() => import('../views/about.js').then((mod) => ({ default: mod.About })));
const Contact = lazy(() => import('../views/contact.js').then((mod) => ({ default: mod.Contact })));
const Home = lazy(() => import('../views/home.js').then((mod) => ({ default: mod.Home })));

import { App, AppProps } from './app.js';

export interface AppRoutesProps extends AppProps {}

export const AppRoutes: FC<AppRoutesProps> = (props) => {
  return (
    <Routes>
      <Route path="/" element={<App {...props} />}>
        <Route
          index
          element={
            <Suspense fallback="Loading...">
              <Home />
            </Suspense>
          }
        />
        <Route
          path="about"
          element={
            <Suspense fallback="Loading...">
              <About />
            </Suspense>
          }
        />
        <Route
          path="contact"
          element={
            <Suspense fallback="Loading...">
              <Contact />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
};
