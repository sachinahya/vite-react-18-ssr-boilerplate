import { FC, lazy, Suspense } from 'react';

import { Head } from '../components/head';

const TodoList = lazy(() =>
  import('./components/todo-list').then((mod) => ({ default: mod.TodoList })),
);

export const Home: FC = () => {
  return (
    <div>
      <Head title="Home" />
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
      </Suspense>
    </div>
  );
};
