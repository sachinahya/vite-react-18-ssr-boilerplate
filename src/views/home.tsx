import { FC, lazy, Suspense } from 'react';

const TodoList = lazy(() =>
  import('./components/todo-list').then((mod) => ({ default: mod.TodoList })),
);

export const Home: FC = () => {
  return (
    <div>
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
