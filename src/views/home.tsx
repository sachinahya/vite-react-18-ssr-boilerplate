import { FC, lazy, Suspense } from 'react';

import { Head } from '../components/head.js';

const Picture = lazy(() =>
  import('../components/picture.js').then((mod) => ({ default: mod.Picture })),
);
const TodoList = lazy(() =>
  import('./components/todo-list.js').then((mod) => ({ default: mod.TodoList })),
);

export const Home: FC = () => {
  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>
      <h1>Home</h1>
      <button
        onClick={(event) => {
          console.log(event);
        }}
      >
        Test
      </button>
      <Suspense fallback={<div>Loading todo 1...</div>}>
        <TodoList />
        <TodoList />
      </Suspense>
      <Suspense fallback={<div>Loading something else...</div>}>
        <Picture id="1" />
      </Suspense>
    </div>
  );
};
