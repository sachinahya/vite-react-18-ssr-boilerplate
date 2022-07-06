import { FC, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const About = lazy(() => import('../views/about').then((mod) => ({ default: mod.About })));
const Contact = lazy(() => import('../views/contact').then((mod) => ({ default: mod.Contact })));
const Home = lazy(() => import('../views/home').then((mod) => ({ default: mod.Home })));

import { App, AppProps } from './app';

export interface AppRoutesProps extends AppProps {}

export const AppRoutes: FC<AppRoutesProps> = (props) => {
  return (
    <Routes>
      <Route path="/" element={<App {...props} />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  );
};
