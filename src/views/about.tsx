import { FC, lazy, Suspense } from 'react';

import { Head } from '../components/head';

const TodoList = lazy(() =>
  import('./components/todo-list').then((mod) => ({ default: mod.TodoList })),
);

export const About: FC = () => {
  return (
    <div>
      <Head>
        <title>About</title>
      </Head>
      <h1>About</h1>
      <Suspense fallback={<div>Loading todo 1...</div>}>
        <TodoList />
      </Suspense>
    </div>
  );
};
