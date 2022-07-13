import { FC, lazy, Suspense } from 'react';

import { delay } from '../lib/delay.js';

import * as styles from './home.css.js';

const Picture = lazy(() =>
  delay(0)
    .then(() => import('./picture.js'))
    .then((mod) => ({ default: mod.Picture })),
);

export const Home: FC = () => {
  return (
    <div>
      <h2 className={styles.title}>Hello world!</h2>
      <p>Quid</p>
      <Suspense fallback={<div>Loading Picture...</div>}>
        <Picture id="1" />
      </Suspense>
    </div>
  );
};
