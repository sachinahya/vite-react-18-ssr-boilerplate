import { FC, lazy, Suspense } from 'react';

import { delay } from '../lib/delay';

import * as styles from './home.css';

const Picture = lazy(() =>
  delay(0)
    .then(() => import('./picture'))
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
